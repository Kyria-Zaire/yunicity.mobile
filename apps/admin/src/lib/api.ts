import { API_URL, ADMIN_KEY } from '@/lib/config';

const headers = {
  'Content-Type': 'application/json',
  'X-Admin-Key': ADMIN_KEY,
};

export interface AdminStats {
  pending: number;
  under_review: number;
  verified: number;
  rejected: number;
}

export interface AdminUser {
  _id: string;
  email: string;
  profileType: string;
  verificationStatus: { status: string };
  createdAt: string;
  phone?: string | undefined;
}

export interface PaginatedUsers {
  items: AdminUser[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const res = await fetch(`${API_URL}/users/admin/stats`, { headers, cache: 'no-store' });
    if (!res.ok) throw new Error('API error');
    return res.json() as Promise<AdminStats>;
  } catch {
    return { pending: 0, under_review: 0, verified: 0, rejected: 0 };
  }
}

export async function getAdminUsers(params?: {
  status?: string | undefined;
  profileType?: string | undefined;
  cursor?: string | undefined;
}): Promise<PaginatedUsers> {
  try {
    const url = new URL(`${API_URL}/users/admin/users`);
    if (params?.status) url.searchParams.set('status', params.status);
    if (params?.profileType) url.searchParams.set('profileType', params.profileType);
    if (params?.cursor) url.searchParams.set('cursor', params.cursor);

    const res = await fetch(url.toString(), { headers, cache: 'no-store' });
    if (!res.ok) throw new Error('API error');
    return res.json() as Promise<PaginatedUsers>;
  } catch {
    return { items: [], nextCursor: null, hasNextPage: false };
  }
}

export async function verifyUser(userId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/users/admin/users/${userId}/verify`, {
      method: 'PATCH',
      headers,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function rejectUser(userId: string, reason: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/users/admin/users/${userId}/reject`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ reason }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
