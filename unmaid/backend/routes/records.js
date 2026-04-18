const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Get my health records
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM health_records WHERE patient_id = $1 ORDER BY visit_date DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Facility writes a record to a patient (via access token)
router.post('/write', authMiddleware, async (req, res) => {
  if (req.user.role !== 'facility') return res.status(403).json({ error: 'Only facilities can write records' });

  const { patient_id, diagnosis, medications, hiv_status, tb_status, other_conditions, notes, doctor_name } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO health_records (patient_id, facility_name, diagnosis, medications, hiv_status, tb_status, other_conditions, notes, doctor_name)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [patient_id, req.user.name, diagnosis, medications, hiv_status, tb_status, other_conditions, notes, doctor_name]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
