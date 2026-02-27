import type { PatientProfile, ActivityItem, TimelineEntry, MedicalRecord } from '../types';

export const RELAY_URL = import.meta.env.VITE_RELAY_URL || 'http://localhost:3001';

export const patientProfile: PatientProfile = {
  name: 'Tamanda Mbewe',
  nationalId: 'MW-2901-4487-XZ',
  initials: 'TM',
  gender: 'Female',
  age: 28,
  bloodType: 'O+',
  allergies: ['Penicillin'],
  vitals: [
    { icon: '🩸', value: '120/78', label: 'Blood Pressure (mmHg)' },
    { icon: '❤️', value: '72 bpm', label: 'Heart Rate' },
    { icon: '🅾️', value: 'O+', label: 'Blood Type' },
    { icon: '⚖️', value: '68 kg', label: 'Weight' },
    { icon: '⚠️', value: 'Penicillin', label: 'Known Allergy' },
  ],
  conditions: [
    { name: 'Mild Asthma', date: '12 Mar 2024', hospital: 'Queen Elizabeth Central Hospital', status: 'managed', icon: '🫁' },
    { name: 'Vitamin D Deficiency', date: '05 Jan 2025', hospital: 'Kamuzu Central Hospital', status: 'ongoing', icon: '🦴' },
  ],
  medications: [
    { name: 'Salbutamol Inhaler', dosage: '2 puffs as needed', prescribedBy: 'Dr. Banda' },
    { name: 'Vitamin D3 2000 IU', dosage: 'Once daily', prescribedBy: 'Dr. Phiri' },
    { name: 'Paracetamol 500mg', dosage: 'As needed for pain', prescribedBy: 'OTC' },
  ],
  labResults: [
    { date: '15 Jan 2026', test: 'Haemoglobin', result: '14.2 g/dL', referenceRange: '12.0 – 16.0', status: 'normal' },
    { date: '15 Jan 2026', test: 'WBC Count', result: '6,800 /μL', referenceRange: '4,000 – 11,000', status: 'normal' },
    { date: '15 Jan 2026', test: 'Platelets', result: '245,000 /μL', referenceRange: '150,000 – 400,000', status: 'normal' },
    { date: '14 Jun 2023', test: 'Fasting Blood Glucose', result: '5.1 mmol/L', referenceRange: '3.9 – 5.6', status: 'normal' },
    { date: '14 Jun 2023', test: 'HbA1c', result: '5.3%', referenceRange: '< 5.7%', status: 'normal' },
  ],
};

export const recentActivity: ActivityItem[] = [
  { icon: '📋', iconColor: 'green', title: 'New Prescription Added', description: 'Vitamin D3 supplement – Kamuzu Central Hospital', time: '2 days ago' },
  { icon: '🔬', iconColor: 'blue', title: 'Lab Results Received', description: 'Full Blood Count – Mzuzu Central Hospital', time: '5 days ago' },
  { icon: '🏥', iconColor: 'yellow', title: 'Hospital Visit', description: 'Follow-up consultation – Queen Elizabeth Central Hospital', time: '2 weeks ago' },
  { icon: '🔓', iconColor: 'green', title: 'Access Granted', description: 'Dr. Mwale viewed records (session expired)', time: '2 weeks ago' },
];

export const medicalTimeline: TimelineEntry[] = [
  {
    date: '24 February 2026', title: 'Upper Respiratory Tract Infection', type: 'prescription',
    description: 'Diagnosed with URTI. Prescribed Amoxicillin 500mg and Ibuprofen 400mg. Follow-up in 7 days.',
    hospital: 'Queen Elizabeth Central Hospital', doctor: 'Dr. Grace Banda',
  },
  {
    date: '15 January 2026', title: 'Full Blood Count', type: 'lab_result',
    description: 'Haemoglobin: 14.2 g/dL, WBC: 6,800/μL, Platelets: 245,000/μL. All values within normal range.',
    hospital: 'Mzuzu Central Hospital', doctor: 'Dr. Chikondi Mwale',
  },
  {
    date: '05 January 2025', title: 'Vitamin D Deficiency', type: 'prescription',
    description: 'Vitamin D level: 18 ng/mL (low). Started on Vitamin D3 2000 IU daily supplementation.',
    hospital: 'Kamuzu Central Hospital', doctor: 'Dr. James Phiri',
  },
  {
    date: '20 September 2024', title: 'Routine Checkup', type: 'consultation',
    description: 'Annual physical examination. All vitals normal. BMI 23.4. No new concerns raised.',
    hospital: 'Queen Elizabeth Central Hospital', doctor: 'Dr. Grace Banda',
  },
  {
    date: '12 March 2024', title: 'Mild Asthma Diagnosis', type: 'diagnosis',
    description: 'Pulmonary function test confirmed mild persistent asthma. Prescribed Salbutamol inhaler for as-needed use.',
    hospital: 'Queen Elizabeth Central Hospital', doctor: 'Dr. Grace Banda',
  },
  {
    date: '08 November 2023', title: 'Malaria Treatment', type: 'prescription',
    description: 'Rapid diagnostic test positive for P. falciparum. Treated with Artemether-Lumefantrine (AL) for 3 days.',
    hospital: 'Zomba Central Hospital', doctor: 'Dr. Wezi Kamanga',
  },
  {
    date: '14 June 2023', title: 'Blood Glucose Test', type: 'lab_result',
    description: 'Fasting blood glucose: 5.1 mmol/L (normal). HbA1c: 5.3% (normal). No diabetes indicated.',
    hospital: 'Kamuzu Central Hospital', doctor: 'Dr. James Phiri',
  },
];

export const initialRecords: MedicalRecord[] = [
  {
    id: 'REC-2026-00412',
    type: 'prescription',
    patientName: 'Tamanda Mbewe',
    patientId: 'MW-2901-4487-XZ',
    diagnosis: 'Upper Respiratory Tract Infection',
    clinicalNotes: 'Patient presents with sore throat, cough, and mild fever for 3 days.',
    prescriptions: [
      { medication: 'Amoxicillin', dosage: '500mg', frequency: '3x daily, 7 days' },
      { medication: 'Ibuprofen', dosage: '400mg', frequency: 'As needed for pain' },
    ],
    followUp: 'Return in 7 days if symptoms persist. Avoid cold beverages.',
    followUpDate: '2026-03-05',
    hospital: 'Queen Elizabeth Central Hospital, Blantyre',
    doctor: 'Dr. Grace Banda',
    date: '24 February 2026',
    status: 'active',
  },
];
