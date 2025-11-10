const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all investors
router.get('/', async (req, res) => {
  try {
    const [investors] = await db.query(
      'SELECT InvestorID, Username, Email, FullName, Bio, TotalInvestmentCapacity, IsApproved, CreatedAt FROM Investor'
    );
    res.json(investors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get investor by ID
router.get('/:id', async (req, res) => {
  try {
    const [investors] = await db.query(
      'SELECT InvestorID, Username, Email, FullName, Bio, TotalInvestmentCapacity, IsApproved, CreatedAt FROM Investor WHERE InvestorID = ?',
      [req.params.id]
    );
    if (investors.length === 0) {
      return res.status(404).json({ error: 'Investor not found' });
    }
    res.json(investors[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get investor's domains
router.get('/:id/domains', async (req, res) => {
  try {
    const [domains] = await db.query(
      `SELECT d.* FROM Domain d
       JOIN InvestorDomain id ON d.DomainID = id.DomainID
       WHERE id.InvestorID = ?`,
      [req.params.id]
    );
    res.json(domains);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get startups in investor's domains
router.get('/:id/startups', async (req, res) => {
  try {
    const [startups] = await db.query(
      `SELECT DISTINCT s.*, d.DomainName, f.FullName AS FounderName
       FROM Startup s
       JOIN Domain d ON s.DomainID = d.DomainID
       JOIN Founder f ON s.FounderID = f.FounderID
       JOIN InvestorDomain id ON s.DomainID = id.DomainID
       WHERE id.InvestorID = ?
       ORDER BY s.CreatedAt DESC`,
      [req.params.id]
    );
    res.json(startups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get investor's funding rounds
router.get('/:id/funding-rounds', async (req, res) => {
  try {
    const [rounds] = await db.query(
      `SELECT fr.*, s.StartupName, s.DomainID, d.DomainName
       FROM FundingRound fr
       JOIN Startup s ON fr.StartupID = s.StartupID
       JOIN Domain d ON s.DomainID = d.DomainID
       WHERE fr.InvestorID = ?
       ORDER BY fr.RoundDate DESC`,
      [req.params.id]
    );
    res.json(rounds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get total investments for investor
router.get('/:id/total-investment', async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT COALESCE(SUM(Amount), 0) AS TotalInvested
       FROM FundingRound
       WHERE InvestorID = ?`,
      [req.params.id]
    );
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check investor approval status using function
router.get('/:id/approval-status', async (req, res) => {
  try {
    const [result] = await db.query(
      'SELECT fn_CheckInvestorApprovalStatus(?) AS ApprovalStatus',
      [req.params.id]
    );
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get investor's pitch matches
router.get('/:id/pitches', async (req, res) => {
  try {
    const [pitches] = await db.query(
      `SELECT pm.*, s.StartupName, s.Description, f.FullName AS FounderName
       FROM PitchMatch pm
       JOIN Startup s ON pm.StartupID = s.StartupID
       JOIN Founder f ON s.FounderID = f.FounderID
       WHERE pm.InvestorID = ?
       ORDER BY pm.PitchDate DESC`,
      [req.params.id]
    );
    res.json(pitches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for investor
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
       WHERE (m.ReceiverType = 'Investor' AND m.ReceiverID = ?)
          OR (m.SenderType = 'Investor' AND m.SenderID = ?)
       ORDER BY m.SentAt DESC`,
      [req.params.id, req.params.id]
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new investor
router.post('/', async (req, res) => {
  const { Username, Email, PasswordHash, FullName, Bio, TotalInvestmentCapacity } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Investor (Username, Email, PasswordHash, FullName, Bio, TotalInvestmentCapacity) VALUES (?, ?, ?, ?, ?, ?)',
      [Username, Email, PasswordHash, FullName, Bio, TotalInvestmentCapacity || 0]
    );
    res.status(201).json({ 
      InvestorID: result.insertId,
      message: 'Investor created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add domain to investor
router.post('/:id/domains', async (req, res) => {
  const { DomainID } = req.body;
  try {
    await db.query(
      'INSERT INTO InvestorDomain (InvestorID, DomainID) VALUES (?, ?)',
      [req.params.id, DomainID]
    );
    res.status(201).json({ message: 'Domain added to investor successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update investor
router.put('/:id', async (req, res) => {
  const { FullName, Bio, Email, TotalInvestmentCapacity } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE Investor SET FullName = ?, Bio = ?, Email = ?, TotalInvestmentCapacity = ? WHERE InvestorID = ?',
      [FullName, Bio, Email, TotalInvestmentCapacity, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Investor not found' });
    }
    res.json({ message: 'Investor updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete investor
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM Investor WHERE InvestorID = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Investor not found' });
    }
    res.json({ message: 'Investor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
