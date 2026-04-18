const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Generate QR/access code (patient generates this)
router.post('/generate-token', authMiddleware, async (req, res) => {
  if (req.user.role !== 'patient') return res.status(403).json({ error: 'Only patients can generate tokens' });

  const { scope, include_identity, expires_in_minutes } = req.body;
  const token = Math.random().toString(36).substring(2, 10).toUpperCase();
  const expires_at = new Date(Date.now() + (expires_in_minutes || 30) * 60000);

  try {
    await pool.query(
      'INSERT INTO access_tokens (patient_id, token, scope, include_identity, expires_at) VALUES ($1,$2,$3,$4,$5)',
      [req.user.id, token, scope || 'full', include_identity !== false, expires_at]
    );
    res.json({ token, expires_at });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Facility reads patient data using token
router.get('/read/:token', authMiddleware, async (req, res) => {
  if (req.user.role !== 'facility') return res.status(403).json({ error: 'Only facilities can read tokens' });

  const { token } = req.params;
  try {
    const tokenResult = await pool.query(
      'SELECT * FROM access_tokens WHERE token = $1 AND used = FALSE AND expires_at > NOW()',
      [token]
    );
    if (tokenResult.rows.length === 0) return res.status(404).json({ error: 'Token invalid or expired' });

    const t = tokenResult.rows[0];
    const patientResult = await pool.query(
      'SELECT id, student_id, full_name, date_of_birth, gender, blood_type, allergies, institution, insurance_id FROM patients WHERE id = $1',
      [t.patient_id]
    );
    const patient = patientResult.rows[0];

    const recordsResult = await pool.query(
      'SELECT * FROM health_records WHERE patient_id = $1 ORDER BY visit_date DESC',
      [t.patient_id]
    );

    const response = {
      patient_id: patient.id,
      records: recordsResult.rows,
    };

    if (t.include_identity) {
      response.identity = {
        full_name: patient.full_name,
        student_id: patient.student_id,
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        institution: patient.institution,
        insurance_id: patient.insurance_id,
      };
    }

    response.health = {
      blood_type: patient.blood_type,
      allergies: patient.allergies,
    };

    // Mark token as used
    await pool.query('UPDATE access_tokens SET used = TRUE WHERE id = $1', [t.id]);

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
