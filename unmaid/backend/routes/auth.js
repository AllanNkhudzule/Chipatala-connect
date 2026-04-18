const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

// Patient login
router.post('/patient/login', async (req, res) => {
  const { student_id, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM patients WHERE student_id = $1', [student_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Student not found' });

    const patient = result.rows[0];
    const valid = await bcrypt.compare(password, patient.password_hash);
    if (!valid) return res.status(401).json({ error: 'Wrong password' });

    const token = jwt.sign({ id: patient.id, role: 'patient' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, name: patient.full_name, student_id: patient.student_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Patient register
router.post('/patient/register', async (req, res) => {
  const { student_id, full_name, date_of_birth, gender, blood_type, allergies, phone, email, password, insurance_id } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO patients (student_id, full_name, date_of_birth, gender, blood_type, allergies, phone, email, password_hash, insurance_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id, full_name, student_id`,
      [student_id, full_name, date_of_birth, gender, blood_type, allergies, phone, email, hash, insurance_id]
    );
    const patient = result.rows[0];
    const token = jwt.sign({ id: patient.id, role: 'patient' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, name: patient.full_name, student_id: patient.student_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Facility login
router.post('/facility/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM facilities WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Facility not found' });

    const facility = result.rows[0];
    const valid = await bcrypt.compare(password, facility.password_hash);
    if (!valid) return res.status(401).json({ error: 'Wrong password' });

    const token = jwt.sign({ id: facility.id, role: 'facility', name: facility.name }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, name: facility.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
