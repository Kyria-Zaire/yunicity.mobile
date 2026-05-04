# Railway — Internal URLs Reference

## Contexte

Dans Railway, chaque service écoute sur un port dynamique injecté via la variable d'environnement `PORT` (ex: `8080`). Hardcoder les ports dans les variables d'environnement de l'API Gateway ne fonctionne pas — les ports peuvent changer entre deux deploys.

## Solution — Références de variables Railway

Railway permet de référencer dynamiquement les variables d'autres services dans le même projet via la syntaxe `${{<nom-service>.<VARIABLE>}}`.

Pour cibler le port interne d'un service depuis l'API Gateway, on utilise :

```
http://<nom-service>.railway.internal:${{<nom-service>.PORT}}
```

Railway résout `${{<nom-service>.PORT}}` au moment du démarrage avec le `PORT` réel injecté par la plateforme. Le hostname `*.railway.internal` est résolu uniquement sur le réseau privé Railway (pas exposé publiquement).

## Variables à configurer — `api-gateway` → Variables

À copier-coller tel quel dans l'onglet **Variables** du service `api-gateway` sur Railway :

```env
AUTH_SERVICE_URL=http://yunicityauth-service.railway.internal:${{auth-service.PORT}}
USER_SERVICE_URL=http://yunicityuser-service.railway.internal:${{user-service.PORT}}
COMMUNITY_SERVICE_URL=http://yunicitycommunity-service.railway.internal:${{community-service.PORT}}
MAP_SERVICE_URL=http://yunicitymap-service.railway.internal:${{map-service.PORT}}
PAYMENT_SERVICE_URL=http://yunicitypayment-service.railway.internal:${{payment-service.PORT}}
NOTIFICATION_SERVICE_URL=http://yunicitynotification-service.railway.internal:${{notification-service.PORT}}
MODERATION_SERVICE_URL=http://yunicitymoderation-service.railway.internal:${{moderation-service.PORT}}
CRM_SERVICE_URL=http://yunicitycrm-service.railway.internal:${{crm-service.PORT}}
AI_SERVICE_URL=http://yunicityai-service.railway.internal:${{ai-service.PORT}}
```

## Notes

- **Hostnames** : le préfixe `yunicity` est concaténé au nom du service Railway. Vérifier dans l'onglet **Settings → Networking → Private Networking** de chaque service que le hostname interne correspond.
- **Sécurité** : ces URLs ne sont accessibles que depuis le réseau privé Railway. Aucun service ne doit être joignable publiquement à part `api-gateway`.
- **Pas de TLS interne** : on utilise `http://` (pas `https://`) sur le réseau privé Railway — le trafic est déjà isolé et chiffré au niveau infra.
- **Healthchecks** : chaque service doit exposer `GET /health` sur son `PORT` pour que l'API Gateway puisse vérifier la disponibilité.

## Référence

- Railway Reference Variables : https://docs.railway.app/guides/variables#reference-variables
- Railway Private Networking : https://docs.railway.app/guides/private-networking
