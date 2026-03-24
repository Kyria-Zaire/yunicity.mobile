import { env } from '../config/env.js';

interface PushPayload {
  title: string;
  body: string;
  icon?: string | undefined;
  badge?: string | undefined;
  url?: string | undefined;
  data?: Record<string, unknown> | undefined;
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushPayload,
): Promise<{ ok: boolean; error?: string | undefined }> {
  // Stub mode if VAPID keys not configured
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    console.log(
      `[PUSH STUB] -> ${subscription.endpoint.slice(0, 50)}... | ${payload.title}: ${payload.body}`,
    );
    return { ok: true };
  }

  try {
    // Dynamic import to avoid crash when web-push is not installed
    const webpush = await import('web-push');

    webpush.default.setVapidDetails(
      `mailto:${env.VAPID_CONTACT_EMAIL}`,
      env.VAPID_PUBLIC_KEY,
      env.VAPID_PRIVATE_KEY,
    );

    await webpush.default.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(payload),
      { TTL: 60 * 60 },
    );

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error(`Push failed for ${subscription.endpoint}: ${message}`);

    // 410 Gone = subscription expired, should be cleaned up
    if (message.includes('410') || message.includes('expired')) {
      return { ok: false, error: 'expired' };
    }

    return { ok: false, error: message };
  }
}
