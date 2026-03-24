# /db-schema — Créer ou modifier un schéma MongoDB Yunicity

Collection / modification : $ARGUMENTS

## Règles obligatoires pour tout schéma Mongoose

### Structure type
```typescript
import { Schema, model, Document, Types } from 'mongoose';

// 1. Interface TypeScript d'abord
interface IUser extends Document {
  email: string;
  profileType: ProfileType;
  // ... tous les champs typés
}

// 2. Schema Mongoose avec validations
const schema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Format email invalide'],
    maxlength: [255, 'Email trop long'],
  },
  // ...
}, {
  timestamps: true,        // createdAt, updatedAt automatiques
  versionKey: false,       // Désactiver __v
  toJSON: { virtuals: true },
});

// 3. Index OBLIGATOIREMENT déclarés explicitement
schema.index({ email: 1 }, { unique: true });
schema.index({ location: '2dsphere' });
schema.index({ profileType: 1, 'verificationStatus.status': 1 });
schema.index({ createdAt: -1 });

// 4. Soft delete — champ deletedAt
schema.index({ deletedAt: 1 }, { sparse: true });

// 5. Méthodes de sélection sécurisées
schema.statics.findVerified = function(filter = {}) {
  return this.find({
    ...filter,
    deletedAt: null,
    'verificationStatus.status': 'verified',
  }).select('-passwordHash -security');
};

export const UserModel = model<IUser>('User', schema);
```

## Ce qu'il faut produire
1. Interface TypeScript complète
2. Schema Mongoose avec toutes les validations
3. Index déclarés et justifiés
4. Méthodes statics utiles
5. Zod schema équivalent dans `@yunicity/validators`
6. Migration si modification d'un schema existant (script dans `infra/migrations/`)