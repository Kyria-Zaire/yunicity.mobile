import { UserRepository } from '../repositories/user.repository.js';
import { hashPassword, validatePasswordStrength } from '../auth/password.js';
import { emailQueue } from '../jobs/queues.js';
import type { ProfileType } from '../models/User.model.js';
import { GamificationService } from './gamification.service.js';

export type CreateUserPayload = {
  email: string;
  password: string;
  profileType: ProfileType;
  phone?: string | undefined;
  profileData: Record<string, unknown>;
  consent: { rgpd: boolean; marketing: boolean; analytics: boolean };
};

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; statusCode: number };

export class UserService {
  static async create(
    payload: CreateUserPayload,
  ): Promise<
    ServiceResult<{ id: string; email: string; profileType: ProfileType }>
  > {
    // 1. Validation force du mot de passe
    const strength = validatePasswordStrength(payload.password);
    if (!strength.valid) {
      return {
        ok: false,
        code: 'WEAK_PASSWORD',
        message: strength.errors.join(', '),
        statusCode: 400,
      };
    }

    // 2. Unicité email
    const existing = await UserRepository.findByEmail(payload.email);
    if (existing) {
      return {
        ok: false,
        code: 'EMAIL_EXISTS',
        message: 'Cet email est déjà utilisé',
        statusCode: 409,
      };
    }

    // 3. Unicité téléphone (si fourni)
    if (payload.phone) {
      const existingPhone = await UserRepository.findByPhone(payload.phone);
      if (existingPhone) {
        return {
          ok: false,
          code: 'PHONE_EXISTS',
          message: 'Ce numéro est déjà utilisé',
          statusCode: 409,
        };
      }
    }

    // 4. RGPD obligatoire
    if (!payload.consent.rgpd) {
      return {
        ok: false,
        code: 'RGPD_REQUIRED',
        message: 'Le consentement RGPD est obligatoire',
        statusCode: 400,
      };
    }

    // 5. Hash du mot de passe (Argon2id)
    const passwordHash = await hashPassword(payload.password);

    // 6. Créer l'utilisateur
    const user = await UserRepository.create({ ...payload, passwordHash });

    // 6.b. Gamification — inscription (fire & forget)
    void GamificationService.addPoints(
      user.id,
      'INSCRIPTION',
    ).catch(() => {});

    // 7. Email de vérification — logique différenciée par profileType
    // Yunicitizen : après vérification OTP email → verified immédiatement
    // Autres profils : email de bienvenue + instructions KYC (restent pending)
    await emailQueue.add('send-verification-email', {
      userId: user.id,
      email: user.email,
      profileType: user.profileType,
      autoVerifyOnOtp: payload.profileType === 'yunicitizen',
    });

    return {
      ok: true,
      data: {
        id: user.id,
        email: user.email,
        profileType: user.profileType,
      },
    };
  }

  static async findById(id: string) {
    const user = await UserRepository.findById(id);
    if (!user)
      return {
        ok: false as const,
        code: 'NOT_FOUND',
        message: 'Utilisateur introuvable',
        statusCode: 404,
      };
    return {
      ok: true as const,
      data: user,
    };
  }

  static async mergeProfileData(
    id: string,
    patch: Record<string, unknown>,
  ): Promise<ServiceResult<{ id: string }>> {
    const user = await UserRepository.findById(id);
    if (!user) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: 'Utilisateur introuvable',
        statusCode: 404,
      };
    }
    const existing = (user.profileData ?? {}) as Record<string, unknown>;
    const merged = { ...existing, ...patch };
    await UserRepository.updateProfileData(id, merged);
    return { ok: true, data: { id } };
  }
}
