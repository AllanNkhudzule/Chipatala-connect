import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PatientProfile } from '../types';
import { getProfile, saveProfile } from '../services/storage';
import { patientProfile as mockProfile } from '../data/mockData';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const storedProfile = await getProfile();
      setProfile(storedProfile || mockProfile);
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (profile) {
      await saveProfile(profile);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        navigate('/');
      }, 1500);
    }
  };

  const handleChange = (field: keyof PatientProfile, value: string) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
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

      <div className="card">
        <div className="form-group">
          <label>Full Name</label>
          <input
            className="form-control"
            value={profile.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>National ID</label>
          <input
            className="form-control"
            value={profile.nationalId}
            onChange={(e) => handleChange('nationalId', e.target.value)}
          />
        </div>
        <div className="grid-2" style={{ gap: 16 }}>
          <div className="form-group">
            <label>Gender</label>
            <input
              className="form-control"
              value={profile.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Age</label>
            <input
              className="form-control"
              type="number"
              value={profile.age}
              onChange={(e) => handleChange('age', e.target.value)}
            />
          </div>
        </div>
        <div className="grid-2" style={{ gap: 16 }}>
          <div className="form-group">
            <label>Blood Type</label>
            <input
              className="form-control"
              value={profile.bloodType}
              onChange={(e) => handleChange('bloodType', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Known Allergies (comma-separated)</label>
            <input
              className="form-control"
              value={profile.allergies.join(', ')}
              onChange={(e) => handleChange('allergies', e.target.value.split(',').map(s => s.trim()))}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saved}>
            {saved ? 'Saved!' : 'Save Profile'}
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
