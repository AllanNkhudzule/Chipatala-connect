const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Get my card data
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, student_id, full_name, date_of_birth, gender, blood_type, allergies, phone, email, institution, insurance_id FROM patients WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update my profile
router.put('/me', authMiddleware, async (req, res) => {
  const { phone, blood_type, allergies } = req.body;
  try {
    await pool.query(
      'UPDATE patients SET phone=$1, blood_type=$2, allergies=$3 WHERE id=$4',
      [phone, blood_type, allergies, req.user.id]
    );
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
