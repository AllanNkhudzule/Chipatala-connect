import { RELAY_URL } from '../data/mockData';
import type { MedicalRecord, AccessGrant } from '../types';
import { patientProfile, medicalTimeline } from '../data/mockData';
import { getRecords, getProfile } from './storage';

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

export async function retrieveRecord(code: string): Promise<MedicalRecord | null> {
  try {
    const res = await authFetch(`${RELAY_URL}/api/sessions/${encodeURIComponent(code)}/records`);
    if (!res.ok) {
      if (res.status === 410) {
        throw new Error('410');
      }
      return null;
    }
    return await res.json();
  } catch (err: any) {
    if (err.message === '410') throw err;
    return null;
  }
}

export async function grantAccess(durationMinutes: number = 30): Promise<string | null> {
  try {
    const [allRecords, patient] = await Promise.all([getRecords(), getProfile()]);
    const payload: Omit<AccessGrant, 'token'> = {
      patient: patient || patientProfile,
      records: allRecords,
      timeline: medicalTimeline,
      grantedAt: new Date().toISOString(),
      expiresIn: durationMinutes * 60,
    };
    const res = await authFetch(`${RELAY_URL}/api/access-grants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.token;
  } catch {
    return null;
  }
}
