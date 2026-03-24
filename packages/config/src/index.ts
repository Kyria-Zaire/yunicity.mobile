// ============================================================
// @yunicity/config — Constantes & configuration Yunicity
// ============================================================

// --- Profile Types ---

export const PROFILE_TYPES = [
  'yunicitizen',
  'commercial',
  'association',
  'freelance',
  'ecole',
] as const;

// --- Verification Statuses ---

export const VERIFICATION_STATUSES = [
  'pending',
  'under_review',
  'verified',
  'rejected',
] as const;

// --- Feature Flags ---

export const FEATURE_FLAGS = {
  FF_TRIBE_CREATION: false,
  FF_AI_YU: false,
  FF_PREMIUM: false,
} as const;

// --- Environment Keys ---

export const ENV_KEYS = {
  // Core
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  LOG_LEVEL: 'LOG_LEVEL',

  // Database
  MONGODB_URI: 'MONGODB_URI',
  REDIS_URL: 'REDIS_URL',

  // Auth
  JWT_SECRET: 'JWT_SECRET',
  JWT_REFRESH_SECRET: 'JWT_REFRESH_SECRET',
  BETTER_AUTH_SECRET: 'BETTER_AUTH_SECRET',

  // External Services
  STRIPE_SECRET_KEY: 'STRIPE_SECRET_KEY',
  STRIPE_WEBHOOK_SECRET: 'STRIPE_WEBHOOK_SECRET',
  RESEND_API_KEY: 'RESEND_API_KEY',
  TWILIO_ACCOUNT_SID: 'TWILIO_ACCOUNT_SID',
  TWILIO_AUTH_TOKEN: 'TWILIO_AUTH_TOKEN',
  TWILIO_VERIFY_SID: 'TWILIO_VERIFY_SID',

  // Storage
  R2_ACCOUNT_ID: 'R2_ACCOUNT_ID',
  R2_ACCESS_KEY_ID: 'R2_ACCESS_KEY_ID',
  R2_SECRET_ACCESS_KEY: 'R2_SECRET_ACCESS_KEY',
  R2_BUCKET_NAME: 'R2_BUCKET_NAME',

  // AI
  OPENAI_API_KEY: 'OPENAI_API_KEY',

  // Maps
  MAPBOX_ACCESS_TOKEN: 'MAPBOX_ACCESS_TOKEN',

  // App URLs
  APP_URL: 'APP_URL',
  API_GATEWAY_URL: 'API_GATEWAY_URL',
} as const;
