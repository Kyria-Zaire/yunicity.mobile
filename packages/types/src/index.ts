// ============================================================
// @yunicity/types — Interfaces & types partagés Yunicity
// ============================================================

// --- Profile Types ---

export type ProfileType = 'yunicitizen' | 'commercial' | 'association' | 'freelance' | 'ecole';

// --- Verification ---

export type VerificationStatusEnum = 'pending' | 'under_review' | 'verified' | 'rejected';

export interface VerificationStatus {
  status: VerificationStatusEnum;
  verifiedAt?: Date;
  rejectedReason?: string;
  documents: KycDocument[];
}

export interface KycDocument {
  type: 'id_card' | 'passport' | 'siret' | 'rna' | 'kbis' | 'other';
  fileKey: string;
  uploadedAt: Date;
  reviewedAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
}

// --- GeoJSON ---

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [longitude: number, latitude: number];
}

// --- User ---

export interface BaseUser {
  _id: string;
  email: string;
  phone: string;
  passwordHash: string;
  profileType: ProfileType;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  verificationStatus: VerificationStatus;
  location: GeoJSONPoint;
  address?: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  security: {
    mfaEnabled: boolean;
    mfaSecret?: string;
    lastPasswordChange: Date;
    loginAttempts: number;
    lockUntil?: Date;
  };
  yunicity: {
    level: number;
    xp: number;
    badges: string[];
    tribes: string[];
  };
  subscription: {
    plan: 'free' | 'premium' | 'business';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    expiresAt?: Date;
  };
  consent: {
    terms: boolean;
    termsAcceptedAt?: Date;
    privacy: boolean;
    privacyAcceptedAt?: Date;
    marketing: boolean;
    marketingAcceptedAt?: Date;
    analytics: boolean;
    analyticsAcceptedAt?: Date;
  };
  isActive: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// --- API Responses ---

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: AppError;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    cursor?: string;
    nextCursor?: string;
    hasMore: boolean;
    limit: number;
    total?: number;
  };
  timestamp: string;
}

// --- Errors ---

export interface AppError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

// --- Result Pattern ---

export type Result<T, E = AppError> =
  | { ok: true; data: T }
  | { ok: false; error: E };
