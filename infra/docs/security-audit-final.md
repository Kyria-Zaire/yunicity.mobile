# Audit securite backend - Yunicity

Perimetre audite: `services/api-gateway`, `services/auth-service`, `services/user-service`, `services/community-service`, `services/payment-service`, et `packages/database/prisma/schema.prisma`.

Date d'audit: 17 avril 2026
Type d'audit: revue statique du code source

## Score global

**41 / 100**

Le backend contient de bonnes briques de base (`Better Auth`, cookies `httpOnly`, `Argon2id`, Zod sur plusieurs routes, limites multipart KYC), mais plusieurs controles critiques sont soit non branches, soit permissifs:

- ecritures communautaires possibles sans authentification effective
- upload KYC IDOR sur `POST /users/:id/kyc/upload`
- routes paiement non liees a l'utilisateur authentifie
- cles R2 KYC exposees dans des reponses API
- suppression RGPD incomplete
- rate limiting distribue non garanti

## Resume executif

Les bloqueurs avant production sont:

1. `CRITIQUE` - `POST /users/:id/kyc/upload` ne verifie pas que `:id` correspond a l'utilisateur connecte.
2. `CRITIQUE` - `GET /payments/portal` et `POST /payments/subscribe` acceptent `userId` et `email` fournis par le client sans verifier la session.
3. `HAUTE` - le gateway ne branche pas `requireAuth`, et les routes `posts/tribes` tombent sur `anonymous` au lieu de rejeter sans token.
4. `HAUTE` - les profils utilisateur exposent `kycDocuments` complets, donc les `r2Key` internes.
5. `HAUTE` - `DELETE /users/me` n'efface ni les posts, ni les reactions, ni les docs KYC, ni les sessions.

## 1. Authentification

### Etat des controles

- `Better Auth` est bien configure avec une session de 15 minutes et cookies `httpOnly`/`secure` en production: `services/auth-service/src/auth/index.ts:18-25`, `services/auth-service/src/auth/index.ts:73-83`.
- `/auth/session/verify` rejette bien une session invalide ou expiree: `services/auth-service/src/routes/auth.ts:69-85`.
- Le controle "tous les endpoints proteges rejettent sans token" est **en echec partiel**: plusieurs routes sensibles ne passent pas par un middleware d'authentification central.
- Le lockout a 5 tentatives est **configure mais non fiable**.

### Failles

**A-01 - HAUTE - Middleware d'authentification present mais jamais branche au gateway**

Fichier + ligne exacte:
- `services/api-gateway/src/middleware/auth.ts:19-81`
- `services/api-gateway/src/app.ts:41-46`
- `services/api-gateway/src/routes/proxy.ts:112-115`

Impact concret:
- `requireAuth` et `requireVerified` existent mais ne sont jamais enregistres.
- Le gateway proxifie tout le trafic vers les services sans controle central.
- Toute nouvelle route downstream oubliee par un service devient publiquement atteignable via le gateway.

Correction:
- Declarer une matrice de routes protegees au gateway et appliquer `requireAuth`/`requireVerified` avant `proxyRequest`.
- Refuser par defaut toutes les methodes mutantes (`POST`, `PATCH`, `PUT`, `DELETE`) hors routes explicitement publiques.

**A-02 - HAUTE - Ecritures communautaires acceptees sans token et degradees en `anonymous`**

Fichier + ligne exacte:
- `services/community-service/src/routes/posts.ts:44-49`
- `services/community-service/src/routes/posts.ts:62-64`
- `services/community-service/src/routes/tribes.ts:57-63`
- `services/community-service/src/routes/tribes.ts:77-78`
- `services/community-service/src/routes/tribes.ts:92-93`
- `services/community-service/src/repositories/post.repository.ts:11-22`
- `services/api-gateway/src/routes/proxy.ts:77-87`

Impact concret:
- `POST /posts`, `POST /posts/:id/react`, `POST /tribes`, `POST /tribes/:id/join` et `POST /tribes/:id/leave` ne renvoient pas `401` sans utilisateur.
- L'identite n'est pas resolue pour `/community`; `authorId`/`creatorId` peuvent devenir `anonymous`.
- Cela casse l'exigence "authorId = x-user-id du gateway" et permet des actions non attribuables.

Correction:
- Refuser ces routes si `x-user-id` est absent.
- Faire resoudre la session par le gateway aussi pour `/community` et pas seulement `/users`.
- Supprimer definitivement le fallback `?? 'anonymous'`.

**A-03 - HAUTE - Lockout apres 5 tentatives probablement inoperant avant le sign-in**

Fichier + ligne exacte:
- `services/auth-service/src/routes/auth.ts:15-20`
- `services/auth-service/src/routes/auth.ts:21-34`
- `services/auth-service/src/routes/auth.ts:51-58`

Impact concret:
- Le pre-check du lockout lit `req.body` dans `onRequest`.
- Sur Fastify, `onRequest` s'execute avant le parsing du body; par inference, `body?.email` est donc souvent absent.
- Un compte deja verrouille peut encore atteindre la logique Better Auth au lieu d'etre bloque a `429`.

Correction:
- Deplacer le check du lockout dans `preValidation` ou `preHandler`.
- Ajouter un test d'integration qui verifie qu'un compte avec `lockedUntil > now()` recoit bien `429`.

## 2. Autorisation (IDOR)

### Etat des controles

- `PATCH /users/me` modifie bien uniquement l'utilisateur courant via `x-user-id`: `services/user-service/src/routes/users.ts:211-225`.
- `GET /users/:id` est bien protege contre l'IDOR direct par `requireUserAccess`: `services/user-service/src/routes/users.ts:13-24`, `services/user-service/src/routes/users.ts:63-74`.
- `Follow/Unfollow` utilise bien `followerId` depuis `x-user-id`: `services/user-service/src/routes/users.ts:187-208`.
- Le controle "posts/tribus: authorId = x-user-id du gateway" est **en echec**.

### Failles

**B-01 - CRITIQUE - IDOR sur `POST /users/:id/kyc/upload`**

Fichier + ligne exacte:
- `services/user-service/src/routes/kyc.ts:29-50`
- comparaison utile: `services/user-service/src/routes/kyc.ts:72-73`

Impact concret:
- `assertKycUser` existe mais n'est jamais appele sur l'upload.
- Un appelant peut envoyer un document KYC pour n'importe quel `:id`.
- Cela permet d'empoisonner le dossier KYC d'un autre utilisateur, de declencher un passage en `under_review`, et d'injecter des objets dans le bucket prive.

Correction:
- Ajouter `if (!assertKycUser(req, reply)) return;` en tete du handler `POST /users/:id/kyc/upload`.
- Ajouter un test de non regression: utilisateur `A` ne peut pas uploader pour utilisateur `B`.

**B-02 - HAUTE - Verification OTP email/telephone non liee a la session**

Fichier + ligne exacte:
- `services/user-service/src/routes/users.ts:102-140`
- `services/user-service/src/routes/users.ts:261-299`

Impact concret:
- `POST /users/:id/verify-email` et `POST /users/:id/verify-phone` ne verifient jamais que `x-user-id === :id`.
- La seule barriere est la connaissance du code OTP et un rate limit par IP.
- Un attaquant qui obtient un OTP peut verifier le compte d'un autre utilisateur.

Correction:
- Exiger une session valide correspondant a `:id`.
- Ajouter un rate limit combine `IP + userId`.
- Option plus robuste: utiliser un jeton signe a usage unique lie a l'inscription.

**B-03 - HAUTE - `authorId` et `creatorId` ne sont pas garantis comme provenant du gateway**

Fichier + ligne exacte:
- `services/api-gateway/src/routes/proxy.ts:77-87`
- `services/community-service/src/routes/posts.ts:44-49`
- `services/community-service/src/routes/tribes.ts:57-63`

Impact concret:
- Le gateway ne resolve la session que pour les chemins `/users`.
- Les creations de posts et tribus ne sont donc pas rattachees a l'utilisateur connecte via le chemin nominal du gateway.
- L'exigence de tracabilite applicative est rompue.

Correction:
- Resoudre la session pour toutes les routes mutantes qui propagent `x-user-id`.
- Ajouter une assertion serveur: si `authorId`/`creatorId` absent, refuser la requete.

**B-04 - MOYENNE - La confiance inter-services repose sur un header falsifiable**

Fichier + ligne exacte:
- `services/user-service/src/utils/internal-service.ts:19-25`
- `services/user-service/src/routes/admin.ts:12-16`
- `services/user-service/src/routes/admin.ts:97-100`

Impact concret:
- Le code fait confiance a `x-internal-service` comme simple nom logique.
- Si un service interne est expose hors reseau prive, ce header est trivial a forger.
- Les routes `/internal/*` ne sont pas protegees cryptographiquement.

Correction:
- Ajouter une authentification inter-services reelle: mTLS, JWT interne court, ou HMAC signe par le gateway/service appelant.
- Conserver `x-internal-service` uniquement comme metadonnees, pas comme preuve d'identite.

## 3. Validation des entrees

### Etat des controles

- Plusieurs routes critiques passent bien par Zod: `services/user-service/src/schemas/user.schema.ts:11-27`, `services/community-service/src/routes/posts.ts:5-12`, `services/community-service/src/routes/tribes.ts:6-24`, `services/payment-service/src/routes/payments.ts:7-12`.
- L'upload KYC a une limite multipart de 10 Mo et un seul fichier: `services/user-service/src/routes/kyc.ts:21-25`.
- Le controle "tous les inputs passent par Zod" est **en echec**.

### Failles

**C-01 - MOYENNE - Plusieurs endpoints castent `req.body` ou `req.query` sans Zod**

Fichier + ligne exacte:
- `services/user-service/src/routes/users.ts:106`
- `services/user-service/src/routes/users.ts:265`
- `services/user-service/src/routes/kyc.ts:33`
- `services/user-service/src/routes/kyc.ts:75`
- `services/payment-service/src/routes/payments.ts:36-45`
- `services/payment-service/src/routes/payments.ts:50-79`
- `services/user-service/src/routes/admin.ts:102-108`

Impact concret:
- Types inattendus, champs superflus ou valeurs mal formees peuvent entrer dans la logique metier.
- La surface d'erreur est heterogene selon les routes.
- Les routes de paiement et OTP sont particulierement sensibles.

Correction:
- Introduire des schemas Zod pour `verify-email`, `verify-phone`, `verify-siret`, `payments/portal`, `payments/webhook` et les endpoints `/internal/*`.
- Centraliser la validation dans des helpers Fastify pour eviter les casts bruts.

**C-02 - MOYENNE - Limites de taille JSON non explicites et `profileData` reste peu borne**

Fichier + ligne exacte:
- `services/api-gateway/src/app.ts:16-31`
- `services/user-service/src/schemas/user.schema.ts:19`
- `services/user-service/src/schemas/user.schema.ts:40`

Impact concret:
- Le gateway ne fixe pas de `bodyLimit` explicite.
- `profileData` accepte une map arbitraire; un client peut consommer tout le budget de body JSON avec une structure profonde ou inutile.
- Risque DoS memoire et pollution base/logique metier.

Correction:
- Definir un `bodyLimit` explicite sur le gateway et les services.
- Remplacer `z.record(z.unknown())` par un schema borne ou au minimum une limite sur la taille serialisee et la profondeur.

**C-03 - MOYENNE - Validation KYC basee uniquement sur le `mimetype` fourni par le client**

Fichier + ligne exacte:
- `services/user-service/src/routes/kyc.ts:33`
- `services/user-service/src/routes/kyc.ts:42-43`
- `services/user-service/src/services/kyc.service.ts:44-50`

Impact concret:
- `docType` est caste sans enum Zod.
- Le type de fichier repose sur `file.mimetype`, donc sur une information controlee par le client.
- Un fichier malveillant peut contourner la logique de format attendue tant qu'il passe le scan antivirus.

Correction:
- Valider `docType` avec Zod.
- Verifier la signature binaire du fichier (`magic bytes`) avec `file-type` ou equivalent.
- Verifier la coherence entre `docType`, extension et type detecte.

## 4. Cryptographie

### Etat des controles

- Les mots de passe utilisent bien `Argon2id`: `services/auth-service/src/auth/password.ts:5-20`.
- `AUTH_SECRET` est borne a 32 caracteres minimum: `services/auth-service/src/config/env.ts:18-21`, `services/user-service/src/config/env.ts:15-18`, `services/api-gateway/src/config/env.ts:14`.
- Je n'ai pas trouve de retour direct des secrets Stripe/R2/Auth dans les reponses API.

### Failles

**D-01 - HAUTE - Les cles internes R2 KYC sont exposees dans les reponses utilisateur**

Fichier + ligne exacte:
- `services/user-service/src/repositories/user.repository.ts:4-35`
- `services/user-service/src/repositories/user.repository.ts:37-42`
- `services/user-service/src/repositories/user.repository.ts:169-178`
- `services/user-service/src/routes/users.ts:38`
- `services/user-service/src/routes/users.ts:73`
- `services/user-service/src/routes/admin.ts:39`
- `services/user-service/src/utils/sanitize-user.ts:4-20`

Impact concret:
- `SAFE_SELECT` inclut `kycDocuments: true`, ce qui expose `r2Key`, `reviewerId` et `rejectionReason`.
- `GET /users/me`, `GET /users/:id` et `GET /admin/users` renvoient donc des references internes de stockage.
- En cas de mauvaise configuration du bucket ou d'un futur endpoint de download signe, ces cles deviennent directement exploitables.

Correction:
- Remplacer `kycDocuments: true` par une projection explicite sans `r2Key`.
- Corriger et utiliser `sanitizeUserForApi`; aujourd'hui il vise `verificationStatus.documents` au lieu de `kycDocuments`, donc il ne peut pas proteger les reponses actuelles.

### Observation

La partie "Argon2id" est conforme au besoin. Le principal ecart cryptographique constate dans ce depot n'est pas le hash de mot de passe, mais l'exposition de references internes KYC.

## 5. Paiements

### Etat des controles

- La signature Stripe est bien obligatoire en production: `services/payment-service/src/routes/payments.ts:54-58`.
- Le controle "idempotency sur les webhooks" est **en echec**.

### Failles

**E-01 - CRITIQUE - `subscribe` et `portal` ne sont pas lies a l'utilisateur authentifie**

Fichier + ligne exacte:
- `services/payment-service/src/routes/payments.ts:21-47`
- `services/payment-service/src/services/payment.service.ts:10-47`
- `services/payment-service/src/providers/stripe.provider.ts:28-44`

Impact concret:
- `POST /payments/subscribe` et `GET /payments/portal` font confiance a `userId`/`email` fournis par le client.
- Un attaquant qui connait ou devine ces valeurs peut ouvrir un portail de facturation Stripe ou initier un checkout au nom d'un tiers.
- C'est une faille d'autorisation critique sur une surface de paiement.

Correction:
- Recuperer `userId` uniquement depuis le contexte authentifie (`x-user-id` issu du gateway).
- Rechercher l'email cote serveur a partir du compte courant, pas depuis la query/le body client.

**E-02 - HAUTE - Verification de signature Stripe potentiellement cassante faute de corps brut**

Fichier + ligne exacte:
- `services/payment-service/src/routes/payments.ts:60-68`
- `services/payment-service/src/providers/stripe.provider.ts:105-120`

Impact concret:
- Stripe exige la charge utile brute exacte pour `constructEvent`.
- Ici, si `req.body` est deja parse en objet, le code le reconstruit via `JSON.stringify(req.body)`.
- Par inference, des webhooks legitimes peuvent etre rejetes en production, ce qui desynchronise les abonnements.

Correction:
- Configurer Fastify pour fournir le raw body sur cette route.
- Passer directement les octets recus a `constructWebhookEvent`.

**E-03 - MOYENNE - Aucune idempotence sur les webhooks Stripe**

Fichier + ligne exacte:
- `services/payment-service/src/services/payment.service.ts:50-88`

Impact concret:
- Un replay de `checkout.session.completed` ou `customer.subscription.deleted` retriggera `/internal/update-subscription`.
- Aujourd'hui l'effet est limite a des updates repetes, mais toute extension future (emails, credits, facturation) deviendra vulnerable aux doublons.

Correction:
- Persister les `event.id` deja traites.
- Refuser ou ignorer silencieusement un webhook deja vu.

## 6. RGPD

### Etat des controles

- `GET /users/me/export` exporte bien les donnees du seul utilisateur courant via `x-user-id`: `services/user-service/src/routes/users.ts:228-245`, `services/user-service/src/services/user.service.ts:193-203`, `services/user-service/src/repositories/user.repository.ts:219-259`.
- `DELETE /users/me` lance bien une anonymisation du compte, mais cette anonymisation est **incomplete**.

### Failles

**F-01 - HAUTE - `DELETE /users/me` n'anonymise pas reellement toutes les donnees**

Fichier + ligne exacte:
- `services/user-service/src/repositories/user.repository.ts:261-275`
- `packages/database/prisma/schema.prisma:133-139`
- `packages/database/prisma/schema.prisma:150-159`
- `packages/database/prisma/schema.prisma:166-178`
- `packages/database/prisma/schema.prisma:195-211`
- `packages/database/prisma/schema.prisma:234-288`
- `packages/database/prisma/schema.prisma:327-341`
- `packages/database/prisma/schema.prisma:346-355`

Impact concret:
- Le compte utilisateur est anonymise, mais les relations demeurent: `kycDocuments`, `sessions`, `posts`, `reactions`, `tribeMembers`, `pushSubscriptions`, `follows`.
- Les objets R2 KYC ne sont pas supprimes.
- Les contenus libres (`Post.content`, medias) peuvent continuer a identifier directement la personne.

Correction:
- Construire un workflow RGPD complet:
  - suppression ou anonymisation des posts, reactions et adhesions
  - suppression des sessions actives
  - suppression des objets R2 et des lignes `KycDocument`
  - purge des subscriptions push
  - journal d'audit de la suppression
- Documenter separement les donnees legalement conservables et leur base legale.

## 7. Rate limiting

### Etat des controles

- Le gateway sait utiliser Redis pour le rate limiting global: `services/api-gateway/src/plugins/rate-limit.ts:11-26`.
- Les routes auth sensibles ont un rate limit dedie: `services/api-gateway/src/middleware/auth-sensitive-rate-limit.ts:3-45`.
- Le besoin "Redis store, pas memoire" est **en echec** en production degradee et pour le rate limit auth sensible.

### Failles

**G-01 - MOYENNE - Le rate limiting global retombe en memoire si Redis est indisponible**

Fichier + ligne exacte:
- `services/api-gateway/src/plugins/rate-limit.ts:15-19`
- `services/api-gateway/src/plugins/rate-limit.ts:23-27`

Impact concret:
- En cas de panne Redis, le systeme passe en store local par process.
- En multi-instances, chaque replica a alors son propre compteur.
- La protection DoS devient incoherente au moment precis ou l'infra est deja degradee.

Correction:
- En production, rendre Redis obligatoire pour le rate limit.
- A minima, alerter fortement et passer en mode degrade explicite, pas en silence via `skipOnError: true`.

**G-02 - MOYENNE - Le rate limit specifique auth repose entierement sur une `Map` memoire**

Fichier + ligne exacte:
- `services/api-gateway/src/middleware/auth-sensitive-rate-limit.ts:7`
- `services/api-gateway/src/middleware/auth-sensitive-rate-limit.ts:25-45`

Impact concret:
- Les compteurs OTP/sign-in ne sont pas partages entre replicas.
- Un attaquant peut distribuer ses tentatives et contourner la limite reelle a l'echelle du cluster.

Correction:
- Deplacer ce bucket dans Redis.
- Utiliser une cle du type `auth:${route}:${ip}` avec TTL.

## Controles conformes ou partiellement conformes

Les points suivants sont conformes ou globalement bien engages:

- `PATCH /users/me` ne modifie que l'utilisateur courant: `services/user-service/src/routes/users.ts:211-225`
- `GET /users/:id` ne permet pas de lire le profil d'un autre utilisateur sans `x-user-id` correspondant ou cle admin: `services/user-service/src/routes/users.ts:13-24`, `services/user-service/src/routes/users.ts:63-74`
- `POST /users/:id/follow` et `DELETE /users/:id/follow` utilisent bien le user connecte comme `followerId`: `services/user-service/src/routes/users.ts:187-208`
- `Argon2id` est correctement utilise pour les mots de passe: `services/auth-service/src/auth/password.ts:5-20`
- L'expiration Better Auth est configuree a 15 minutes avec rotation: `services/auth-service/src/auth/index.ts:18-25`
- Le webhook Stripe exige une signature en production: `services/payment-service/src/routes/payments.ts:54-58`
- L'export RGPD retourne uniquement les donnees du user courant: `services/user-service/src/routes/users.ts:228-245`

## Plan de correction priorise

### P0 - immediat

1. Corriger l'IDOR KYC sur `POST /users/:id/kyc/upload`.
2. Lier `payments/portal` et `payments/subscribe` a l'utilisateur authentifie.
3. Refuser toute ecriture community sans `x-user-id`; supprimer le fallback `anonymous`.
4. Cesser d'exposer `r2Key` dans toutes les projections utilisateur.

### P1 - avant ouverture large

1. Brancher `requireAuth`/`requireVerified` au gateway avec politique deny-by-default sur les routes mutantes.
2. Rendre le lockout login reellement operant apres 5 echecs.
3. Lier les endpoints OTP a la session ou a un token signe.
4. Mettre en place le raw body Stripe et l'idempotence webhook.

### P2 - conformite et defense en profondeur

1. Construire un workflow RGPD complet: DB + R2 + sessions + contenu communautaire.
2. Remplacer `x-internal-service` par une authentification inter-services reelle.
3. Uniformiser la validation Zod sur tous les endpoints sensibles.
4. Ajouter des limites de taille explicites et metier sur les payloads JSON.

### P3 - robustesse infra

1. Rendre Redis obligatoire pour le rate limiting de production.
2. Migrer le rate limit auth sensible vers Redis.
3. Ajouter des tests d'integration de securite sur:
   - acces sans session
   - IDOR inter-utilisateurs
   - upload KYC
   - portal Stripe
   - expiration session
   - lockout

## Conclusion

Le backend Yunicity a de bonnes bases techniques, mais l'etat actuel n'est pas assez ferme pour une exposition publique large. Les ecarts les plus graves ne viennent pas d'un manque de bibliotheques de securite, mais de controles non branches ou de routes qui font encore confiance a des donnees client la ou elles devraient faire confiance a la session ou au gateway.

Une fois les P0 et P1 corriges, un score cible superieur a `75/100` est realiste sans changer l'architecture generale.
