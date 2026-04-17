# Chipatala Connect — Prototype

A privacy-first, decentralized health connectivity platform for African healthcare.

## Quick Start (2 minutes)

### Requirements
- Node.js 18+ (you already have this)
- A modern browser (Chrome/Firefox/Edge)

### Run it

```bash
# 1. Go into backend folder
cd backend

# 2. Seed the database (generates 500 mock patients)
node db/seed.js

# 3. Start the gateway
node index.js
```

That's it. The server prints:

```
🏥 Chipatala Connect Gateway
─────────────────────────────────────────────────
   API:      http://localhost:3000
   Patient:  http://localhost:3000/patient
   Facility: http://localhost:3000/facility
─────────────────────────────────────────────────
```

Open **two browser tabs**:
- **Tab 1 (Patient app):** http://localhost:3000/patient
- **Tab 2 (Facility dashboard):** http://localhost:3000/facility

---

## Demo Script (8 minutes)

### Login credentials
- **Any NRB number** from the seed output + **PIN: 1234**
- Example: `MW19600101000` (Joseph Nkhuwa)

### Scene 1 — Patient carries their own data (2 min)
1. Open the **patient app** (Tab 1)
2. Log in with any NRB + PIN 1234
3. Show the Summary tab: blood type, allergies, conditions, medications
4. Go to **Share QR** tab — show the QR code
5. Say: *"This patient carries their own encrypted health summary. No internet needed. Zero data cost."*

### Scene 2 — Facility searches for patient (1 min)
1. Open the **facility dashboard** (Tab 2)
2. Search for "Banda" or "Phiri"
3. Click a patient — show their summary loads instantly
4. Notice patients without records at this facility show 🔒

### Scene 3 — Cross-facility consent (3 min) ← KEY DEMO
1. In facility dashboard, click **Cross-Facility Demo** in sidebar
2. Search for a patient — pick one whose records are at another facility
3. Try to access records → show the **403 blocked** screen
4. Click **"Simulate: Patient grants consent"**
5. Records appear from the other facility — signed by source facility
6. Say: *"The gateway never saw the clinical content. It only routed the query."*

### Scene 4 — DHIS2 report (1 min)
1. Click **DHIS2 Report** in sidebar
2. Show the auto-generated report
3. Say: *"This replaces the manual Friday afternoon register tally."*

### Scene 5 — Security (30 sec)
1. Open: http://localhost:3000/health
2. Show: no clinical data in the health endpoint
3. Say: *"The central system holds zero medical data. A breach reveals nothing sensitive."*

---

## Facility API Keys (for testing)

| Facility | API Key |
|----------|---------|
| UNIMA Health Centre | `key-unima-001` |
| Mzuzu Central Hospital | `key-mzuzu-002` |
| Rumphi District Hospital | `key-rumphi-003` |

## API Reference

```
GET  /health                              System health + stats
GET  /facilities                          List all facilities
GET  /stats                               Funder impact metrics

POST /auth/identify                       Patient login
GET  /fhir/Patient/:id/$summary           Patient Layer 1 summary
GET  /fhir/Patient/:id/$everything        Full records (requires consent)
POST /fhir/Patient/search                 Search patients
POST /fhir/Encounter                      Save consultation

POST /consent                             Grant access
DELETE /consent/:id                       Revoke access
GET  /consents/:patientId                 List consents

GET  /queue/:facilityId                   Live queue state
POST /queue/checkin                       Check patient in
POST /queue/:ticketId/call                Call next patient

GET  /audit/:patientId                    Tamper-evident audit trail
GET  /dhis2/report/:facilityId            Auto DHIS2 report
```

## Architecture

```
chipatala/
├── backend/
│   ├── index.js          ← Gateway server (pure Node.js, zero dependencies)
│   ├── db/
│   │   ├── seed.js       ← Generates 500 mock Malawian patients
│   │   └── db.json       ← JSON database (created by seed.js)
└── frontend/
    ├── patient/
    │   └── index.html    ← Patient app (React via CDN)
    └── facility/
        └── index.html    ← Facility dashboard (React via CDN)
```

**Zero npm dependencies at runtime.** The gateway uses only Node.js built-in modules: `http`, `fs`, `crypto`, `url`, `path`.

## What the prototype proves

| Claim | How demonstrated |
|-------|-----------------|
| Patient carries own data | QR code on patient app, readable offline |
| Consent gate works | Cross-facility demo: 403 without consent, 200 after |
| Records stay at facility | Central DB has no clinical data (check /health) |
| Audit trail is tamper-evident | Hash chain visible in audit endpoint |
| DHIS2 auto-report | Generated from encounter data, no manual entry |
| Works offline | Disconnect WiFi — patient QR still readable by facility |

## Production upgrade path

| Prototype | Production |
|-----------|------------|
| JSON file database | PostgreSQL on AWS af-south-1 |
| Mock NRB login | Real NRB API integration |
| QR code transfer | BLE + WiFi Direct (Flutter app) |
| Railway/localhost | AWS af-south-1 (DPA compliant) |
| PIN hash only | libsodium Argon2id key derivation |

---

*Chipatala Connect — University of Malawi · Digital ID for Africa Hackathon*
