/**
 * Chipatala Connect — Seed Script
 * Generates mock Malawian patient data and writes to db.json
 * Run: node db/seed.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── Malawian name pools ───────────────────────────────────────────────────────
const firstNamesMale = [
  'Chisomo','Kondwani','Limbani','Tadala','Yamikani','Dalitso','Mphatso',
  'Blessings','Innocent','Gift','Christopher','Francis','Peter','James',
  'Emmanuel','Isaac','Moses','Samuel','Daniel','Joseph','Takondwa','Wezzie',
  'Madalitso','Chikondi','Lusungu','Tawonga','Pemphero','Sangwani','Gracious'
];
const firstNamesFemale = [
  'Chisomo','Kondwani','Tadala','Yamikani','Dalitso','Mphatso','Thandiwe',
  'Alinafe','Tiyamike','Grace','Faith','Mercy','Loveness','Precious','Memory',
  'Edith','Agnes','Martha','Mary','Ruth','Esther','Doris','Violet','Rose',
  'Wanangwa','Liness','Felistas','Beatrice','Patricia','Theresa'
];
const lastNames = [
  'Banda','Phiri','Mwale','Chirwa','Tembo','Gondwe','Kamanga','Mvula',
  'Nyirenda','Lungu','Mbewe','Sakala','Zgambo','Nkhuwa','Kapito','Mkandawire',
  'Zimba','Chibwe','Zulu','Dlamini','Mkwanda','Matewere','Chikwanda','Nkhoma',
  'Mangani','Kumwenda','Kathumba','Msiska','Lipenga','Chanika'
];
const villages = [
  'Lilongwe','Blantyre','Mzuzu','Zomba','Kasungu','Mangochi','Salima',
  'Dedza','Ntcheu','Balaka','Liwonde','Karonga','Rumphi','Nkhata Bay',
  'Nkhotakota','Dowa','Mchinji','Neno','Phalombe','Thyolo','Chiradzulu',
  'Mulanje','Chikwawa','Nsanje','Chitipa'
];
const bloodTypes = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
const conditions = [
  {code:'E11',display:'Type 2 Diabetes'},
  {code:'I10',display:'Hypertension'},
  {code:'B20',display:'HIV/AIDS'},
  {code:'A00',display:'Cholera'},
  {code:'B54',display:'Malaria'},
  {code:'J18.9',display:'Pneumonia'},
  {code:'K29.7',display:'Gastritis'},
  {code:'M54.5',display:'Lower back pain'},
  {code:'J06.9',display:'Upper respiratory infection'},
  {code:'O80',display:'Normal delivery'},
];
const medications = [
  {code:'373254001',display:'Metformin 500mg','dose':'1 tablet twice daily'},
  {code:'372756006',display:'Amlodipine 5mg','dose':'1 tablet once daily'},
  {code:'387517004',display:'Cotrimoxazole 960mg','dose':'1 tablet once daily'},
  {code:'387207008',display:'Tenofovir/Lamivudine/Efavirenz','dose':'1 tablet at night'},
  {code:'372687004',display:'Amoxicillin 500mg','dose':'1 capsule three times daily'},
  {code:'387207009',display:'Paracetamol 500mg','dose':'2 tablets every 8 hours'},
  {code:'372756009',display:'Atenolol 50mg','dose':'1 tablet once daily'},
  {code:'387517009',display:'Folic Acid 5mg','dose':'1 tablet once daily'},
];
const allergies = [
  'Penicillin','Sulfonamides','None','None','None',
  'Aspirin','None','Codeine','None','None'
];
const doctorNames = [
  'Dr. Chisomo Banda','Dr. Thandiwe Phiri','Dr. Emmanuel Gondwe',
  'Dr. Grace Mwale','Dr. Moses Tembo'
];

// ── Facilities ────────────────────────────────────────────────────────────────
const facilities = [
  {
    id: 'fac-001',
    name: 'UNIMA Health Centre',
    location: 'Lilongwe',
    dhis2_code: 'MLW_LLW_UNIMA',
    api_key: 'key-unima-001',
    color: '#0F6E56'
  },
  {
    id: 'fac-002',
    name: 'Mzuzu Central Hospital',
    location: 'Mzuzu',
    dhis2_code: 'MLW_MZU_CENTRAL',
    api_key: 'key-mzuzu-002',
    color: '#185FA5'
  },
  {
    id: 'fac-003',
    name: 'Rumphi District Hospital',
    location: 'Rumphi',
    dhis2_code: 'MLW_RMP_DHO',
    api_key: 'key-rumphi-003',
    color: '#534AB7'
  }
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function uid() { return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'); }
function hashPin(pin) { return crypto.createHash('sha256').update('CHIPATALA_' + pin).digest('hex'); }
function nrbNumber(i) { return 'MW' + String(19600101 + i * 137).slice(0,8) + String(i).padStart(3,'0'); }
function daysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}
function randomDate(daysBack) { return daysAgo(rand(1, daysBack)); }

// ── Generate patients ─────────────────────────────────────────────────────────
function generatePatient(index) {
  const gender = Math.random() > 0.5 ? 'male' : 'female';
  const firstName = gender === 'male' ? pick(firstNamesMale) : pick(firstNamesFemale);
  const lastName = pick(lastNames);
  const age = rand(5, 75);
  const dob = daysAgo(age * 365);
  const nrb = nrbNumber(index);
  const pin = '1234'; // All demo patients use PIN 1234
  const primaryFacility = facilities[index % 3];
  const visitedFacilities = [primaryFacility.id];
  // ~30% of patients have visited a second facility
  if (Math.random() < 0.3) {
    const other = facilities.find(f => f.id !== primaryFacility.id);
    if (other) visitedFacilities.push(other.id);
  }

  // Conditions (0-2 chronic conditions)
  const numConditions = Math.random() < 0.5 ? 0 : rand(1, 2);
  const patientConditions = [];
  for (let i = 0; i < numConditions; i++) {
    patientConditions.push(pick(conditions));
  }

  // Medications based on conditions
  const patientMeds = [];
  if (patientConditions.find(c => c.code === 'E11')) patientMeds.push(medications[0]);
  if (patientConditions.find(c => c.code === 'I10')) patientMeds.push(medications[1], medications[6]);
  if (patientConditions.find(c => c.code === 'B20')) patientMeds.push(medications[2], medications[3]);

  // Generate encounters (visits)
  const numEncounters = rand(1, 6);
  const encounters = [];
  for (let i = 0; i < numEncounters; i++) {
    const facId = pick(visitedFacilities);
    const fac = facilities.find(f => f.id === facId);
    encounters.push({
      id: uid(),
      date: randomDate(365),
      facilityId: facId,
      facilityName: fac.name,
      doctor: pick(doctorNames),
      reason: pick(conditions).display,
      notes: `Patient presented with ${pick(['fever','cough','headache','abdominal pain','chest pain','fatigue'])}. Examination findings were within ${Math.random()>0.5?'normal':'abnormal'} limits.`,
      vitals: {
        bp: `${rand(100,160)}/${rand(60,100)}`,
        temp: (36 + Math.random() * 2).toFixed(1),
        pulse: rand(60, 100),
        weight: rand(40, 95) + 'kg'
      },
      labResults: Math.random() > 0.5 ? [{
        test: pick(['Full Blood Count','Blood Glucose','Malaria RDT','HIV Test','CD4 Count','Haemoglobin']),
        result: pick(['Negative','Normal','Positive','12.4 g/dL','450 cells/µL','6.2 mmol/L']),
        date: randomDate(30)
      }] : [],
      signed: true,
      facilitySignature: crypto.createHash('sha256')
        .update(facId + new Date().toISOString())
        .digest('hex').slice(0, 32)
    });
  }

  // FHIR-structured summary (Layer 1 — what patient carries)
  const summary = {
    resourceType: 'Bundle',
    type: 'collection',
    id: uid(),
    meta: { lastUpdated: new Date().toISOString() },
    entry: [
      {
        resource: {
          resourceType: 'Patient',
          id: uid(),
          identifier: [{ system: 'https://nrb.gov.mw', value: nrb }],
          name: [{ family: lastName, given: [firstName], use: 'official' }],
          gender,
          birthDate: dob,
          address: [{ city: pick(villages), country: 'Malawi' }],
        }
      },
      {
        resource: {
          resourceType: 'AllergyIntolerance',
          code: { text: pick(allergies) },
          criticality: Math.random() > 0.7 ? 'high' : 'low',
        }
      },
      ...patientConditions.map(c => ({
        resource: {
          resourceType: 'Condition',
          code: { coding: [{ system: 'http://hl7.org/fhir/sid/icd-10', code: c.code }], text: c.display },
          clinicalStatus: { coding: [{ code: 'active' }] }
        }
      })),
      ...patientMeds.map(m => ({
        resource: {
          resourceType: 'MedicationRequest',
          medicationCodeableConcept: { coding: [{ code: m.code }], text: m.display },
          dosageInstruction: [{ text: m.dose }],
          status: 'active'
        }
      }))
    ]
  };

  return {
    id: uid(),
    nrb,
    pinHash: hashPin(pin),
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    gender,
    age,
    dob,
    bloodType: pick(bloodTypes),
    phone: `+2659${rand(10000000, 99999999)}`,
    village: pick(villages),
    primaryFacilityId: primaryFacility.id,
    visitedFacilityIds: visitedFacilities,
    conditions: patientConditions,
    medications: patientMeds,
    allergy: pick(allergies),
    encounters,
    summary,
    createdAt: new Date().toISOString()
  };
}

// ── Generate audit log ────────────────────────────────────────────────────────
function makeAuditEntry(prevHash, data) {
  const content = JSON.stringify(data) + prevHash;
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  return { ...data, prevHash, rowHash: hash };
}

// ── Run seed ──────────────────────────────────────────────────────────────────
console.log('🌱 Seeding Chipatala Connect database...');
console.log('   Generating 500 patients across 3 facilities...');

const patients = [];
for (let i = 0; i < 500; i++) {
  patients.push(generatePatient(i));
  if ((i + 1) % 100 === 0) console.log(`   ✓ ${i + 1} patients generated`);
}

// Identity index
const identityIndex = [];
patients.forEach(p => {
  p.visitedFacilityIds.forEach(fid => {
    identityIndex.push({ patientId: p.id, facilityId: fid, createdAt: new Date().toISOString() });
  });
});

// Consents (start empty — demo grants them live)
const consents = [];

// Audit log
const auditLog = [];
let prevHash = '0'.repeat(64);
patients.slice(0, 20).forEach(p => {
  const entry = makeAuditEntry(prevHash, {
    id: uid(),
    patientId: p.id,
    actorFacilityId: p.primaryFacilityId,
    action: 'record_created',
    resourceType: 'Patient',
    consentId: null,
    timestamp: p.createdAt
  });
  auditLog.push(entry);
  prevHash = entry.rowHash;
});

// Queue (start with a few patients already queued at each facility)
const queue = [];
facilities.forEach(fac => {
  const facPatients = patients.filter(p => p.primaryFacilityId === fac.id).slice(0, 5);
  facPatients.forEach((p, i) => {
    queue.push({
      id: uid(),
      facilityId: fac.id,
      patientId: p.id,
      patientName: p.fullName,
      ticketNum: i + 1,
      status: i === 0 ? 'called' : 'waiting',
      checkedIn: new Date(Date.now() - (5 - i) * 12 * 60000).toISOString(),
      calledAt: i === 0 ? new Date().toISOString() : null,
      seenAt: null
    });
  });
});

const db = { facilities, patients, identityIndex, consents, auditLog, queue };

const dbPath = path.join(__dirname, 'db.json');
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

const stats = {
  patients: patients.length,
  facilities: facilities.length,
  identityEntries: identityIndex.length,
  encounters: patients.reduce((sum, p) => sum + p.encounters.length, 0),
  withMultipleFacilities: patients.filter(p => p.visitedFacilityIds.length > 1).length
};

console.log('\n✅ Database seeded successfully!');
console.log(`   Patients:          ${stats.patients}`);
console.log(`   Facilities:        ${stats.facilities}`);
console.log(`   Total encounters:  ${stats.encounters}`);
console.log(`   Cross-facility:    ${stats.withMultipleFacilities} patients visited 2+ facilities`);
console.log(`   DB file:           ${dbPath} (${(fs.statSync(dbPath).size / 1024 / 1024).toFixed(1)} MB)`);
console.log('\n🔑 Demo patient credentials:');
console.log('   Any patient NRB number + PIN: 1234');
console.log('   Try: ' + patients[0].nrb + ' (' + patients[0].fullName + ')');
console.log('   Try: ' + patients[1].nrb + ' (' + patients[1].fullName + ')');
console.log('   Try: ' + patients[2].nrb + ' (' + patients[2].fullName + ')');
console.log('\n🏥 Facility API keys:');
facilities.forEach(f => console.log(`   ${f.name}: ${f.api_key}`));
