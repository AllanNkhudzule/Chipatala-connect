import type { MedicalRecord } from '../types';

const RECORDS_KEY = 'chipatala-patient-records';
const THEME_KEY = 'chipatala-theme';

export function getRecords(): MedicalRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecord(record: MedicalRecord): void {
  const records = getRecords();
  const exists = records.some(r => r.id === record.id);
  if (!exists) {
    records.unshift(record);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
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
