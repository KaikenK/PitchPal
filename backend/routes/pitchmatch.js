const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all pitch matches
router.get('/', async (req, res) => {
  try {
    const [matches] = await db.query(
      `SELECT pm.*, s.StartupName, i.FullName AS InvestorName, f.FullName AS FounderName
       FROM PitchMatch pm
       JOIN Startup s ON pm.StartupID = s.StartupID
       JOIN Investor i ON pm.InvestorID = i.InvestorID
       JOIN Founder f ON s.FounderID = f.FounderID
       ORDER BY pm.PitchDate DESC`
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
      `SELECT pm.*, s.StartupName, i.FullName AS InvestorName
       FROM PitchMatch pm
       JOIN Startup s ON pm.StartupID = s.StartupID
       JOIN Investor i ON pm.InvestorID = i.InvestorID
       WHERE pm.PitchMatchID = ?`,
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
  const { StartupID, InvestorID, Notes } = req.body;
  try {
    const [result] = await db.query(
      'CALL sp_CreatePitch(?, ?, ?)',
      [StartupID, InvestorID, Notes]
    );
    res.status(201).json({ 
      PitchMatchID: result[0][0].PitchMatchID,
      message: 'Pitch match created successfully'
    });
  } catch (error) {
    // Handle stored procedure validation errors
    if (error.sqlState === '45000') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update pitch match status
router.put('/:id', async (req, res) => {
  const { Status, Notes } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE PitchMatch SET Status = ?, Notes = ? WHERE PitchMatchID = ?',
      [Status, Notes, req.params.id]
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
      'DELETE FROM PitchMatch WHERE PitchMatchID = ?',
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
