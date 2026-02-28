/// <reference types="vite/client" />
import type { MedicalRecord, PatientProfile } from '../types';
import { encryptObject, decryptToObject } from './crypto';

const RECORDS_KEY = 'chipatala-patient-records';
const PROFILE_KEY = 'profile:local';
const THEME_KEY = 'chipatala-theme';

type StoredRecord = { id: string; encrypted?: boolean; payload: string };

export async function getRecords(): Promise<MedicalRecord[]> {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return [];

    let stored: StoredRecord[];
    try {
      stored = JSON.parse(raw);
    } catch (e) {
      if (import.meta.env.DEV) console.error('Parse error', e);
      return [];
    }

    const out: MedicalRecord[] = [];
    const quarantine: any[] = JSON.parse(localStorage.getItem('records-quarantine') || '[]');
    let quarantineChanged = false;

    for (const s of stored) {
      try {
        let dec;
        if (s.encrypted) {
          dec = await decryptToObject(s.payload);
        } else {
          dec = JSON.parse(s.payload);
        }

        if (dec && dec.resourceType === 'Bundle') {
          out.push(dec as MedicalRecord);
        } else if (dec) {
          // Add default resourceType to existing records so we don't break mock data
          if (!dec.resourceType && dec.id) {
            dec.resourceType = 'Bundle';
            out.push(dec as MedicalRecord);
          } else {
            quarantine.push(s);
            quarantineChanged = true;
          }
        }
      } catch (err: any) {
        if (err.name === 'DECRYPTION_FAILED') {
          if (import.meta.env.DEV) console.error('Decryption failed for record', s.id);
          throw err; // bubble up for UI
        }
      }
    }

    if (quarantineChanged) {
      localStorage.setItem('records-quarantine', JSON.stringify(quarantine));
    }

    return out;
  } catch (err) {
    if (import.meta.env.DEV) console.error(err);
    throw err;
  }
}

export async function saveRecord(record: MedicalRecord): Promise<void> {
  // Ensure FHIR bundle format
  const bundleRecord = { ...record, resourceType: 'Bundle' };
  const existing = await getRecords().catch(() => []);
  const exists = existing.some((r) => r.id === bundleRecord.id);
  if (exists) return;

  try {
    const encrypted = await encryptObject(bundleRecord);
    const raw = localStorage.getItem(RECORDS_KEY);
    const store: StoredRecord[] = raw ? JSON.parse(raw) : [];
    store.unshift({ id: bundleRecord.id, encrypted: true, payload: encrypted });
    localStorage.setItem(RECORDS_KEY, JSON.stringify(store));
  } catch {
    const raw = localStorage.getItem(RECORDS_KEY);
    const store: StoredRecord[] = raw ? JSON.parse(raw) : [];
    store.unshift({ id: bundleRecord.id, encrypted: false, payload: JSON.stringify(bundleRecord) });
    localStorage.setItem(RECORDS_KEY, JSON.stringify(store));
  }
}

export async function getProfile(): Promise<PatientProfile | null> {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return await decryptToObject(raw) as PatientProfile;
  } catch {
    return null;
  }
}

export async function saveProfile(profile: PatientProfile): Promise<void> {
  try {
    const encrypted = await encryptObject(profile);
    localStorage.setItem(PROFILE_KEY, encrypted);
  } catch {
    // ignore encryption errors for now
  }
}

export function getTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setTheme(theme: 'light' | 'dark'): void {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
}
