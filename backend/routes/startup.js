const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all startups
router.get('/', async (req, res) => {
  try {
    const [startups] = await db.query(
      `SELECT s.*, d.d_name, f.name AS founder_name
       FROM Startup s
       JOIN Domain d ON s.domain_id = d.domain_id
       JOIN Founder f ON s.founder_id = f.founder_id`
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
      `SELECT s.*, d.d_name, f.name AS founder_name, f.email AS founder_email
       FROM Startup s
       JOIN Domain d ON s.domain_id = d.domain_id
       JOIN Founder f ON s.founder_id = f.founder_id
       WHERE s.startup_id = ?`,
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
      `SELECT fr.*, i.name AS investor_name
       FROM FundingRound fr
       JOIN Investor i ON fr.investor_id = i.investor_id
       WHERE fr.startup_id = ?
       ORDER BY fr.date DESC`,
      [req.params.id]
    );
    res.json(rounds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new startup
router.post('/', async (req, res) => {
  const { founder_id, domain_id, name, stage, description } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Startup (founder_id, domain_id, name, stage, description) VALUES (?, ?, ?, ?, ?)',
      [founder_id, domain_id, name, stage, description]
    );
    res.status(201).json({ 
      startup_id: result.insertId,
      message: 'Startup created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update startup
router.put('/:id', async (req, res) => {
  const { name, description, stage, domain_id } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE Startup SET name = ?, description = ?, stage = ?, domain_id = ? WHERE startup_id = ?',
      [name, description, stage, domain_id, req.params.id]
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
      'DELETE FROM Startup WHERE startup_id = ?',
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
