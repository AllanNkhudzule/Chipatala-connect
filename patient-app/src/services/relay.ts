import { RELAY_URL } from '../data/mockData';
import type { MedicalRecord, AccessGrant } from '../types';
import { patientProfile, medicalTimeline } from '../data/mockData';
import { getRecords, getProfile } from './storage';

async function authFetch(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer demo-token`);

  const res = await fetch(url, { ...options, headers });
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
