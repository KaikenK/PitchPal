const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all startups
router.get('/', async (req, res) => {
  try {
    const [startups] = await db.query(
      `SELECT s.*, d.DomainName, f.FullName AS FounderName
       FROM Startup s
       JOIN Domain d ON s.DomainID = d.DomainID
       JOIN Founder f ON s.FounderID = f.FounderID
       ORDER BY s.CreatedAt DESC`
    );
    res.json(startups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get startup by ID
router.get('/:id', async (req, res) => {
  try {
    const [startups] = await db.query(
      `SELECT s.*, d.DomainName, f.FullName AS FounderName, f.Email AS FounderEmail
       FROM Startup s
       JOIN Domain d ON s.DomainID = d.DomainID
       JOIN Founder f ON s.FounderID = f.FounderID
       WHERE s.StartupID = ?`,
      [req.params.id]
    );
    if (startups.length === 0) {
      return res.status(404).json({ error: 'Startup not found' });
    }
    res.json(startups[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get startup funding rounds
router.get('/:id/funding-rounds', async (req, res) => {
  try {
    const [rounds] = await db.query(
      `SELECT fr.*, i.FullName AS InvestorName
       FROM FundingRound fr
       JOIN Investor i ON fr.InvestorID = i.InvestorID
       WHERE fr.StartupID = ?
       ORDER BY fr.RoundDate DESC`,
      [req.params.id]
    );
    res.json(rounds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get startup pitch matches
router.get('/:id/pitches', async (req, res) => {
  try {
    const [pitches] = await db.query(
      `SELECT pm.*, i.FullName AS InvestorName
       FROM PitchMatch pm
       JOIN Investor i ON pm.InvestorID = i.InvestorID
       WHERE pm.StartupID = ?
       ORDER BY pm.PitchDate DESC`,
      [req.params.id]
    );
    res.json(pitches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new startup
router.post('/', async (req, res) => {
  const { FounderID, DomainID, StartupName, Description, FundingGoal, Stage } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Startup (FounderID, DomainID, StartupName, Description, FundingGoal, Stage) VALUES (?, ?, ?, ?, ?, ?)',
      [FounderID, DomainID, StartupName, Description, FundingGoal, Stage]
    );
    res.status(201).json({ 
      StartupID: result.insertId,
      message: 'Startup created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update startup
router.put('/:id', async (req, res) => {
  const { StartupName, Description, FundingGoal, Stage, DomainID } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE Startup SET StartupName = ?, Description = ?, FundingGoal = ?, Stage = ?, DomainID = ? WHERE StartupID = ?',
      [StartupName, Description, FundingGoal, Stage, DomainID, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Startup not found' });
    }
    res.json({ message: 'Startup updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete startup
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM Startup WHERE StartupID = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Startup not found' });
    }
    res.json({ message: 'Startup deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
