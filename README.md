# Chipatala Connect

## What is Chipatala Connect?

Chipatala Connect is a digital health passport system designed to replace the traditional paper-based health passports (bukhu la chipatala) used across Malawi. Patients in Malawi carry physical booklets that record their diagnoses, prescriptions, treatment history, and lab results. These booklets are easily lost, damaged, or forgotten — and because every hospital runs its own isolated record system, there is no reliable way to share a patient's history between facilities.

Chipatala Connect solves this by putting the patient in control. Medical records live on the patient's own device. Hospitals never permanently store patient data — they only generate records and hand them off. When a doctor needs to see a patient's history, the patient explicitly grants time-limited access. When access expires, the doctor can no longer see anything.

This prototype is a working demonstration of that concept.

## How the System Works

The system has two sides and a relay that connects them.

### The Patient Side

The patient carries a mobile-first web app on their phone. It serves as their digital health passport — a personal, portable medical record that works across any hospital. The patient can:

- **View their dashboard** — current vitals, active conditions, medications, allergies, and recent activity at a glance.
- **Retrieve new records** — after a hospital visit, the doctor gives the patient a short retrieval code (e.g. `REC-ABCD-XYZ`) or a QR code. The patient enters that code in their app, reviews the record, and accepts it. The record is saved locally on their device.
- **Browse their full medical history** — a chronological timeline of every diagnosis, prescription, lab result, and consultation across all hospitals they have ever visited. Filterable by hospital, record type, and date range.
- **Grant temporary access** — when visiting a new doctor, the patient taps "Grant Access." The system generates a one-time consent token (e.g. `PAT-ABCD-XYZ`). The patient reads this token to the doctor. The doctor enters it on their end to view the patient's records for a limited session (30 minutes). After that, access automatically revokes.

Records are stored in the browser's localStorage. The patient owns the data. No central database holds it.

### The Doctor / Hospital Side

The doctor uses a desktop-oriented web portal from their workstation at the hospital. The portal lets them:

- **View their dashboard** — how many patients they've seen today, active access sessions, records created and sent.
- **Create a medical record** — a structured form for record type (prescription, diagnosis, lab result, consultation, referral), patient details, diagnosis, clinical notes, prescriptions (add/remove medications), and follow-up instructions. A live preview on the right side shows the formatted record exactly as the patient will see it.
- **Generate a retrieval code and QR** — once the record is complete, the doctor clicks "Generate QR & Code." The record is published to the relay server, which returns a short retrieval code. A QR code is also generated. The doctor can print the QR, read the code aloud, or hand it to the patient on a slip. The patient then uses that code to pull the record into their own app.
- **Request temporary access to a patient's records** — the doctor enters the consent token the patient provides. The relay returns the patient's full profile, medical history, vitals, allergies, diagnoses, prescriptions, and lab results. Everything is displayed in a tabbed interface with a session timer counting down. A prominent allergy alert warns the doctor of known allergies (e.g., Penicillin). When the session ends, the data disappears.

The hospital never keeps the patient's data. It only exists on the relay temporarily during transfer, then on the patient's device permanently.

### The Relay Server

The relay is a lightweight Express.js service that acts as a temporary mailbox between the two sides. It does not store anything permanently. It has two jobs:

1. **Record transfer** — the doctor POSTs a medical record. The relay stores it in memory with a generated retrieval code and returns that code. The patient GETs the record by code. Records auto-expire after 2 hours.
2. **Access grants** — the patient POSTs their profile and medical history. The relay stores it with a generated consent token and returns the token. The doctor GETs the data by token. Access grants auto-expire after 45 minutes.

A cleanup job runs every 60 seconds to purge expired entries. Nothing is persisted to disk. If the relay restarts, all pending transfers are gone — by design. This mirrors the real system's principle: the relay is a conduit, not a warehouse.

### Relay API

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/records` | POST | Doctor publishes a record. Returns `{ code }`. |
| `/api/records/:code` | GET | Patient retrieves a record by code. |
| `/api/records/:code` | DELETE | Remove a record after retrieval. |
| `/api/access-grants` | POST | Patient shares their data. Returns `{ token }`. |
| `/api/access-grants/:token` | GET | Doctor retrieves shared patient data by token. |
| `/health` | GET | Health check. Returns `{ status: "ok" }`. |

## Data Flow

### Flow 1: Doctor Creates Record, Patient Retrieves It

```
  Doctor Portal                    Relay Server                    Patient App
  ─────────────                    ────────────                    ───────────
       │                                │                              │
       │  POST /api/records             │                              │
       │  (full medical record)         │                              │
       │ ──────────────────────────►    │                              │
       │                                │                              │
       │  ◄── { code: "REC-ABCD-XYZ" } │                              │
       │                                │                              │
       │  Doctor shows code / QR        │                              │
       │  to patient                    │                              │
       │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─►  │
       │                                │                              │
       │                                │   GET /api/records/REC-ABCD  │
       │                                │  ◄───────────────────────────│
       │                                │                              │
       │                                │   { record data }  ─────►   │
       │                                │                              │
       │                                │              Patient reviews │
       │                                │              and saves to    │
       │                                │              localStorage    │
```

### Flow 2: Patient Grants Access, Doctor Views Records

```
  Patient App                      Relay Server                    Doctor Portal
  ───────────                      ────────────                    ─────────────
       │                                │                              │
       │  POST /api/access-grants       │                              │
       │  (profile + all records)       │                              │
       │ ──────────────────────────►    │                              │
       │                                │                              │
       │  ◄── { token: "PAT-ABCD-XYZ"} │                              │
       │                                │                              │
       │  Patient reads token           │                              │
       │  to doctor                     │                              │
       │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─►  │
       │                                │                              │
       │                                │  GET /api/access-grants/PAT  │
       │                                │  ◄───────────────────────────│
       │                                │                              │
       │                                │  { patient data } ──────►   │
       │                                │                              │
       │                                │         Doctor views records │
       │                                │         for 30 min session   │
       │                                │         then data disappears │
```

## Architecture

```
┌──────────────────────────────┐
│         Patient App          │    Mobile-first React SPA
│                              │    Runs on patient's phone
│  Dashboard                   │    Data stored in localStorage
│  Retrieve Records            │    No account / login needed
│  Medical History             │
│  Grant Access (modal)        │
└──────────────┬───────────────┘
               │ HTTPS
               ▼
┌──────────────────────────────┐
│        Relay Server          │    Express.js, in-memory store
│                              │    No database, no persistence
│  POST/GET  /api/records      │    Records expire after 2 hrs
│  POST/GET  /api/access-grants│    Access grants expire after 45 min
│  GET       /health           │    Cleanup runs every 60s
└──────────────┬───────────────┘
               │ HTTPS
               ▼
┌──────────────────────────────┐
│       Doctor Portal          │    Desktop-first React SPA
│                              │    Runs at hospital workstation
│  Dashboard                   │    No permanent patient storage
│  Create Record + QR          │    Session-based access only
│  Patient Access (tabbed)     │
└──────────────────────────────┘
```

All three components are deployed independently. The two frontends only need the relay server's URL to communicate.

## Key Design Principles

- **Patient-owned data.** The patient's device is the only permanent store. The relay is ephemeral. The hospital keeps nothing.
- **Consent-driven access.** A doctor cannot see a patient's records without a token that the patient explicitly generates and hands over.
- **Time-limited sessions.** Access grants expire. There is no "remember me" or permanent authorization.
- **Decentralized.** No central patient database. Each patient's records live on their own device, portable across any hospital.
- **Offline-capable.** Once records are saved to the patient's device, they can be viewed without an internet connection. The relay is only needed during transfer.

## Mock Data

This prototype ships with realistic mock data for demonstration:

- **Patient:** Tamanda Mbewe (National ID: MW-2901-4487-XZ), 28-year-old female, blood type O+, allergic to Penicillin.
- **Conditions:** Mild Asthma (managed), Vitamin D Deficiency (ongoing).
- **Medications:** Salbutamol Inhaler, Vitamin D3 2000 IU, Paracetamol 500mg.
- **Medical history:** 7 timeline entries spanning 2023–2026 across 4 hospitals (Queen Elizabeth Central, Kamuzu Central, Mzuzu Central, Zomba Central) and 4 doctors.
- **Doctor:** Dr. Grace Banda, General Practitioner, Queen Elizabeth Central Hospital, Blantyre.

All data is pre-loaded. No setup required to start the demo.

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Patient App | React 19, TypeScript, Vite, React Router 7 | Mobile-first SPA |
| Doctor Portal | React 19, TypeScript, Vite, React Router 7 | Desktop-first SPA |
| Relay Server | Express.js, Node.js | Ephemeral data broker |
| Icons | Lucide React | Consistent icon set |
| QR Codes | qrcode.react | Scannable transfer codes |
| Local Storage | Browser localStorage | Patient-side persistence |
| Styling | Custom CSS, CSS variables | Light/dark mode, responsive |

## Project Structure

```
chipatala-connect/
├── patient-app/                # Patient-facing SPA (mobile-first)
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.tsx      # Sidebar, topbar, mobile menu
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx   # Vitals, conditions, meds, activity
│   │   │   ├── RetrieveRecords.tsx  # Code entry, record preview, save
│   │   │   └── MedicalHistory.tsx   # Filterable timeline
│   │   ├── services/
│   │   │   ├── relay.ts        # HTTP calls to relay server
│   │   │   └── storage.ts      # localStorage read/write
│   │   ├── data/
│   │   │   └── mockData.ts     # Patient profile, timeline, records
│   │   ├── types.ts            # Shared TypeScript interfaces
│   │   ├── App.tsx             # Router setup
│   │   ├── App.css             # Full design system (1000+ lines)
│   │   └── main.tsx            # Entry point
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── doctor-portal/              # Doctor-facing SPA (desktop-first)
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.tsx      # Sidebar with doctor profile, topbar
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx   # Stats, sessions table, recent records
│   │   │   ├── CreateRecord.tsx     # Form + live preview + QR gen
│   │   │   └── PatientAccess.tsx    # Token entry, tabbed record view
│   │   ├── services/
│   │   │   ├── relay.ts        # HTTP calls to relay server
│   │   │   └── storage.ts      # localStorage for drafts
│   │   ├── data/
│   │   │   └── mockData.ts     # Doctor profile, dashboard stats
│   │   ├── types.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── relay-server/               # Ephemeral data relay
│   ├── index.js                # ~70 lines, entire server
│   └── package.json
│
├── prototype/                  # Original HTML/CSS design reference
│   ├── patient-dashboard.html
│   ├── patient-retrieve.html
│   ├── patient-history.html
│   ├── doctor-dashboard.html
│   ├── doctor-create-record.html
│   ├── doctor-access.html
│   ├── styles.css
│   └── script.js
│
├── package.json                # Root scripts (runs all 3 services)
└── README.md
```

## Running Locally

```bash
# Install everything
npm install
cd relay-server && npm install && cd ..
cd patient-app && npm install && cd ..
cd doctor-portal && npm install && cd ..

# Start all three services at once
npm run dev
```

This launches:

| Service | URL | Description |
|---|---|---|
| Relay Server | http://localhost:3001 | Data broker |
| Patient App | http://localhost:5173 | Open in browser (or phone-sized viewport) |
| Doctor Portal | http://localhost:5174 | Open in browser |

To run individually:

```bash
npm run dev:relay     # Relay only
npm run dev:patient   # Patient app only
npm run dev:doctor    # Doctor portal only
```

## Deployment

The three services deploy independently. Deploy the relay first, then point both frontends at it.

### 1. Relay Server

Deploy to any Node.js host. No database needed — it runs entirely in memory.

```bash
cd relay-server
npm start
# Listens on PORT (default 3001)
```

Suitable platforms: Render, Railway, Fly.io, any VPS with Node.js.

### 2. Patient App

```bash
cd patient-app
VITE_RELAY_URL=https://your-relay.example.com npm run build
```

Deploy the generated `dist/` folder to any static host. Configure a rewrite rule so all paths serve `index.html` (required for client-side routing).

### 3. Doctor Portal

```bash
cd doctor-portal
VITE_RELAY_URL=https://your-relay.example.com npm run build
```

Same process — deploy `dist/` to a static host with SPA rewrite rules.

### Environment Variables

| Variable | Service | Default | Purpose |
|---|---|---|---|
| `PORT` | Relay Server | `3001` | Port the relay listens on |
| `VITE_RELAY_URL` | Patient App | `http://localhost:3001` | Where to reach the relay |
| `VITE_RELAY_URL` | Doctor Portal | `http://localhost:3001` | Where to reach the relay |

### Example Deployment

| Component | Platform | URL |
|---|---|---|
| Relay Server | Render | `https://chipatala-relay.onrender.com` |
| Patient App | Vercel | `https://chipatala-patient.vercel.app` |
| Doctor Portal | Vercel | `https://chipatala-doctor.vercel.app` |

## Presenting the Demo

Open the Doctor Portal and Patient App side by side (two browser windows, or one on a laptop and one on a phone).

**Demo 1 — Record Transfer:**
1. Doctor Portal → Create Record → fill form → Generate QR & Code.
2. Note the retrieval code.
3. Patient App → Retrieve Records → enter code → Retrieve → Accept & Save.
4. Patient App → Dashboard / Medical History — the new record appears.

**Demo 2 — Temporary Access:**
1. Patient App → Dashboard → Grant Access → note the consent token.
2. Doctor Portal → Patient Access → enter token → Request Access.
3. Browse the patient's full history across tabs (Diagnoses, Prescriptions, Labs, Vitals).
4. Note the allergy alert for Penicillin.
5. Session timer counts down. Click "End Session" to revoke immediately.

Both flows demonstrate the core thesis: patients own their data, doctors get temporary access only with consent, and records transfer securely without a central database.
