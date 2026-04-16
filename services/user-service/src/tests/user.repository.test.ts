process.env['NODE_ENV'] = 'test';

import { describe, expect, it, vi, beforeEach } from 'vitest';

const prismaMock = {
  kycDocument: {
    findMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  post: {
    updateMany: vi.fn(),
  },
  session: {
    deleteMany: vi.fn(),
  },
  pushSubscription: {
    deleteMany: vi.fn(),
  },
  follow: {
    deleteMany: vi.fn(),
  },
  user: {
    update: vi.fn(),
  },
  $transaction: vi.fn(),
};

vi.mock('@yunicity/database', () => ({
  prisma: prismaMock,
}));

vi.mock('../providers/r2.provider.js', () => ({
  deleteFromR2: vi.fn().mockResolvedValue(undefined),
}));

const { UserRepository } = await import('../repositories/user.repository.js');
const { deleteFromR2 } = await import('../providers/r2.provider.js');

describe('UserRepository.anonymize', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.kycDocument.findMany.mockResolvedValue([
      { r2Key: 'kyc/u1/doc-1.pdf' },
      { r2Key: 'kyc/u1/doc-2.pdf' },
    ]);
    prismaMock.post.updateMany.mockReturnValue({ op: 'post.updateMany' });
    prismaMock.kycDocument.deleteMany.mockReturnValue({ op: 'kyc.deleteMany' });
    prismaMock.session.deleteMany.mockReturnValue({ op: 'session.deleteMany' });
    prismaMock.pushSubscription.deleteMany.mockReturnValue({ op: 'push.deleteMany' });
    prismaMock.follow.deleteMany.mockReturnValue({ op: 'follow.deleteMany' });
    prismaMock.user.update.mockReturnValue({ op: 'user.update' });
    prismaMock.$transaction.mockResolvedValue([]);
  });

  it('supprime les artefacts RGPD et les objets KYC R2', async () => {
    await UserRepository.anonymize('u1');

    expect(deleteFromR2).toHaveBeenCalledTimes(2);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.post.updateMany).toHaveBeenCalled();
    expect(prismaMock.kycDocument.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'u1' },
    });
    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'u1' },
    });
    expect(prismaMock.pushSubscription.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'u1' },
    });
    expect(prismaMock.follow.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [{ followerId: 'u1' }, { followingId: 'u1' }],
      },
    });
  });
});
