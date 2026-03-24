// Types re-exported from Prisma schema — no Mongoose model needed
export type TribeCategory =
  | 'culture'
  | 'sport'
  | 'business'
  | 'education'
  | 'social'
  | 'ecology'
  | 'food'
  | 'art'
  | 'tech'
  | 'other';

export interface ITribe {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: TribeCategory;
  city: string;
  lat: number | null;
  lng: number | null;
  creatorId: string;
  membersCount: number;
  isPublic: boolean;
  isVerified: boolean;
  coverKey: string | null;
  rules: string | null;
  tags: string[];
  isActive: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
