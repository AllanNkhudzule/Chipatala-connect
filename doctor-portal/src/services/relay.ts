import { RELAY_URL } from '../data/mockData';
import type { MedicalRecord, AccessGrant } from '../types';

import { toast } from 'react-hot-toast';

async function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('token');
    toast.error('Your session has expired. Please log in again.');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  return res;
}

export async function publishRecord(record: MedicalRecord): Promise<string | null> {
  try {
    const res = await authFetch(`${RELAY_URL}/api/records`, {
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
    const res = await authFetch(`${RELAY_URL}/api/access-grants/${encodeURIComponent(token)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
