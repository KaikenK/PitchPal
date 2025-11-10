const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all funding rounds
router.get('/', async (req, res) => {
  try {
    const [rounds] = await db.query(
      `SELECT fr.*, s.StartupName, i.FullName AS InvestorName
       FROM FundingRound fr
       JOIN Startup s ON fr.StartupID = s.StartupID
       JOIN Investor i ON fr.InvestorID = i.InvestorID
       ORDER BY fr.RoundDate DESC`
    );
    res.json(rounds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get funding round by ID
router.get('/:id', async (req, res) => {
  try {
    const [rounds] = await db.query(
      `SELECT fr.*, s.StartupName, i.FullName AS InvestorName
       FROM FundingRound fr
       JOIN Startup s ON fr.StartupID = s.StartupID
       JOIN Investor i ON fr.InvestorID = i.InvestorID
       WHERE fr.FundingRoundID = ?`,
      [req.params.id]
    );
    if (rounds.length === 0) {
      return res.status(404).json({ error: 'Funding round not found' });
    }
    res.json(rounds[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new funding round (with trigger validation)
router.post('/', async (req, res) => {
  const { StartupID, InvestorID, Amount, Notes } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO FundingRound (StartupID, InvestorID, Amount, Notes) VALUES (?, ?, ?, ?)',
      [StartupID, InvestorID, Amount, Notes]
    );
    res.status(201).json({ 
      FundingRoundID: result.insertId,
      message: 'Funding round created successfully'
    });
  } catch (error) {
    // Handle trigger validation errors
    if (error.sqlState === '45000') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update funding round
router.put('/:id', async (req, res) => {
  const { Amount, Notes } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE FundingRound SET Amount = ?, Notes = ? WHERE FundingRoundID = ?',
      [Amount, Notes, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Funding round not found' });
    }
    res.json({ message: 'Funding round updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete funding round
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM FundingRound WHERE FundingRoundID = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Funding round not found' });
    }
    res.json({ message: 'Funding round deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
