const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all funding rounds
router.get('/', async (req, res) => {
  try {
    const [rounds] = await db.query(
      `SELECT fr.*, s.name AS startup_name, i.name AS investor_name
       FROM FundingRound fr
       JOIN Startup s ON fr.startup_id = s.startup_id
       JOIN Investor i ON fr.investor_id = i.investor_id
       ORDER BY fr.date DESC`
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
      `SELECT fr.*, s.name AS startup_name, i.name AS investor_name
       FROM FundingRound fr
       JOIN Startup s ON fr.startup_id = s.startup_id
       JOIN Investor i ON fr.investor_id = i.investor_id
       WHERE fr.funding_round_id = ?`,
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
  const { startup_id, investor_id, amount, date } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO FundingRound (startup_id, investor_id, amount, date) VALUES (?, ?, ?, ?)',
      [startup_id, investor_id, amount, date || new Date()]
    );
    res.status(201).json({ 
      funding_round_id: result.insertId,
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
  const { amount, date } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE FundingRound SET amount = ?, date = ? WHERE funding_round_id = ?',
      [amount, date, req.params.id]
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
      'DELETE FROM FundingRound WHERE funding_round_id = ?',
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
