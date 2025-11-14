const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all admins
router.get('/', async (req, res) => {
  try {
    const [admins] = await db.query(
      'SELECT admin_id, name, email, role, access_level FROM Admin'
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
      'SELECT admin_id, name, email, role, access_level FROM Admin WHERE admin_id = ?',
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

// Get pending investor approvals
router.get('/approvals/pending', async (req, res) => {
  try {
    const [investors] = await db.query(
      `SELECT i.* FROM Investor i
       WHERE i.investor_id NOT IN (SELECT investor_id FROM AdminInvestorApproval)`
    );
    res.json(investors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all investor approvals
router.get('/approvals/all', async (req, res) => {
  try {
    const [approvals] = await db.query(
      `SELECT aia.*, i.name AS investor_name, i.email, a.name AS admin_name
       FROM AdminInvestorApproval aia
       JOIN Investor i ON aia.investor_id = i.investor_id
       JOIN Admin a ON aia.admin_id = a.admin_id
       ORDER BY aia.approval_date DESC`
    );
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve investor
router.post('/approvals', async (req, res) => {
  const { admin_id, investor_id } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO AdminInvestorApproval (admin_id, investor_id) VALUES (?, ?)',
      [admin_id, investor_id]
    );
    res.status(201).json({ message: 'Investor approved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update approval
router.put('/approvals/:id', async (req, res) => {
  const { admin_id, investor_id } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE AdminInvestorApproval SET admin_id = ?, investor_id = ? WHERE admin_id = ? AND investor_id = ?',
      [admin_id, investor_id, req.params.id, req.body.old_investor_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Approval not found' });
    }
    res.json({ message: 'Approval updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all messages
router.get('/messages/all', async (req, res) => {
  try {
    const [messages] = await db.query(
      `SELECT m.*, i.name AS investor_name, f.name AS founder_name,
       EXISTS(SELECT 1 FROM MessageModeration mm WHERE mm.m_id = m.m_id) AS is_moderated,
       mm.action AS moderation_action
       FROM Message m
       LEFT JOIN Investor i ON m.investor_id = i.investor_id
       LEFT JOIN Founder f ON m.founder_id = f.founder_id
       LEFT JOIN MessageModeration mm ON m.m_id = mm.m_id
       ORDER BY m.timestamp DESC`
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
      `SELECT m.*, i.name AS investor_name, f.name AS founder_name
       FROM Message m
       LEFT JOIN Investor i ON m.investor_id = i.investor_id
       LEFT JOIN Founder f ON m.founder_id = f.founder_id
       WHERE m.m_id NOT IN (SELECT m_id FROM MessageModeration)
       ORDER BY m.timestamp DESC`
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Moderate a message
router.post('/messages/moderate', async (req, res) => {
  const { m_id, admin_id, action } = req.body;
  try {
    await db.query(
      'INSERT INTO MessageModeration (admin_id, m_id, action) VALUES (?, ?, ?)',
      [admin_id, m_id, action]
    );
    res.status(201).json({ message: 'Message moderated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new admin
router.post('/', async (req, res) => {
  const { name, email, role, access_level } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Admin (name, email, role, access_level) VALUES (?, ?, ?, ?)',
      [name, email, role, access_level]
    );
    res.status(201).json({ 
      admin_id: result.insertId,
      message: 'Admin created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update admin
router.put('/:id', async (req, res) => {
  const { name, email, role, access_level } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE Admin SET name = ?, email = ?, role = ?, access_level = ? WHERE admin_id = ?',
      [name, email, role, access_level, req.params.id]
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
      'DELETE FROM Admin WHERE admin_id = ?',
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
