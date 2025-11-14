const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all founders
router.get('/', async (req, res) => {
  try {
    const [founders] = await db.query(
      'SELECT founder_id, name, email, password FROM Founder'
    );
    res.json(founders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get founder by ID
router.get('/:id', async (req, res) => {
  try {
    const [founders] = await db.query(
      'SELECT founder_id, name, email FROM Founder WHERE founder_id = ?',
      [req.params.id]
    );
    if (founders.length === 0) {
      return res.status(404).json({ error: 'Founder not found' });
    }
    res.json(founders[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get founder's startups
router.get('/:id/startups', async (req, res) => {
  try {
    const [startups] = await db.query(
      `SELECT s.*, d.d_name 
       FROM Startup s
       JOIN Domain d ON s.domain_id = d.domain_id
       WHERE s.founder_id = ?`,
      [req.params.id]
    );
    res.json(startups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get founder startup count using function
router.get('/:id/startup-count', async (req, res) => {
  try {
    const [result] = await db.query(
      'SELECT fn_GetFounderStartupCount(?) AS startupCount',
      [req.params.id]
    );
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get matched investors for founder
router.get('/:id/matches', async (req, res) => {
  try {
    const [matches] = await db.query(
      'CALL sp_GetInvestorMatches(?)',
      [req.params.id]
    );
    res.json(matches[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get matched investors for founder's startup
router.get('/:founderId/startup/:startupId/matches', async (req, res) => {
  try {
    const [matches] = await db.query(
      'CALL sp_GetInvestorMatches(?)',
      [req.params.founderId]
    );
    res.json(matches[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pitch statuses for founder
router.get('/:id/pitches', async (req, res) => {
  try {
    const [pitches] = await db.query(
      `SELECT pm.*, i.name AS investor_name
       FROM PitchMatch pm
       JOIN Investor i ON pm.investor_id = i.investor_id
       WHERE pm.founder_id = ?
       ORDER BY pm.pitch_date DESC`,
      [req.params.id]
    );
    res.json(pitches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for founder
router.get('/:id/messages', async (req, res) => {
  try {
    const [messages] = await db.query(
      `SELECT m.*, i.name AS investor_name, f.name AS founder_name,
       EXISTS(SELECT 1 FROM MessageModeration mm WHERE mm.m_id = m.m_id) AS is_moderated
       FROM Message m
       LEFT JOIN Investor i ON m.investor_id = i.investor_id
       LEFT JOIN Founder f ON m.founder_id = f.founder_id
       WHERE m.founder_id = ?
       ORDER BY m.timestamp DESC`,
      [req.params.id]
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new founder
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Founder (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    res.status(201).json({ 
      founder_id: result.insertId,
      message: 'Founder created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update founder
router.put('/:id', async (req, res) => {
  const { name, email } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE Founder SET name = ?, email = ? WHERE founder_id = ?',
      [name, email, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Founder not found' });
    }
    res.json({ message: 'Founder updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete founder
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM Founder WHERE founder_id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Founder not found' });
    }
    res.json({ message: 'Founder deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
