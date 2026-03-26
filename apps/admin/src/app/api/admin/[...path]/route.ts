import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3000';
const ADMIN_KEY = process.env['ADMIN_API_KEY'] ?? '';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyToApi(request, await params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyToApi(request, await params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyToApi(request, await params);
}

async function proxyToApi(
  request: NextRequest,
  { path }: { path: string[] },
): Promise<NextResponse> {
  if (!ADMIN_KEY) {
    return NextResponse.json(
      { code: 'CONFIG_ERROR', message: 'ADMIN_API_KEY not configured' },
      { status: 500 },
    );
  }

  const targetPath = `/users/admin/${path.join('/')}`;
  const url = new URL(targetPath, API_URL);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Admin-Key': ADMIN_KEY,
  };

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const body = hasBody ? await request.text() : undefined;

  const res = await fetch(url.toString(), {
    method: request.method,
    headers,
    ...(body ? { body } : {}),
  });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
