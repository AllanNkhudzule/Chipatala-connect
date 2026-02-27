import { RELAY_URL } from '../data/mockData';
import type { MedicalRecord, AccessGrant } from '../types';
import { patientProfile, medicalTimeline, initialRecords } from '../data/mockData';
import { getRecords } from './storage';

export async function retrieveRecord(code: string): Promise<MedicalRecord | null> {
  try {
    const res = await fetch(`${RELAY_URL}/api/records/${encodeURIComponent(code)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function grantAccess(durationMinutes: number = 30): Promise<string | null> {
  try {
    const allRecords = [...initialRecords, ...getRecords()];
    const payload: Omit<AccessGrant, 'token'> = {
      patient: patientProfile,
      records: allRecords,
      timeline: medicalTimeline,
      grantedAt: new Date().toISOString(),
      expiresIn: durationMinutes,
    };
    const res = await fetch(`${RELAY_URL}/api/access-grants`, {
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
