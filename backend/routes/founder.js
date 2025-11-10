const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all founders
router.get('/', async (req, res) => {
  try {
    const [founders] = await db.query(
      'SELECT FounderID, Username, Email, FullName, Bio, CreatedAt FROM Founder'
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
      'SELECT FounderID, Username, Email, FullName, Bio, CreatedAt FROM Founder WHERE FounderID = ?',
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
      `SELECT s.*, d.DomainName 
       FROM Startup s
       JOIN Domain d ON s.DomainID = d.DomainID
       WHERE s.FounderID = ?`,
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

// Get matched investors for founder's startup
router.get('/:founderId/startup/:startupId/matches', async (req, res) => {
  try {
    const [matches] = await db.query(
      'CALL sp_GetInvestorMatches(?)',
      [req.params.startupId]
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
      `SELECT pm.*, s.StartupName, i.FullName AS InvestorName
       FROM PitchMatch pm
       JOIN Startup s ON pm.StartupID = s.StartupID
       JOIN Investor i ON pm.InvestorID = i.InvestorID
       WHERE s.FounderID = ?
       ORDER BY pm.PitchDate DESC`,
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
      `SELECT m.*, 
       CASE 
         WHEN m.SenderType = 'Investor' THEN i.FullName
         ELSE f.FullName
       END AS SenderName
       FROM Message m
       LEFT JOIN Investor i ON m.SenderType = 'Investor' AND m.SenderID = i.InvestorID
       LEFT JOIN Founder f ON m.SenderType = 'Founder' AND m.SenderID = f.FounderID
       WHERE (m.ReceiverType = 'Founder' AND m.ReceiverID = ?)
          OR (m.SenderType = 'Founder' AND m.SenderID = ?)
       ORDER BY m.SentAt DESC`,
      [req.params.id, req.params.id]
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new founder
router.post('/', async (req, res) => {
  const { Username, Email, PasswordHash, FullName, Bio } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Founder (Username, Email, PasswordHash, FullName, Bio) VALUES (?, ?, ?, ?, ?)',
      [Username, Email, PasswordHash, FullName, Bio]
    );
    res.status(201).json({ 
      FounderID: result.insertId,
      message: 'Founder created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update founder
router.put('/:id', async (req, res) => {
  const { FullName, Bio, Email } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE Founder SET FullName = ?, Bio = ?, Email = ? WHERE FounderID = ?',
      [FullName, Bio, Email, req.params.id]
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
      'DELETE FROM Founder WHERE FounderID = ?',
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
