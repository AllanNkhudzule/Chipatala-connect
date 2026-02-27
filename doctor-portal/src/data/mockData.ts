import type { Session, RecentRecord } from '../types';

export const RELAY_URL = import.meta.env.VITE_RELAY_URL || 'http://localhost:3001';

export const doctorProfile = {
  name: 'Dr. Grace Banda',
  initials: 'GB',
  specialty: 'General Practitioner',
  hospital: 'Queen Elizabeth Central Hospital',
};

export const dashboardStats = [
  { icon: '👥', color: 'green' as const, value: '12', label: 'Patients Today' },
  { icon: '🔓', color: 'blue' as const, value: '3', label: 'Active Sessions' },
  { icon: '📋', color: 'yellow' as const, value: '8', label: 'Records Created Today' },
  { icon: '✅', color: 'green' as const, value: '5', label: 'Records Sent' },
];

export const activeSessions: Session[] = [
  { patientName: 'Tamanda Mbewe', accessType: 'Full Records', timeRemaining: '23:45', status: 'active' },
  { patientName: 'Chisomo Njobvu', accessType: 'Lab Results Only', timeRemaining: '08:12', status: 'expiring' },
  { patientName: 'Mphatso Chirwa', accessType: 'Full Records', timeRemaining: '28:30', status: 'active' },
];

export const recentRecords: RecentRecord[] = [
  { icon: '📋', iconColor: 'green', title: 'Prescription – Tamanda Mbewe', description: 'Amoxicillin 500mg, Ibuprofen 400mg', status: 'sent' },
  { icon: '🔬', iconColor: 'blue', title: 'Lab Result – Chisomo Njobvu', description: 'Full blood count panel', status: 'sent' },
  { icon: '📋', iconColor: 'yellow', title: 'Diagnosis – Mphatso Chirwa', description: 'Type 2 Diabetes – initial assessment', status: 'pending' },
  { icon: '📋', iconColor: 'green', title: 'Prescription – Kondwani Msiska', description: 'Metformin 500mg, lifestyle guidance', status: 'sent' },
  { icon: '🔬', iconColor: 'blue', title: 'Lab Result – Tionge Kamanga', description: 'Malaria RDT – Negative', status: 'sent' },
];
