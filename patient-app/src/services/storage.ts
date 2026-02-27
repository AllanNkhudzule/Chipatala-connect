import type { MedicalRecord, PatientProfile } from '../types';
import { encryptObject, decryptToObject } from './crypto';

const RECORDS_KEY = 'chipatala-patient-records';
const PROFILE_KEY = 'chipatala-patient-profile';
const THEME_KEY = 'chipatala-theme';

type StoredRecord = { id: string; encrypted?: boolean; payload: string };

export async function getRecords(): Promise<MedicalRecord[]> {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return [];
    const stored: StoredRecord[] = JSON.parse(raw);
    const out: MedicalRecord[] = [];
    for (const s of stored) {
      if (s.encrypted) {
        const dec = await decryptToObject(s.payload);
        if (dec) out.push(dec as MedicalRecord);
      } else {
        try {
          out.push(JSON.parse(s.payload));
        } catch {
          // ignore
        }
      }
    }
    return out;
  } catch {
    return [];
  }
}

export async function saveRecord(record: MedicalRecord): Promise<void> {
  const existing = await getRecords();
  const exists = existing.some((r) => r.id === record.id);
  if (exists) return;

  // attempt to encrypt the record before storing
  try {
    const encrypted = await encryptObject(record);
    const raw = localStorage.getItem(RECORDS_KEY);
    const store: StoredRecord[] = raw ? JSON.parse(raw) : [];
    store.unshift({ id: record.id, encrypted: true, payload: encrypted });
    localStorage.setItem(RECORDS_KEY, JSON.stringify(store));
  } catch {
    // fallback to plaintext storage if encryption fails
    const raw = localStorage.getItem(RECORDS_KEY);
    const store: StoredRecord[] = raw ? JSON.parse(raw) : [];
    store.unshift({ id: record.id, encrypted: false, payload: JSON.stringify(record) });
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
