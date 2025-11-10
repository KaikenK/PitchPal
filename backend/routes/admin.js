const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all admins
router.get('/', async (req, res) => {
  try {
    const [admins] = await db.query(
      'SELECT AdminID, Username, Email, FullName, CreatedAt FROM Admin'
    );
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get admin by ID
router.get('/:id', async (req, res) => {
  try {
    const [admins] = await db.query(
      'SELECT AdminID, Username, Email, FullName, CreatedAt FROM Admin WHERE AdminID = ?',
      [req.params.id]
    );
    if (admins.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.json(admins[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all investor approval requests
router.get('/approvals/pending', async (req, res) => {
  try {
    const [approvals] = await db.query(
      `SELECT aia.*, i.Username, i.Email, i.FullName, i.TotalInvestmentCapacity
       FROM AdminInvestorApproval aia
       JOIN Investor i ON aia.InvestorID = i.InvestorID
       WHERE aia.ApprovalStatus = 'Pending'
       ORDER BY aia.ApprovalDate DESC`
    );
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all investor approvals
router.get('/approvals/all', async (req, res) => {
  try {
    const [approvals] = await db.query(
      `SELECT aia.*, i.Username, i.Email, i.FullName, a.FullName AS AdminName
       FROM AdminInvestorApproval aia
       JOIN Investor i ON aia.InvestorID = i.InvestorID
       JOIN Admin a ON aia.AdminID = a.AdminID
       ORDER BY aia.ApprovalDate DESC`
    );
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve or reject investor
router.post('/approvals', async (req, res) => {
  const { AdminID, InvestorID, ApprovalStatus, Notes } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO AdminInvestorApproval (AdminID, InvestorID, ApprovalStatus, Notes) VALUES (?, ?, ?, ?)',
      [AdminID, InvestorID, ApprovalStatus, Notes]
    );
    res.status(201).json({ 
      ApprovalID: result.insertId,
      message: 'Approval request created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update approval status
router.put('/approvals/:id', async (req, res) => {
  const { ApprovalStatus, Notes } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE AdminInvestorApproval SET ApprovalStatus = ?, Notes = ? WHERE ApprovalID = ?',
      [ApprovalStatus, Notes, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Approval not found' });
    }
    res.json({ message: 'Approval status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all messages for moderation
router.get('/messages/all', async (req, res) => {
  try {
    const [messages] = await db.query(
      `SELECT m.*, 
       CASE 
         WHEN m.SenderType = 'Investor' THEN si.FullName
         ELSE sf.FullName
       END AS SenderName,
       CASE 
         WHEN m.ReceiverType = 'Investor' THEN ri.FullName
         ELSE rf.FullName
       END AS ReceiverName
       FROM Message m
       LEFT JOIN Investor si ON m.SenderType = 'Investor' AND m.SenderID = si.InvestorID
       LEFT JOIN Founder sf ON m.SenderType = 'Founder' AND m.SenderID = sf.FounderID
       LEFT JOIN Investor ri ON m.ReceiverType = 'Investor' AND m.ReceiverID = ri.InvestorID
       LEFT JOIN Founder rf ON m.ReceiverType = 'Founder' AND m.ReceiverID = rf.FounderID
       ORDER BY m.SentAt DESC`
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unmoderated messages
router.get('/messages/unmoderated', async (req, res) => {
  try {
    const [messages] = await db.query(
      `SELECT m.*, 
       CASE 
         WHEN m.SenderType = 'Investor' THEN si.FullName
         ELSE sf.FullName
       END AS SenderName,
       CASE 
         WHEN m.ReceiverType = 'Investor' THEN ri.FullName
         ELSE rf.FullName
       END AS ReceiverName
       FROM Message m
       LEFT JOIN Investor si ON m.SenderType = 'Investor' AND m.SenderID = si.InvestorID
       LEFT JOIN Founder sf ON m.SenderType = 'Founder' AND m.SenderID = sf.FounderID
       LEFT JOIN Investor ri ON m.ReceiverType = 'Investor' AND m.ReceiverID = ri.InvestorID
       LEFT JOIN Founder rf ON m.ReceiverType = 'Founder' AND m.ReceiverID = rf.FounderID
       WHERE m.IsModerated = FALSE
       ORDER BY m.SentAt DESC`
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Moderate a message
router.post('/messages/moderate', async (req, res) => {
  const { MessageID, AdminID, Action, Reason } = req.body;
  try {
    // Insert moderation record
    await db.query(
      'INSERT INTO MessageModeration (MessageID, AdminID, Action, Reason) VALUES (?, ?, ?, ?)',
      [MessageID, AdminID, Action, Reason]
    );
    
    // Update message moderation status
    await db.query(
      'UPDATE Message SET IsModerated = TRUE WHERE MessageID = ?',
      [MessageID]
    );
    
    res.status(201).json({ message: 'Message moderated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all message moderations
router.get('/moderations/all', async (req, res) => {
  try {
    const [moderations] = await db.query(
      `SELECT mm.*, m.MessageContent, a.FullName AS AdminName
       FROM MessageModeration mm
       JOIN Message m ON mm.MessageID = m.MessageID
       JOIN Admin a ON mm.AdminID = a.AdminID
       ORDER BY mm.ModerationDate DESC`
    );
    res.json(moderations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new admin
router.post('/', async (req, res) => {
  const { Username, Email, PasswordHash, FullName } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Admin (Username, Email, PasswordHash, FullName) VALUES (?, ?, ?, ?)',
      [Username, Email, PasswordHash, FullName]
    );
    res.status(201).json({ 
      AdminID: result.insertId,
      message: 'Admin created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update admin
router.put('/:id', async (req, res) => {
  const { FullName, Email } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE Admin SET FullName = ?, Email = ? WHERE AdminID = ?',
      [FullName, Email, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.json({ message: 'Admin updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete admin
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM Admin WHERE AdminID = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
