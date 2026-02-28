import { useState, useMemo, useEffect } from 'react';
import type { MedicalRecord } from '../types';
import { getRecords } from '../services/storage';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ClipboardList,
  Pill,
  FlaskConical,
  Stethoscope,
  Inbox,
  RefreshCw,
} from 'lucide-react';

const typeBadge: Record<string, string> = {
  prescription: 'badge badge-green',
  diagnosis: 'badge badge-red',
  lab_result: 'badge badge-blue',
  consultation: 'badge badge-gray',
};

const typeLabel: Record<string, string> = {
  prescription: 'Prescription',
  diagnosis: 'Diagnosis',
  lab_result: 'Lab Result',
  consultation: 'Consultation',
};

export default function MedicalHistory() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [hospitalFilter, setHospitalFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getRecords()
      .then((data) => {
        setRecords(data);
        setStatus('success');
      })
      .catch(() => {
        setStatus('error');
      });
  }, []);

  const hospitals = useMemo(() => {
    const set = new Set(records.map((e) => e.hospital));
    return Array.from(set).sort();
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter((entry) => {
      if (hospitalFilter !== 'all' && entry.hospital !== hospitalFilter) return false;
      if (typeFilter !== 'all' && entry.type !== typeFilter) return false;
      if (dateFrom) {
        const entryDate = new Date(entry.date);
        if (entryDate < new Date(dateFrom)) return false;
      }
      if (dateTo) {
        const entryDate = new Date(entry.date);
        if (entryDate > new Date(dateTo)) return false;
      }
      return true;
    });
  }, [hospitalFilter, typeFilter, dateFrom, dateTo, records]);

  const totalHospitals = new Set(records.map((e) => e.hospital)).size;
  const totalRecords = records.length;
  const totalPrescriptions = records.filter((e) => e.type === 'prescription').length;
  const totalLabResults = records.filter((e) => e.type === 'lab_result').length;

  if (status === 'loading') {
    return (
      <div style={{ textAlign: 'center', marginTop: 80 }}>
        <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading your medical history...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="card center-card" style={{ marginTop: 40, textAlign: 'center', padding: 32 }}>
        <h2 style={{ color: 'var(--color-danger)', marginBottom: 12 }}>Error Loading Records</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20 }}>
          We encountered an error while trying to read your encrypted medical records.
        </p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={16} strokeWidth={1.75} aria-hidden="true" />
          Retry
        </button>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="card center-card" style={{ marginTop: 40, textAlign: 'center', padding: 40 }}>
        <Inbox size={48} strokeWidth={1.25} style={{ color: 'var(--color-text-muted)', marginBottom: 16 }} aria-hidden="true" />
        <h2 style={{ marginBottom: 12 }}>No records yet.</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
          Scan a QR code from your doctor to add your first record.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/retrieve')}>
          Scan QR Code
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="content-header">
        <h1>Your Medical History</h1>
        <p>A complete timeline of your health records across all facilities.</p>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <select
          className="form-control"
          value={hospitalFilter}
          onChange={(e) => setHospitalFilter(e.target.value)}
        >
          <option value="all">All Hospitals</option>
          {hospitals.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        <select
          className="form-control"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Record Types</option>
          <option value="prescription">Prescription</option>
          <option value="diagnosis">Diagnosis</option>
          <option value="lab_result">Lab Result</option>
          <option value="consultation">Consultation</option>
        </select>

        <input
          type="date"
          className="form-control"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <input
          type="date"
          className="form-control"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>

      {/* Stat grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon green">
            <Building2 size={20} strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div className="stat-value">{totalHospitals}</div>
          <div className="stat-label">Hospitals Visited</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <ClipboardList size={20} strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div className="stat-value">{totalRecords}</div>
          <div className="stat-label">Total Records</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">
            <Pill size={20} strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div className="stat-value">{totalPrescriptions}</div>
          <div className="stat-label">Prescriptions</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">
            <FlaskConical size={20} strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div className="stat-value">{totalLabResults}</div>
          <div className="stat-label">Lab Results</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="timeline">
        {filtered.map((entry, i) => (
          <div className="timeline-item" key={entry.id || i}>
            <div className="timeline-date">{entry.date}</div>
            <div className="timeline-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <h4>{entry.diagnosis}</h4>
                <span className={typeBadge[entry.type] ?? 'badge badge-gray'}>
                  {typeLabel[entry.type] ?? entry.type}
                </span>
              </div>
              <p>{entry.clinicalNotes}</p>
              <div className="timeline-meta">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Building2 size={14} strokeWidth={1.75} aria-hidden="true" />
                  {entry.hospital}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Stethoscope size={14} strokeWidth={1.75} aria-hidden="true" />
                  {entry.doctor}
                </span>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
            <p>No records match the selected filters.</p>
          </div>
        )}
      </div>
    </>
  );
}
