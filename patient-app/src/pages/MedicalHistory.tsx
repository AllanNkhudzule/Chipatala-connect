import { useState, useMemo } from 'react';
import { medicalTimeline } from '../data/mockData';

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
  const [hospitalFilter, setHospitalFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const hospitals = useMemo(() => {
    const set = new Set(medicalTimeline.map((e) => e.hospital));
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    return medicalTimeline.filter((entry) => {
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
  }, [hospitalFilter, typeFilter, dateFrom, dateTo]);

  const totalHospitals = new Set(medicalTimeline.map((e) => e.hospital)).size;
  const totalRecords = medicalTimeline.length;
  const totalPrescriptions = medicalTimeline.filter((e) => e.type === 'prescription').length;
  const totalLabResults = medicalTimeline.filter((e) => e.type === 'lab_result').length;

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
          <div className="stat-icon green">🏥</div>
          <div className="stat-value">{totalHospitals}</div>
          <div className="stat-label">Hospitals Visited</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📋</div>
          <div className="stat-value">{totalRecords}</div>
          <div className="stat-label">Total Records</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">💊</div>
          <div className="stat-value">{totalPrescriptions}</div>
          <div className="stat-label">Prescriptions</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">🔬</div>
          <div className="stat-value">{totalLabResults}</div>
          <div className="stat-label">Lab Results</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="timeline">
        {filtered.map((entry, i) => (
          <div className="timeline-item" key={i}>
            <div className="timeline-date">{entry.date}</div>
            <div className="timeline-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <h4>{entry.title}</h4>
                <span className={typeBadge[entry.type] ?? 'badge badge-gray'}>
                  {typeLabel[entry.type] ?? entry.type}
                </span>
              </div>
              <p>{entry.description}</p>
              <div className="timeline-meta">
                <span>🏥 {entry.hospital}</span>
                <span>👨‍⚕️ {entry.doctor}</span>
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
