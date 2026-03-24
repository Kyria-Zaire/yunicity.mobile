import { PartnerRepository, type PartnerStatus } from '../repositories/partner.repository.js';
import { onboardingQueue } from '../jobs/queues.js';

type Result<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; statusCode: number };

interface CreatePartnerPayload {
  userId?: string | undefined;
  companyName?: string | undefined;
  siret?: string | undefined;
  contactEmail: string;
  contactPhone?: string | undefined;
  tier?: string | undefined;
  source?: 'inscription' | 'referral' | 'cold_outreach' | 'event' | undefined;
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  lead: ['contacted', 'churned'],
  contacted: ['negotiating', 'churned'],
  negotiating: ['active', 'churned'],
  active: ['paused', 'churned'],
  paused: ['active', 'churned'],
  churned: ['lead'],
};

export class CrmService {
  static async createPartner(
    payload: CreatePartnerPayload,
  ): Promise<Result<{ partnerId: string }>> {
    const existing = await PartnerRepository.findByEmail(payload.contactEmail);
    if (existing) {
      return {
        ok: false,
        code: 'PARTNER_EXISTS',
        message: 'Un partenaire avec cet email existe deja',
        statusCode: 409,
      };
    }

    const isWaitlist = payload.source === 'inscription';
    const partner = await PartnerRepository.create({
      email: payload.contactEmail.toLowerCase(),
      businessName: isWaitlist
        ? 'Waitlist - Beta Reims'
        : (payload.companyName ?? ''),
      contactName: '',
      city: 'reims',
      profileType: 'commercial',
      status: 'lead',
      tier: (payload.tier as 'standard' | 'premium') ?? 'standard',
    });

    if (!isWaitlist) {
      await onboardingQueue.add('partner-welcome', {
        partnerId: partner.id,
        businessName: partner.businessName,
        contactEmail: partner.email,
      });
    }

    return { ok: true, data: { partnerId: partner.id } };
  }

  static async updateStatus(
    partnerId: string,
    newStatus: PartnerStatus,
  ): Promise<Result<{ partnerId: string; status: PartnerStatus }>> {
    const partner = await PartnerRepository.findById(partnerId);
    if (!partner) {
      return {
        ok: false,
        code: 'PARTNER_NOT_FOUND',
        message: 'Partenaire introuvable',
        statusCode: 404,
      };
    }

    const allowed = VALID_TRANSITIONS[partner.status];
    if (!allowed?.includes(newStatus)) {
      return {
        ok: false,
        code: 'INVALID_TRANSITION',
        message: `Transition ${partner.status} -> ${newStatus} non autorisee`,
        statusCode: 400,
      };
    }

    const extra: Record<string, unknown> = {};
    if (newStatus === 'active') {
      extra['contractSignedAt'] = new Date();
    }

    await PartnerRepository.updateStatus(partnerId, newStatus, extra);

    return { ok: true, data: { partnerId, status: newStatus } };
  }

  static async getPipeline(filters: {
    status?: PartnerStatus | undefined;
    tier?: string | undefined;
  }) {
    return PartnerRepository.getPipeline(filters);
  }

  static async getStats() {
    return PartnerRepository.getStats();
  }
}
