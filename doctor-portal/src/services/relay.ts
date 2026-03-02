import { RELAY_URL } from '../data/mockData';
import type { MedicalRecord, AccessGrant } from '../types';

const normalizedRelayUrl = RELAY_URL.replace(/\/$/, '');

async function authFetch(urlPath: string, options: RequestInit = {}) {
  const fullUrl = `${normalizedRelayUrl}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
  console.log(`[Relay] Fetching: ${fullUrl}`);

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer demo-token`);

  const res = await fetch(fullUrl, {
    ...options,
    headers,
    mode: 'cors',
    credentials: 'include',
  });
  return res;
}

export async function publishRecord(record: MedicalRecord): Promise<string | null> {
  try {
    const res = await authFetch(`/api/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.code;
  } catch {
    return null;
  }
}

export async function requestAccess(token: string): Promise<AccessGrant | null> {
  try {
    const res = await authFetch(`/api/access-grants/${encodeURIComponent(token)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
