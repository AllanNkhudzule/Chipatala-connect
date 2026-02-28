import { useState } from 'react';
import type { MedicalRecord } from '../types';
import { retrieveRecord } from '../services/relay';
import { saveRecord } from '../services/storage';
import QrScanner from '../components/QrScanner';
import { ClipboardList, CheckCircle2 } from 'lucide-react';

type Status = 'idle' | 'loading' | 'preview' | 'error' | 'saved' | 'scanning';

export default function RetrieveRecords() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [record, setRecord] = useState<MedicalRecord | null>(null);

  async function handleRetrieve(retrievalCode?: string) {
    const trimmed = (retrievalCode || code).trim();
    if (!trimmed) return;
    setStatus('loading');
    const result = await retrieveRecord(trimmed);
    if (result) {
      setRecord(result);
      setStatus('preview');
    } else {
      setRecord(null);
      setStatus('error');
    }
  }

  function handleAccept() {
    if (record) {
      saveRecord(record);
      setStatus('saved');
    }
  }

  function handleDecline() {
    setRecord(null);
    setCode('');
    setStatus('idle');
  }

  function handleReset() {
    setRecord(null);
    setCode('');
    setStatus('idle');
  }

  const handleQrScan = (result: string) => {
    setCode(result);
    setStatus('loading');
    handleRetrieve(result);
  };

  if (status === 'scanning') {
    return (
      <div className="card center-card">
        <div className="content-header" style={{ textAlign: 'center', marginBottom: 20 }}>
          <h1>Scan Medical Record QR</h1>
          <p>Point your camera at the QR code provided by the doctor.</p>
        </div>
        <QrScanner onResult={handleQrScan} />
        <button
          className="btn btn-secondary"
          onClick={() => setStatus('idle')}
          style={{ marginTop: 16 }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="content-header" style={{ textAlign: 'center' }}>
        <h1>Retrieve a Medical Record</h1>
        <p>Enter the retrieval code provided by your doctor or scan the QR code.</p>
      </div>

      {/* Code entry card */}
      {(status === 'idle' || status === 'loading' || status === 'error') && (
        <div className="card center-card" style={{ padding: 32 }}>
          <div className="code-input-wrap">
            <input
              className="code-input"
              type="text"
              placeholder="ABC-1234-XYZ"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleRetrieve()}
              disabled={status === 'loading'}
            />
          </div>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => handleRetrieve()}
              disabled={!code.trim() || status === 'loading'}
            >
              {status === 'loading' ? 'Retrieving…' : 'Retrieve Record'}
            </button>
          </div>

          {status === 'error' && (
            <p
              style={{
                color: 'var(--color-danger)',
                textAlign: 'center',
                marginTop: 14,
                fontSize: '.88rem',
              }}
            >
              Record not found. Check the code and try again, or ensure the relay service is
              running.
            </p>
          )}

          <div className="divider">or</div>

          <div className="qr-placeholder" style={{ cursor: 'pointer' }} onClick={() => setStatus('scanning')}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="3" height="3" />
              <line x1="21" y1="14" x2="21" y2="14.01" />
              <line x1="21" y1="21" x2="21" y2="21.01" />
              <line x1="17" y1="17" x2="17" y2="21" />
            </svg>
            <span>Tap to scan QR code</span>
          </div>
        </div >
      )
      }

      {/* Loading spinner */}
      {
        status === 'loading' && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <div className="loading-spinner" />
          </div>
        )
      }

      {/* Record preview */}
      {
        status === 'preview' && record && (
          <div className="center-card" style={{ marginTop: 24 }}>
            <div className="record-preview">
              <div className="preview-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ClipboardList size={18} strokeWidth={1.75} aria-hidden="true" />
                  Medical Record — {record.id}
                </h3>
              </div>
              <div className="preview-body">
                <div className="preview-row">
                  <span className="preview-label">Hospital</span>
                  <span className="preview-value">{record.hospital}</span>
                </div>
                <div className="preview-row">
                  <span className="preview-label">Doctor</span>
                  <span className="preview-value">{record.doctor}</span>
                </div>
                <div className="preview-row">
                  <span className="preview-label">Date</span>
                  <span className="preview-value">{record.date}</span>
                </div>
                <div className="preview-row">
                  <span className="preview-label">Diagnosis</span>
                  <span className="preview-value">{record.diagnosis}</span>
                </div>
                <div className="preview-row">
                  <span className="preview-label">Notes</span>
                  <span className="preview-value">{record.clinicalNotes}</span>
                </div>
                {record.prescriptions.length > 0 && (
                  <div className="preview-row">
                    <span className="preview-label">Prescriptions</span>
                    <span className="preview-value">
                      {record.prescriptions.map((rx) => (
                        <div key={rx.medication}>
                          {rx.medication} {rx.dosage} — {rx.frequency}
                        </div>
                      ))}
                    </span>
                  </div>
                )}
                <div className="preview-row">
                  <span className="preview-label">Follow-up</span>
                  <span className="preview-value">{record.followUp}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
              <button className="btn btn-primary" onClick={handleAccept}>
                Accept &amp; Save
              </button>
              <button className="btn btn-danger" onClick={handleDecline}>
                Decline
              </button>
            </div>
          </div>
        )
      }

      {/* Saved confirmation */}
      {
        status === 'saved' && record && (
          <div className="center-card success-animation" style={{ marginTop: 24, textAlign: 'center' }}>
            <div className="card" style={{ padding: 32 }}>
              <CheckCircle2 size={48} strokeWidth={1.25} style={{ color: 'var(--color-success, #16a34a)', marginBottom: 12 }} aria-hidden="true" />
              <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>Record Saved Successfully</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '.88rem', marginBottom: 4 }}>
                <strong>{record.id}</strong> — {record.diagnosis}
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '.82rem', marginBottom: 20 }}>
                {record.hospital} &middot; {record.date}
              </p>
              <button className="btn btn-primary" onClick={handleReset}>
                Retrieve Another Record
              </button>
            </div>
          </div>
        )
      }
    </>
  );
}
