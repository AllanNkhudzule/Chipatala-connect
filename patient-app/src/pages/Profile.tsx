import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PatientProfile } from '../types';
import { getProfile, saveProfile, getRecords } from '../services/storage';
import { clearDeviceKey } from '../services/crypto';
import { patientProfile as mockProfile } from '../data/mockData';
import { toast } from 'react-hot-toast';
import {
  User,
  Calendar,
  MapPin,
  Droplets,
  PhoneCall,
  Languages,
  Download,
  Trash2,
  BadgeInfo,
} from 'lucide-react';

function FieldRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="form-group">
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ color: 'var(--color-primary)', display: 'flex' }} aria-hidden="true">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PatientProfile | null>(null);

  // Extra editable fields stored alongside profile
  const [dob, setDob] = useState('');
  const [district, setDistrict] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [language, setLanguage] = useState<'English' | 'Chichewa'>('English');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    async function load() {
      const stored = await getProfile();
      const base = stored || mockProfile;
      setProfile(base);
      // Load extended fields from localStorage supplement
      try {
        const ext = JSON.parse(localStorage.getItem('chipatala-profile-ext') || '{}');
        setDob(ext.dob || '');
        setDistrict(ext.district || '');
        setEmergencyName(ext.emergencyName || '');
        setEmergencyPhone(ext.emergencyPhone || '');
        setLanguage(ext.language || 'English');
      } catch {
        // ignore
      }
    }
    load();
  }, []);

  const handleChange = (field: keyof PatientProfile, value: string | string[]) => {
    if (profile) setProfile({ ...profile, [field]: value });
  };

  const handleSave = async () => {
    if (!profile) return;
    // Validate phone
    if (emergencyPhone && !/^[+\d\s()-]{7,15}$/.test(emergencyPhone)) {
      toast.error('Emergency phone number format is invalid.');
      return;
    }
    await saveProfile(profile);
    localStorage.setItem('chipatala-profile-ext', JSON.stringify({ dob, district, emergencyName, emergencyPhone, language }));
    toast.success('Profile updated.');
  };

  const handleExport = async () => {
    try {
      const records = await getRecords();
      const data = JSON.stringify({ profile, records }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `health_passport_${(profile?.name || 'export').replace(/\s+/g, '_')}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch {
      toast.error('Failed to export data');
    }
  };

  const handleClearData = () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error('Type "DELETE" to confirm');
      return;
    }
    localStorage.clear();
    clearDeviceKey();
    toast.success('Device data cleared');
    window.location.href = '/login';
  };

  if (!profile) {
    return <div className="loading-spinner" />;
  }

  return (
    <>
      <div className="content-header">
        <h1>Your Profile</h1>
        <p>This information is stored securely on your device.</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>Personal Information</h2>

        <FieldRow icon={<User size={16} strokeWidth={1.75} />} label="Full Name">
          <input
            className="form-control"
            value={profile.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </FieldRow>

        <div className="grid-2" style={{ gap: 16 }}>
          <FieldRow icon={<Calendar size={16} strokeWidth={1.75} />} label="Date of Birth">
            <input
              className="form-control"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </FieldRow>
          <FieldRow icon={<MapPin size={16} strokeWidth={1.75} />} label="District / Location">
            <input
              className="form-control"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Blantyre"
            />
          </FieldRow>
        </div>

        <div className="grid-2" style={{ gap: 16 }}>
          <FieldRow icon={<Droplets size={16} strokeWidth={1.75} />} label="Blood Group">
            <select
              className="form-control"
              value={profile.bloodType}
              onChange={(e) => handleChange('bloodType', e.target.value)}
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </FieldRow>
          <FieldRow icon={<BadgeInfo size={16} strokeWidth={1.75} />} label="National ID">
            <input
              className="form-control"
              value={profile.nationalId}
              onChange={(e) => handleChange('nationalId', e.target.value)}
            />
          </FieldRow>
        </div>

        <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '20px 0 16px' }}>Emergency Contact</h2>

        <div className="grid-2" style={{ gap: 16 }}>
          <FieldRow icon={<PhoneCall size={16} strokeWidth={1.75} />} label="Contact Name">
            <input
              className="form-control"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              placeholder="Full name"
            />
          </FieldRow>
          <FieldRow icon={<PhoneCall size={16} strokeWidth={1.75} />} label="Contact Phone">
            <input
              className="form-control"
              type="tel"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              placeholder="+265 999 000 000"
            />
          </FieldRow>
        </div>

        <FieldRow icon={<Languages size={16} strokeWidth={1.75} />} label="Language Preference">
          <div style={{ display: 'flex', gap: 8 }}>
            {(['English', 'Chichewa'] as const).map(lang => (
              <button
                key={lang}
                type="button"
                className={`btn ${language === lang ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setLanguage(lang)}
              >
                {lang}
              </button>
            ))}
          </div>
        </FieldRow>

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Profile
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Data Management</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            className="btn btn-outline"
            onClick={handleExport}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={16} strokeWidth={1.75} aria-hidden="true" />
            Export My Records as JSON
          </button>
          <button
            className="btn btn-danger"
            onClick={() => setShowDeleteDialog(!showDeleteDialog)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
            Clear All Local Records
          </button>
        </div>

        {showDeleteDialog && (
          <div style={{
            marginTop: 16,
            padding: 16,
            background: 'var(--color-danger-bg, #fef2f2)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius)',
          }}>
            <p style={{ margin: '0 0 12px', fontSize: '.875rem', color: 'var(--color-danger)', fontWeight: 600 }}>
              This action is irreversible. All records will be permanently deleted from this device.
            </p>
            <p style={{ margin: '0 0 10px', fontSize: '.8rem', color: 'var(--color-text-secondary)' }}>
              Type <strong>DELETE</strong> to confirm:
            </p>
            <input
              className="form-control"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              style={{ marginBottom: 10 }}
            />
            <button
              className="btn btn-danger"
              onClick={handleClearData}
              disabled={deleteConfirm !== 'DELETE'}
            >
              Permanently Delete All Data
            </button>
          </div>
        )}
      </div>
    </>
  );
}
