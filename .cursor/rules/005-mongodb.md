---
description: MongoDB, Mongoose et patterns de données Yunicity
globs: ["**/models/**/*.ts", "**/repositories/**/*.ts", "**/schemas/**/*.ts"]
alwaysApply: false
---

# MongoDB / Mongoose — Patterns Yunicity

## Les 5 profils — profileData par type

```typescript
// @yunicity/types — interfaces complètes

// Base commune à tous les profils
interface BaseUser {
  _id: string;
  email: string;
  phone: string;
  passwordHash: string; // Argon2id — ne jamais exposer
  profileType: ProfileType;
  verificationStatus: VerificationStatus;
  location: GeoLocation;
  security: SecurityData;
  yunicity: YunicityData;
  subscription: SubscriptionData;
  consent: ConsentData;
  isActive: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// profileData selon le type
interface YunicitizeenData {
  displayName: string;
  avatar?: string; // clé R2 — pas URL publique
  bio?: string;
  interests: string[]; // Pour le matching IA Yu
  quartier?: string;
}

interface CommercialData {
  businessName: string;
  siret: string;          // Vérifié via API Sirene INSEE
  businessType: string;   // Restaurant, Boutique, Service...
  address: string;
  openingHours?: Record<string, string>;
  website?: string;
  description?: string;
  logoKey?: string;       // Clé R2
  coverKey?: string;      // Clé R2
}

interface AssociationData {
  name: string;
  rna: string;            // Numéro RNA — vérifié
  object: string;         // Objet social
  presidentName: string;
  address: string;
  websiteUrl?: string;
  logoKey?: string;
}

interface FreelanceData {
  displayName: string;
  siret?: string;
  profession: string;
  skills: string[];
  portfolioUrl?: string;
  hourlyRate?: number;
  availability: 'available' | 'busy' | 'unavailable';
  avatarKey?: string;
}

interface EcoleData {
  name: string;
  uai?: string;           // Code UAI (académie)
  siret?: string;
  type: 'primaire' | 'college' | 'lycee' | 'superieur' | 'formation' | 'autre';
  address: string;
  website?: string;
  logoKey?: string;
}
```

## Index — Obligatoires et justifiés

```typescript
// Chaque index doit être justifié par une requête réelle

// Index utilisateur — requêtes fréquentes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index({ location: '2dsphere' });  // Requêtes géospatiales — map, reco

// Filtrage par statut — très fréquent (onboarding, admin)
userSchema.index({ profileType: 1, 'verificationStatus.status': 1 });
userSchema.index({ 'verificationStatus.status': 1, profileType: 1 });

// Dashboard admin — tri par date
userSchema.index({ createdAt: -1 });

// Soft delete — exclure les supprimés efficacement
userSchema.index({ deletedAt: 1 }, { sparse: true });
userSchema.index({ isActive: 1, profileType: 1 });

// CRM — partenaires actifs par ville
userSchema.index({ 'location.city': 1, profileType: 1, isActive: 1 });

// Abonnements — Stripe
userSchema.index({ 'subscription.stripeCustomerId': 1 }, { sparse: true });
```

## Requêtes géospatiales — Map Yunicity

```typescript
// Trouver les acteurs locaux autour d'un point (carte)
async function findNearbyActors(params: {
  longitude: number;
  latitude: number;
  radiusInMeters: number;
  profileTypes: ProfileType[];
  limit?: number;
}) {
  return UserModel.find({
    profileType: { $in: params.profileTypes },
    'verificationStatus.status': 'verified',
    isActive: true,
    deletedAt: null,
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [params.longitude, params.latitude] },
        $maxDistance: params.radiusInMeters,
      },
    },
  })
  .select('profileType profileData location yunicity') // Projection minimale
  .limit(params.limit ?? 50)                          // Toujours limiter
  .lean<User[]>();
}
```

## Pagination — Cursor-based (pas d'offset)

```typescript
// ✅ Cursor pagination — scalable (pas de SKIP qui ralentit)
async function paginateUsers(params: {
  cursor?: string; // _id du dernier élément vu
  limit: number;
  filter: Partial<Pick<User, 'profileType' | 'isActive'>>;
}) {
  const query: FilterQuery<User> = {
    ...params.filter,
    deletedAt: null,
    ...(params.cursor ? { _id: { $gt: new Types.ObjectId(params.cursor) } } : {}),
  };

  const users = await UserModel
    .find(query)
    .sort({ _id: 1 })
    .limit(params.limit + 1) // +1 pour savoir s'il y a une page suivante
    .select('-passwordHash -security')
    .lean<User[]>();

  const hasNextPage = users.length > params.limit;
  const items = hasNextPage ? users.slice(0, -1) : users;
  const nextCursor = hasNextPage ? items.at(-1)?._id.toString() : null;

  return { items, nextCursor, hasNextPage };
}
```

## Agrégations — Pipeline MongoDB

```typescript
// Stats pour le CRM — acteurs vérifiés par ville
async function getVerifiedActorStats() {
  return UserModel.aggregate([
    {
      $match: {
        profileType: { $in: ['commercial', 'association', 'freelance', 'ecole'] },
        'verificationStatus.status': 'verified',
        isActive: true,
        deletedAt: null,
      },
    },
    {
      $group: {
        _id: { city: '$location.city', profileType: '$profileType' },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 100 },
  ]);
}
```

## Transactions — Opérations critiques

```typescript
// Utiliser les transactions pour les opérations multi-collections
async function processSubscription(userId: string, plan: string) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Mettre à jour le user
    await User.findByIdAndUpdate(userId, {
      'subscription.plan': plan,
      'subscription.activatedAt': new Date(),
    }, { session });

    // 2. Créer l'entrée de facturation
    await Invoice.create([{ userId, plan, amount: PLAN_PRICES[plan] }], { session });

    // 3. Logger l'audit
    await AuditLog.create([{ action: 'payment.subscription_created', userId }], { session });

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
}
```
