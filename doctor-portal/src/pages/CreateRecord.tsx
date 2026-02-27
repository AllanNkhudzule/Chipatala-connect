import { useState } from 'react';
import { Plus, Trash2, Copy, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { MedicalRecord, Prescription } from '../types';
import { doctorProfile } from '../data/mockData';
import { saveCreatedRecord } from '../services/storage';
import { publishRecord } from '../services/relay';

const recordTypes: { value: MedicalRecord['type']; label: string }[] = [
  { value: 'prescription', label: 'Prescription' },
  { value: 'diagnosis', label: 'Diagnosis' },
  { value: 'lab_result', label: 'Lab Result' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'referral', label: 'Referral' },
];

const emptyRx = (): Prescription => ({ medication: '', dosage: '', frequency: '' });

export default function CreateRecord() {
  const [type, setType] = useState<MedicalRecord['type']>('prescription');
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([emptyRx()]);
  const [followUp, setFollowUp] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [retrievalCode, setRetrievalCode] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateRx = (index: number, field: keyof Prescription, value: string) => {
    setPrescriptions((prev) =>
      prev.map((rx, i) => (i === index ? { ...rx, [field]: value } : rx)),
    );
  };

  const addRx = () => setPrescriptions((prev) => [...prev, emptyRx()]);

  const removeRx = (index: number) => {
    setPrescriptions((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const buildRecord = (): MedicalRecord => ({
    id: crypto.randomUUID(),
    type,
    patientName,
    patientId,
    diagnosis,
    clinicalNotes,
    prescriptions,
    followUp,
    followUpDate,
    hospital: doctorProfile.hospital,
    doctor: doctorProfile.name,
    date: new Date().toISOString().split('T')[0],
    status: 'active',
  });

  const handleGenerate = async () => {
    if (!diagnosis.trim()) return;
    setPublishing(true);
    setRetrievalCode('');
    const record = buildRecord();
    const code = await publishRecord(record);
    if (code) {
      record.retrievalCode = code;
      saveCreatedRecord(record);
      setRetrievalCode(code);
    }
    setPublishing(false);
  };

  const handleSaveDraft = () => {
    const record = buildRecord();
    saveCreatedRecord(record);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(retrievalCode);
  };

  const printQR = () => {
    const svg = document.querySelector('.qr-output svg');
    if (!svg) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(
      `<html><head><title>QR Code – ${patientName}</title></head><body style="display:flex;justify-content:center;align-items:center;min-height:100vh">${svg.outerHTML}</body></html>`,
    );
    w.document.close();
    w.print();
  };

  return (
    <>
      <div className="content-header">
        <h1>Create New Record</h1>
        <p>Fill in the form to create a medical record for a patient</p>
      </div>

      <div className="grid-2">
        {/* Form */}
        <div className="card">
          <div className="card-header">
            <h2>Record Details</h2>
          </div>

          <div className="form-group">
            <label>Record Type</label>
            <select
              className="form-control"
              value={type}
              onChange={(e) => setType(e.target.value as MedicalRecord['type'])}
            >
              {recordTypes.map((rt) => (
                <option key={rt.value} value={rt.value}>{rt.label}</option>
              ))}
            </select>
          </div>

          <div className="grid-2" style={{ gap: 16 }}>
            <div className="form-group">
              <label>Patient Name</label>
              <input
                className="form-control"
                placeholder="Full name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Patient National ID</label>
              <input
                className="form-control"
                placeholder="e.g. MW-12345678"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Primary Diagnosis</label>
            <input
              className="form-control"
              placeholder="e.g. Upper respiratory tract infection"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Clinical Notes</label>
            <textarea
              className="form-control"
              placeholder="Clinical observations, examination findings..."
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
            />
          </div>

          <div className="divider">Prescriptions</div>

          {prescriptions.map((rx, i) => (
            <div className="rx-row" key={i}>
              <div className="form-group">
                <label>Medication</label>
                <input
                  className="form-control"
                  placeholder="Drug name"
                  value={rx.medication}
                  onChange={(e) => updateRx(i, 'medication', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Dosage</label>
                <input
                  className="form-control"
                  placeholder="e.g. 500mg"
                  value={rx.dosage}
                  onChange={(e) => updateRx(i, 'dosage', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Frequency</label>
                <input
                  className="form-control"
                  placeholder="e.g. 3× daily"
                  value={rx.frequency}
                  onChange={(e) => updateRx(i, 'frequency', e.target.value)}
                />
              </div>
              <button
                className="btn btn-icon btn-secondary"
                title="Remove"
                onClick={() => removeRx(i)}
                disabled={prescriptions.length <= 1}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <button className="btn btn-outline btn-sm" onClick={addRx} style={{ marginBottom: 20 }}>
            <Plus size={16} /> Add Medication
          </button>

          <div className="divider">Follow-up</div>

          <div className="form-group">
            <label>Follow-up Instructions</label>
            <textarea
              className="form-control"
              placeholder="Instructions for the patient..."
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Follow-up Date</label>
            <input
              className="form-control"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={publishing || !patientName.trim() || !diagnosis.trim()}
            >
              {publishing ? 'Generating...' : 'Generate QR & Code'}
            </button>
            <button className="btn btn-secondary" onClick={handleSaveDraft}>
              {saved ? 'Saved!' : 'Save as Draft'}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div>
          <div className="record-preview" style={{ marginBottom: 20 }}>
            <div className="preview-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3>Formatted Record Preview</h3>
              <span className="badge badge-green">FHIR Format</span>
            </div>
            <div className="preview-body">
              <div className="preview-row">
                <span className="preview-label">Record Type</span>
                <span className="preview-value">
                  {recordTypes.find((rt) => rt.value === type)?.label}
                </span>
              </div>
              <div className="preview-row">
                <span className="preview-label">Patient</span>
                <span className="preview-value">{patientName || '—'}</span>
              </div>
              <div className="preview-row">
                <span className="preview-label">National ID</span>
                <span className="preview-value">{patientId || '—'}</span>
              </div>
              <div className="preview-row">
                <span className="preview-label">Diagnosis</span>
                <span className="preview-value">{diagnosis || '—'}</span>
              </div>
              <div className="preview-row">
                <span className="preview-label">Clinical Notes</span>
                <span className="preview-value">{clinicalNotes || '—'}</span>
              </div>
              {prescriptions.some((rx) => rx.medication) && (
                <div className="preview-row">
                  <span className="preview-label">Prescriptions</span>
                  <span className="preview-value">
                    {prescriptions
                      .filter((rx) => rx.medication)
                      .map((rx) => `${rx.medication} ${rx.dosage} ${rx.frequency}`)
                      .join('; ')}
                  </span>
                </div>
              )}
              <div className="preview-row">
                <span className="preview-label">Doctor</span>
                <span className="preview-value">{doctorProfile.name}</span>
              </div>
              <div className="preview-row">
                <span className="preview-label">Hospital</span>
                <span className="preview-value">{doctorProfile.hospital}</span>
              </div>
              {followUp && (
                <div className="preview-row">
                  <span className="preview-label">Follow-up</span>
                  <span className="preview-value">
                    {followUp}
                    {followUpDate && ` (${followUpDate})`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {retrievalCode ? (
            <div className="card" style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Record Published</h3>
              <div className="qr-output" style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <QRCodeSVG value={retrievalCode} size={200} level="H" />
              </div>
              <p style={{ fontSize: '.85rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                Retrieval Code
              </p>
              <p
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  letterSpacing: '.15em',
                  color: 'var(--color-primary)',
                  marginBottom: 16,
                }}
              >
                {retrievalCode}
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="btn btn-outline btn-sm" onClick={copyCode}>
                  <Copy size={16} /> Copy Code
                </button>
                <button className="btn btn-secondary btn-sm" onClick={printQR}>
                  <Printer size={16} /> Print QR
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div className="qr-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="3" height="3" />
                  <rect x="18" y="18" width="3" height="3" />
                  <rect x="14" y="18" width="3" height="3" />
                  <rect x="18" y="14" width="3" height="3" />
                </svg>
                <span>QR code will appear here</span>
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '.85rem', marginTop: 16 }}>
                Fill in the form and click &quot;Generate QR &amp; Code&quot; to create a scannable record
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
