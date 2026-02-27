# Chipatala Connect - Testing & Functionality Documentation

**Version:** Prototype v1.0  
**Date:** February 27, 2026  
**Purpose:** This document outlines the current functionalities, testing requirements, and project goals for the debugging and QA team.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Current Functionalities](#current-functionalities)
4. [Testing Checklist](#testing-checklist)
5. [Expected Behavior](#expected-behavior)
6. [Known Limitations](#known-limitations)
7. [Security Features](#security-features)
8. [Future Enhancements](#future-enhancements)

---

## Project Overview

**Mission:** Replace paper-based health passports in Malawi with a secure, patient-owned digital health record system.

**Core Concept:**
- Patients own and control their medical data stored on their personal devices
- Healthcare providers can temporarily access patient records with explicit consent
- Medical records are transferred via QR codes or secure access codes
- No permanent centralized storage of patient data

**Technology Stack:**
- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express (relay server)
- **Storage:** IndexedDB/LocalStorage with AES-256-GCM encryption
- **Data Transfer:** REST API + QR codes
- **PWA:** Service workers for offline capability

---

## System Architecture

### Components
1. **Patient App** (`patient-app/`) - Port 5173
   - Patient-facing Progressive Web App
   - Stores encrypted medical records locally
   - Generates access tokens for doctors
   - Retrieves new records via QR/code scan

2. **Doctor Portal** (`doctor-portal/`) - Port 5174
   - Healthcare provider interface
   - Creates and publishes medical records
   - Requests temporary access to patient data
   - Session-based, ephemeral storage

3. **Relay Server** (`relay-server/`) - Port 3001
   - Temporary data exchange facilitator
   - In-memory storage with TTL expiration
   - No persistent database
   - CORS-enabled for local development

---

## Current Functionalities

### Patient App Features

#### 1. Profile Management
**Location:** `/profile`

**Capabilities:**
- Create and edit personal information (name, national ID, age, gender, blood type, allergies)
- Data is encrypted and stored locally on device
- Profile data is used when granting access to doctors

**Test Cases:**
- [ ] Create new profile with all fields
- [ ] Edit existing profile fields
- [ ] Save profile and verify persistence after page reload
- [ ] Verify encrypted storage in browser DevTools → Application → Local Storage

#### 2. Dashboard
**Location:** `/`

**Capabilities:**
- View patient vitals and health summary
- See active conditions and current medications
- Review recent activity timeline
- **Grant Access:** Generate time-limited consent token (PAT-XXXX-XX format) for doctor access
- Navigate to retrieve records or view history

**Test Cases:**
- [ ] Dashboard loads with correct patient information
- [ ] Click "Grant Access" generates a token
- [ ] Token displays both as text and QR code
- [ ] QR code is scannable
- [ ] Token expires after specified time (default 30 minutes)
- [ ] "Retrieve New Record" navigates to `/retrieve`

#### 3. Retrieve Records
**Location:** `/retrieve`

**Capabilities:**
- Enter retrieval code manually (REC-XXXX-XXX format)
- Scan QR code using device camera
- Preview received medical record before accepting
- Accept and save record to local encrypted storage
- Decline unwanted records

**Test Cases:**
- [ ] Manual code entry works
- [ ] "Tap to scan QR code" opens camera scanner
- [ ] Scanning valid QR code retrieves record
- [ ] Record preview displays all details correctly
- [ ] "Accept & Save" encrypts and stores record
- [ ] "Decline" rejects record without saving
- [ ] Invalid code shows appropriate error message
- [ ] Saved records appear in Medical History

#### 4. Medical History
**Location:** `/history`

**Capabilities:**
- View complete medical timeline
- Filter by hospital, record type, and date range
- See statistics (hospitals visited, total records, prescriptions, lab results)
- Expand record details

**Test Cases:**
- [ ] Timeline displays all saved records chronologically
- [ ] Hospital filter works correctly
- [ ] Record type filter works correctly
- [ ] Date range filter works correctly
- [ ] Statistics cards show accurate counts
- [ ] All record types display properly (prescription, diagnosis, lab_result, consultation)

#### 5. PWA Installation
**Capabilities:**
- Install app to home screen on mobile devices
- Install app to desktop on supported browsers
- Work offline after installation
- Auto-update service worker

**Test Cases:**
- [ ] Browser shows "Install" prompt
- [ ] App installs successfully on mobile (Android/iOS)
- [ ] App installs successfully on desktop (Chrome/Edge)
- [ ] Installed app opens in standalone mode (no browser UI)
- [ ] App icon displays correctly
- [ ] Offline mode works (view saved records without internet)
- [ ] App updates automatically when new version is deployed

---

### Doctor Portal Features

#### 1. Patient Access
**Location:** `/patient-access`

**Capabilities:**
- Enter patient consent token manually
- Scan patient QR code to auto-fill token
- Request temporary access to patient records
- View patient profile (name, age, allergies, vitals)
- Browse patient diagnoses, prescriptions, lab results, and vitals in tabs
- Session timer counts down and auto-expires
- Manual session termination

**Test Cases:**
- [ ] Manual token entry works
- [ ] "Scan QR" button opens camera scanner
- [ ] Scanning patient QR code auto-fills token
- [ ] Valid token grants access successfully
- [ ] Invalid/expired token shows error
- [ ] Patient data loads and displays correctly in all tabs
- [ ] Allergy alerts display prominently
- [ ] Session timer counts down correctly
- [ ] Session auto-expires on timeout
- [ ] "End Session" immediately terminates access
- [ ] After session ends, patient data is cleared

#### 2. Create Record
**Location:** `/create-record`

**Capabilities:**
- **No patient name required** - Doctor focuses only on medical details
- Select record type (prescription, diagnosis, lab result, consultation, referral)
- Enter diagnosis and clinical notes
- Add multiple prescriptions (medication, dosage, frequency)
- Set follow-up instructions and date
- Generate retrieval code (REC-XXXX-XXX format)
- Display QR code for patient scanning
- Save draft records locally
- Print QR code

**Test Cases:**
- [ ] All record types are selectable
- [ ] Can create record without patient name/ID
- [ ] Add prescription button adds new medication row
- [ ] Remove prescription button works (minimum 1 prescription)
- [ ] "Generate QR & Code" creates record successfully
- [ ] Retrieval code displays in correct format
- [ ] QR code is generated and scannable
- [ ] "Copy Code" copies to clipboard
- [ ] "Print QR" opens print dialog
- [ ] "Save as Draft" stores record locally
- [ ] Record preview updates in real-time

#### 3. Dashboard
**Location:** `/`

**Capabilities:**
- Overview of doctor activity
- Quick access to common actions
- Statistics display

**Test Cases:**
- [ ] Dashboard loads correctly
- [ ] Quick action buttons navigate properly

---

### Relay Server Features

#### Endpoints

**1. POST `/api/records`**
- Receives medical record from doctor
- Stores temporarily (2 hour TTL)
- Returns retrieval code (REC-XXXX-XXX)

**Test Cases:**
- [ ] Valid record POST returns code
- [ ] Code format is correct
- [ ] Record is retrievable immediately

**2. GET `/api/records/:code`**
- Retrieves medical record by code
- Returns 404 if code invalid or expired

**Test Cases:**
- [ ] Valid code returns correct record
- [ ] Invalid code returns 404
- [ ] Expired code returns 404

**3. POST `/api/access-grants`**
- Receives patient data and consent
- Stores temporarily (45 minute TTL)
- Returns access token (PAT-XXXX-XX)

**Test Cases:**
- [ ] Valid grant POST returns token
- [ ] Token format is correct
- [ ] Grant is retrievable immediately

**4. GET `/api/access-grants/:token`**
- Retrieves access grant by token
- Returns patient data and medical records

**Test Cases:**
- [ ] Valid token returns complete patient data
- [ ] Invalid token returns 404
- [ ] Expired token returns 404

**5. DELETE `/api/records/:code`**
- Manually deletes a record

**Test Cases:**
- [ ] DELETE removes record successfully
- [ ] Subsequent GET returns 404

**6. GET `/health`**
- Health check endpoint

**Test Cases:**
- [ ] Returns `{ status: 'ok' }`

---

## Testing Checklist

### Critical Path Testing

#### End-to-End: Patient Receives Record
1. [ ] Doctor creates new medical record
2. [ ] System generates QR code and retrieval code
3. [ ] Patient scans QR code or enters code manually
4. [ ] Patient previews record details
5. [ ] Patient accepts and saves record
6. [ ] Record appears in patient's Medical History
7. [ ] Record is encrypted in local storage

#### End-to-End: Doctor Accesses Patient Records
1. [ ] Patient clicks "Grant Access" on Dashboard
2. [ ] System generates consent token and QR code
3. [ ] Doctor scans patient QR code or enters token
4. [ ] Doctor views patient profile and medical history
5. [ ] Session timer counts down
6. [ ] Session expires automatically or manually
7. [ ] Patient data is cleared from doctor's view

### Security Testing

#### Encryption
- [ ] Patient profile stored encrypted in localStorage
- [ ] Medical records stored encrypted in localStorage
- [ ] Decryption succeeds with valid device key
- [ ] Data is unreadable in browser storage (ciphertext only)

#### Access Control
- [ ] Cannot access patient data without valid token
- [ ] Token expires after specified duration
- [ ] Expired tokens are rejected
- [ ] Session data cleared after logout/expiration

#### Data Privacy
- [ ] No patient data persisted on relay server
- [ ] Relay server stores only temporary ciphertext
- [ ] Records auto-delete after TTL expiration
- [ ] No data leakage in browser console/network tab

### Browser Compatibility
- [ ] Chrome/Edge (Windows, Mac, Android)
- [ ] Firefox (Windows, Mac, Android)
- [ ] Safari (Mac, iOS)
- [ ] Samsung Internet (Android)

### Device Testing
- [ ] Desktop (1920×1080, 1366×768)
- [ ] Tablet (768×1024)
- [ ] Mobile (375×667, 414×896)
- [ ] Dark mode support
- [ ] Touch gestures work on mobile

### Offline Functionality
- [ ] PWA installs successfully
- [ ] View saved records offline
- [ ] Profile accessible offline
- [ ] Medical History accessible offline
- [ ] QR scanner requires internet (camera access)
- [ ] Grant access requires internet (relay server)
- [ ] Appropriate offline indicators shown

### Performance
- [ ] Dashboard loads in < 2 seconds
- [ ] QR scanning responds in < 1 second
- [ ] Token generation takes < 3 seconds
- [ ] Record retrieval takes < 2 seconds
- [ ] No memory leaks during long sessions
- [ ] App remains responsive with 100+ records

---

## Expected Behavior

### Data Flow: Record Creation → Transfer → Storage

```
Doctor Portal                    Relay Server                   Patient App
     │                                │                              │
     ├─ Create Record                 │                              │
     ├─ POST /api/records ────────────>                              │
     │                                ├─ Store (2hr TTL)             │
     │                                ├─ Generate code: REC-XXXX-XXX │
     │  <──────────────────────────── Return code                    │
     ├─ Display QR code               │                              │
     │                                │                              │
     │                                │          Patient scans QR ───┤
     │                                │  <──── GET /api/records/:code│
     │                                ├─ Return record ─────────────>│
     │                                │                              ├─ Preview
     │                                │                              ├─ Accept
     │                                │                              ├─ Encrypt
     │                                │                              └─ Store locally
```

### Data Flow: Grant Access → Doctor Views Records

```
Patient App                      Relay Server                   Doctor Portal
     │                                │                              │
     ├─ Click "Grant Access"          │                              │
     ├─ Collect profile + records     │                              │
     ├─ POST /api/access-grants ──────>                              │
     │                                ├─ Store (45min TTL)           │
     │                                ├─ Generate token: PAT-XXXX-XX │
     │  <──────────────────────────── Return token                   │
     ├─ Display QR + token            │                              │
     │                                │                              │
     │                                │          Doctor scans QR ────┤
     │                                │  <──── GET /api/access-grants/:token
     │                                ├─ Return patient data ────────>│
     │                                │                              ├─ Display
     │                                │                              ├─ Start timer
     │                                │                              └─ View records
```

---

## Known Limitations (Prototype Phase)

### Security
- **Device-bound encryption only** - If device is lost, data is lost (no cloud backup)
- **No biometric authentication** - Simple device key, no PIN/fingerprint lock
- **No end-to-end encryption for relay** - Data sent to relay server is not encrypted in transit (use HTTPS in production)
- **No rate limiting** - Relay server accepts unlimited requests
- **No user authentication** - Anyone can use the apps (no login system)

### Data Management
- **No backup/restore** - No export/import functionality
- **No data synchronization** - Records only on one device
- **No multi-device support** - Cannot access same data from multiple devices
- **In-memory relay storage** - Server restart loses all pending transfers

### Functionality
- **QR scanner requires camera permission** - Fallback to manual entry if denied
- **No emergency access mode** - Cannot access records without patient consent
- **No audit logs** - Cannot track who accessed what and when
- **No data aggregation** - Hospitals cannot collect de-identified statistics
- **One-way record transfer** - Cannot edit/delete records after saving

### Technical
- **No production deployment** - Configured for localhost only
- **No database** - All relay data is volatile
- **No HTTPS** - Development uses HTTP (insecure)
- **No CDN** - Assets served directly from server
- **Mock data present** - Sample data hardcoded for demonstration

---

## Security Features (Implemented)

### Client-Side Encryption
- **Algorithm:** AES-256-GCM (industry standard)
- **Key Storage:** Device-bound symmetric key in localStorage
- **Data Encrypted:**
  - Patient profile (name, ID, allergies, etc.)
  - Medical records (diagnoses, prescriptions, notes)
- **Decryption:** In-memory only, on-demand

### Access Control
- **Consent-based sharing:** Patient must explicitly grant access
- **Time-limited tokens:** Default 30 minutes for access grants
- **Ephemeral doctor storage:** Session data cleared on logout
- **Code-based retrieval:** Single-use codes for record transfer

### Privacy
- **Local-first architecture:** Data never leaves device except on explicit share
- **No centralized database:** Relay server has no persistent storage
- **TTL enforcement:** Relay auto-deletes expired codes/tokens
- **No analytics/tracking:** No third-party services collecting data

---

## Future Enhancements (Post-Prototype)

### Phase 2: Enhanced Security
- [ ] Biometric authentication (fingerprint, face ID)
- [ ] PIN/password protection for app access
- [ ] End-to-end encryption for relay transfers
- [ ] Secure key recovery mechanism
- [ ] Encrypted cloud backup (user-controlled)

### Phase 3: Core Features
- [ ] Emergency access mode
- [ ] Multi-device synchronization
- [ ] Data export/import (encrypted JSON)
- [ ] Record editing/deletion
- [ ] Medication reminders
- [ ] Appointment scheduling

### Phase 4: Healthcare Integration
- [ ] FHIR-compliant data format
- [ ] Integration with hospital EMR systems
- [ ] Pharmacy e-prescription support
- [ ] Lab result direct import
- [ ] Insurance claim submission

### Phase 5: Advanced Features
- [ ] AI health insights
- [ ] Symptom checker
- [ ] Vaccination tracking
- [ ] Family account linking
- [ ] Multilingual support (Chichewa, English)
- [ ] Voice notes for illiterate patients

### Phase 6: Production Readiness
- [ ] National ID verification
- [ ] Healthcare provider licensing verification
- [ ] Audit logging and compliance
- [ ] GDPR/HIPAA compliance (if international)
- [ ] Load balancing and scaling
- [ ] 24/7 monitoring and alerting

---

## Testing Environment Setup

### Prerequisites
```bash
Node.js >= 18.x
npm >= 9.x
Modern browser (Chrome, Firefox, Edge, Safari)
```

### Installation
```bash
# Clone repository
git clone <repo-url>
cd Chipatala-connect

# Install relay server
cd relay-server
npm install

# Install patient app
cd ../patient-app
npm install

# Install doctor portal
cd ../doctor-portal
npm install
```

### Running Tests
```bash
# Terminal 1: Start relay server
cd relay-server
npm start
# → http://localhost:3001

# Terminal 2: Start patient app
cd patient-app
npm run dev
# → http://localhost:5173

# Terminal 3: Start doctor portal
cd doctor-portal
npm run dev
# → http://localhost:5174
```

### Test Data
Use the sample patient data in `patient-app/src/data/mockData.ts`:
- **Name:** Tamanda Mbewe
- **National ID:** MW-2901-4487-XZ
- **Age:** 28
- **Blood Type:** O+
- **Allergies:** Penicillin

---

## Success Criteria

### Prototype Acceptance
- [ ] All critical path tests pass
- [ ] No security vulnerabilities in basic flows
- [ ] PWA installs on mobile and desktop
- [ ] Offline viewing of saved records works
- [ ] QR scanning works on real devices
- [ ] UI is responsive on all screen sizes
- [ ] No console errors in normal usage
- [ ] Encryption/decryption works reliably

### User Acceptance
- [ ] Patient can save and view medical records
- [ ] Doctor can create records easily
- [ ] Data transfer works without internet expertise
- [ ] Interface is intuitive (minimal training needed)
- [ ] Performance is acceptable on low-end devices

---

## Bug Reporting

### Information Required
- **Device:** OS, browser, screen size
- **Steps to reproduce:** Numbered list
- **Expected behavior:** What should happen
- **Actual behavior:** What actually happens
- **Screenshots:** If applicable
- **Console errors:** DevTools → Console tab
- **Network logs:** DevTools → Network tab

### Severity Levels
- **Critical:** App crashes, data loss, security breach
- **High:** Major feature broken, cannot complete task
- **Medium:** Feature partly broken, workaround exists
- **Low:** UI glitch, typo, minor inconvenience

---

## Contact & Support

**Testing Team Lead:** [TBD]  
**Development Team:** [TBD]  
**Project Manager:** [TBD]

**Documentation Version:** 1.0  
**Last Updated:** February 27, 2026
