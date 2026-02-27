export interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
}

export interface MedicalRecord {
  id: string;
  type: 'prescription' | 'diagnosis' | 'lab_result' | 'consultation' | 'referral';
  patientName: string;
  patientId: string;
  diagnosis: string;
  clinicalNotes: string;
  prescriptions: Prescription[];
  followUp: string;
  followUpDate: string;
  hospital: string;
  doctor: string;
  date: string;
  status: 'active' | 'resolved' | 'managed' | 'ongoing';
  retrievalCode?: string;
}

export interface Vital {
  icon: string;
  value: string;
  label: string;
}

export interface Condition {
  name: string;
  date: string;
  hospital: string;
  status: 'managed' | 'ongoing' | 'resolved';
  icon: string;
}

export interface Medication {
  name: string;
  dosage: string;
  prescribedBy: string;
}

export interface LabResult {
  date: string;
  test: string;
  result: string;
  referenceRange: string;
  status: 'normal' | 'abnormal' | 'critical';
}

export interface PatientProfile {
  name: string;
  nationalId: string;
  initials: string;
  gender: string;
  age: number;
  bloodType: string;
  allergies: string[];
  vitals: Vital[];
  conditions: Condition[];
  medications: Medication[];
  labResults: LabResult[];
}

export interface ActivityItem {
  icon: string;
  iconColor: 'green' | 'blue' | 'yellow' | 'red';
  title: string;
  description: string;
  time: string;
}

export interface TimelineEntry {
  date: string;
  title: string;
  type: 'prescription' | 'diagnosis' | 'lab_result' | 'consultation';
  description: string;
  hospital: string;
  doctor: string;
}

export interface AccessGrant {
  token: string;
  patient: PatientProfile;
  records: MedicalRecord[];
  timeline: TimelineEntry[];
  grantedAt: string;
  expiresIn: number;
}
