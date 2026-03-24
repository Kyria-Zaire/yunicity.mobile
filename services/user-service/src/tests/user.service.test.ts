process.env['NODE_ENV'] = 'test';
process.env['AUTH_SECRET'] = 'test_secret_min_32_chars_yunicity_ok';
process.env['DATABASE_URL'] = 'postgresql://yunicity:changeme_local@localhost:5432/yunicity_test';
process.env['REDIS_URL'] = 'redis://localhost:6379';

import { describe, it, expect, vi } from 'vitest';
import { UserService } from '../services/user.service.js';
import { UserRepository } from '../repositories/user.repository.js';
import * as queues from '../jobs/queues.js';

vi.mock('../repositories/user.repository.js');
vi.mock('../jobs/queues.js', () => ({
  emailQueue: { add: vi.fn().mockResolvedValue(undefined) },
  kycQueue: { add: vi.fn().mockResolvedValue(undefined) },
}));

const validPayload = {
  email: 'test@yunicity.fr',
  password: 'ValidPassword123!',
  profileType: 'yunicitizen' as const,
  profileData: {},
  consent: { rgpd: true as const, marketing: false, analytics: false },
};

describe('UserService.create', () => {
  it('rejette un mot de passe trop court', async () => {
    const result = await UserService.create({
      ...validPayload,
      password: 'short',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('WEAK_PASSWORD');
  });

  it('rejette si email existe déjà', async () => {
    vi.mocked(UserRepository.findByEmail).mockResolvedValueOnce({
      id: '123',
    } as never);
    const result = await UserService.create(validPayload);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('EMAIL_EXISTS');
  });

  it('rejette sans consentement RGPD', async () => {
    vi.mocked(UserRepository.findByEmail).mockResolvedValueOnce(null);
    const result = await UserService.create({
      ...validPayload,
      consent: {
        rgpd: false as unknown as true,
        marketing: false,
        analytics: false,
      },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('RGPD_REQUIRED');
  });

  it('crée le user avec verificationStatus=pending', async () => {
    vi.mocked(UserRepository.findByEmail).mockResolvedValueOnce(null);
    vi.mocked(UserRepository.findByPhone).mockResolvedValueOnce(null);
    vi.mocked(UserRepository.create).mockResolvedValueOnce({
      id: 'new-id',
      email: validPayload.email,
      profileType: 'yunicitizen',
    } as never);

    const result = await UserService.create(validPayload);
    expect(result.ok).toBe(true);

    const createCall = vi.mocked(UserRepository.create).mock.calls[0]?.[0];
    expect(createCall?.passwordHash).not.toBe(validPayload.password);
    expect(queues.emailQueue.add).toHaveBeenCalledWith(
      'send-verification-email',
      expect.objectContaining({ email: validPayload.email }),
    );
  });

  it('yunicitizen : autoVerifyOnOtp = true dans le job email', async () => {
    vi.mocked(UserRepository.findByEmail).mockResolvedValueOnce(null);
    vi.mocked(UserRepository.findByPhone).mockResolvedValueOnce(null);
    vi.mocked(UserRepository.create).mockResolvedValueOnce({
      id: 'yunicitizen-1',
      email: 'habitant@reims.fr',
      profileType: 'yunicitizen',
      verificationStatus: 'pending',
    } as never);

    const result = await UserService.create({
      ...validPayload,
      profileType: 'yunicitizen',
    });

    expect(result.ok).toBe(true);
    expect(queues.emailQueue.add).toHaveBeenCalledWith(
      'send-verification-email',
      expect.objectContaining({ autoVerifyOnOtp: true }),
    );
  });

  it('commercial : autoVerifyOnOtp = false (doit passer par KYC)', async () => {
    vi.mocked(UserRepository.findByEmail).mockResolvedValueOnce(null);
    vi.mocked(UserRepository.findByPhone).mockResolvedValueOnce(null);
    vi.mocked(UserRepository.create).mockResolvedValueOnce({
      id: 'commercial-1',
      email: 'commerce@reims.fr',
      profileType: 'commercial',
      verificationStatus: 'pending',
    } as never);

    const result = await UserService.create({
      ...validPayload,
      email: 'commerce@reims.fr',
      profileType: 'commercial',
    });

    expect(result.ok).toBe(true);
    expect(queues.emailQueue.add).toHaveBeenCalledWith(
      'send-verification-email',
      expect.objectContaining({ autoVerifyOnOtp: false }),
    );
  });
});
