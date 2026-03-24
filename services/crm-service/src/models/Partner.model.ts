// Types re-exported from Prisma schema — no Mongoose model needed
export type PartnerStatus =
  | 'lead'
  | 'contacted'
  | 'negotiating'
  | 'active'
  | 'paused'
  | 'churned';

export type PartnerTier = 'standard' | 'premium';
