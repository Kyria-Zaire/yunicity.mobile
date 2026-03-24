process.env['NODE_ENV'] = 'test';
process.env['AUTH_SECRET'] = 'test_secret_min_32_chars_yunicity_ok';
process.env['DATABASE_URL'] = 'postgresql://yunicity:changeme_local@localhost:5432/yunicity_test';
process.env['REDIS_URL'] = 'redis://localhost:6379';

import { describe, it, expect, vi } from 'vitest';
import { CrmService } from '../services/crm.service.js';
import { PartnerRepository } from '../repositories/partner.repository.js';
import * as queues from '../jobs/queues.js';

vi.mock('../repositories/partner.repository.js');
vi.mock('../jobs/queues.js', () => ({
  onboardingQueue: { add: vi.fn().mockResolvedValue(undefined) },
}));

const validPayload = {
  userId: '507f1f77bcf86cd799439011',
  companyName: 'Boulangerie Reims Centre',
  contactEmail: 'contact@boulangerie-reims.fr',
  contactPhone: '+33612345678',
};

describe('CrmService', () => {
  it('cree un partenaire et enqueue le job onboarding', async () => {
    vi.mocked(PartnerRepository.findByEmail).mockResolvedValueOnce(null);
    vi.mocked(PartnerRepository.create).mockResolvedValueOnce({
      id: 'partner-1',
      businessName: validPayload.companyName,
      email: validPayload.contactEmail,
      status: 'lead',
      tier: 'standard',
    } as never);

    const result = await CrmService.createPartner(validPayload);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.partnerId).toBe('partner-1');
    }
    expect(queues.onboardingQueue.add).toHaveBeenCalledWith(
      'partner-welcome',
      expect.objectContaining({
        partnerId: 'partner-1',
        contactEmail: validPayload.contactEmail,
      }),
    );
  });

  it('rejette si le partenaire existe deja (email)', async () => {
    vi.mocked(PartnerRepository.findByEmail).mockResolvedValueOnce({
      id: 'existing-partner',
      contactEmail: validPayload.contactEmail,
    } as never);

    const result = await CrmService.createPartner(validPayload);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('PARTNER_EXISTS');
      expect(result.statusCode).toBe(409);
    }
  });

  it('retourne 404 si partenaire introuvable lors du updateStatus', async () => {
    vi.mocked(PartnerRepository.findById).mockResolvedValueOnce(null);

    const result = await CrmService.updateStatus('unknown-id', 'contacted');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('PARTNER_NOT_FOUND');
      expect(result.statusCode).toBe(404);
    }
  });

  it('positionne contractSignedAt quand le statut passe a active', async () => {
    vi.mocked(PartnerRepository.findById).mockResolvedValueOnce({
      id: 'partner-2',
      status: 'negotiating',
      companyName: 'Test Corp',
    } as never);
    vi.mocked(PartnerRepository.updateStatus).mockResolvedValueOnce({
      id: 'partner-2',
      status: 'active',
      contractSignedAt: new Date(),
    } as never);

    const result = await CrmService.updateStatus('partner-2', 'active');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.status).toBe('active');
    }

    const updateCall = vi.mocked(PartnerRepository.updateStatus).mock.calls[0];
    expect(updateCall?.[1]).toBe('active');
  });
});
