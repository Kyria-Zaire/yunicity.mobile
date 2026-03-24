process.env['NODE_ENV'] = 'test';
process.env['AUTH_SECRET'] = 'test_secret_min_32_chars_yunicity_ok';
process.env['DATABASE_URL'] = 'postgresql://yunicity:changeme_local@localhost:5432/yunicity_test';
process.env['REDIS_URL'] = 'redis://localhost:6379';

import { describe, it, expect, vi } from 'vitest';
import { KycService } from '../services/kyc.service.js';
import * as r2 from '../providers/r2.provider.js';
import * as clamav from '../providers/clamav.provider.js';
import { UserRepository } from '../repositories/user.repository.js';
import * as queues from '../jobs/queues.js';

vi.mock('../providers/r2.provider.js');
vi.mock('../providers/clamav.provider.js');
vi.mock('../repositories/user.repository.js');
vi.mock('../jobs/queues.js', () => ({
  kycQueue: { add: vi.fn().mockResolvedValue(undefined) },
  emailQueue: { add: vi.fn().mockResolvedValue(undefined) },
}));

describe('KycService.uploadDocument', () => {
  it('rejette un type MIME non autorisé', async () => {
    const result = await KycService.uploadDocument({
      userId: 'u1',
      docType: 'kbis',
      buffer: Buffer.from('test'),
      mimeType: 'application/exe',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_FILE_TYPE');
  });

  it('rejette un fichier infecté (ClamAV)', async () => {
    vi.mocked(clamav.scanBuffer).mockResolvedValueOnce({
      clean: false,
      virusName: 'Eicar',
    });
    const result = await KycService.uploadDocument({
      userId: 'u1',
      docType: 'kbis',
      buffer: Buffer.from('virus'),
      mimeType: 'application/pdf',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('FILE_INFECTED');
  });

  it('upload réussi → statut under_review + job KYC', async () => {
    vi.mocked(clamav.scanBuffer).mockResolvedValueOnce({ clean: true });
    vi.mocked(r2.uploadToR2).mockResolvedValueOnce('kyc/u1/kbis/uuid.pdf');
    vi.mocked(UserRepository.addKycDocument).mockResolvedValueOnce(undefined);
    vi.mocked(UserRepository.updateVerificationStatus).mockResolvedValueOnce(
      undefined,
    );

    const result = await KycService.uploadDocument({
      userId: 'u1',
      docType: 'kbis',
      buffer: Buffer.alloc(1000),
      mimeType: 'application/pdf',
    });

    expect(result.ok).toBe(true);
    expect(queues.kycQueue.add).toHaveBeenCalledWith(
      'review-kyc',
      expect.objectContaining({ userId: 'u1' }),
    );
    expect(UserRepository.updateVerificationStatus).toHaveBeenCalledWith(
      'u1',
      'under_review',
    );
  });
});
