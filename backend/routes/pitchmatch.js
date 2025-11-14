const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all pitch matches
router.get('/', async (req, res) => {
  try {
    const [matches] = await db.query(
      `SELECT pm.*, i.name AS investor_name, f.name AS founder_name
       FROM PitchMatch pm
       JOIN Investor i ON pm.investor_id = i.investor_id
       JOIN Founder f ON pm.founder_id = f.founder_id
       ORDER BY pm.pitch_date DESC`
    );
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pitch match by ID
router.get('/:id', async (req, res) => {
  try {
    const [matches] = await db.query(
      `SELECT pm.*, i.name AS investor_name, f.name AS founder_name
       FROM PitchMatch pm
       JOIN Investor i ON pm.investor_id = i.investor_id
       JOIN Founder f ON pm.founder_id = f.founder_id
       WHERE pm.pitch_match_id = ?`,
      [req.params.id]
    );
    if (matches.length === 0) {
      return res.status(404).json({ error: 'Pitch match not found' });
    }
    res.json(matches[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create pitch match using stored procedure
router.post('/', async (req, res) => {
  const { founder_id, investor_id } = req.body;
  console.log('Creating pitch:', { founder_id, investor_id });
  try {
    const [result] = await db.query(
      'CALL sp_CreatePitch(?, ?)',
      [founder_id, investor_id]
    );
    console.log('Pitch created successfully:', result);
    res.status(201).json({ 
      message: 'Pitch match created successfully'
    });
  } catch (error) {
    console.error('Error creating pitch:', error);
    // Handle stored procedure validation errors
    if (error.sqlState === '45000') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update pitch match status
router.put('/:id', async (req, res) => {
  const { status } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE PitchMatch SET status = ? WHERE pitch_match_id = ?',
      [status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pitch match not found' });
    }
    res.json({ message: 'Pitch match updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete pitch match
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM PitchMatch WHERE pitch_match_id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pitch match not found' });
    }
    res.json({ message: 'Pitch match deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
