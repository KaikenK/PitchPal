const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all messages
router.get('/', async (req, res) => {
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

// Get message by ID
router.get('/:id', async (req, res) => {
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
       WHERE m.MessageID = ?`,
      [req.params.id]
    );
    if (messages.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(messages[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversation between two users
router.get('/conversation/:type1/:id1/:type2/:id2', async (req, res) => {
  const { type1, id1, type2, id2 } = req.params;
  try {
    const [messages] = await db.query(
      `SELECT m.*, 
       CASE 
         WHEN m.SenderType = 'Investor' THEN si.FullName
         ELSE sf.FullName
       END AS SenderName
       FROM Message m
       LEFT JOIN Investor si ON m.SenderType = 'Investor' AND m.SenderID = si.InvestorID
       LEFT JOIN Founder sf ON m.SenderType = 'Founder' AND m.SenderID = sf.FounderID
       WHERE ((m.SenderType = ? AND m.SenderID = ? AND m.ReceiverType = ? AND m.ReceiverID = ?)
          OR (m.SenderType = ? AND m.SenderID = ? AND m.ReceiverType = ? AND m.ReceiverID = ?))
       ORDER BY m.SentAt ASC`,
      [type1, id1, type2, id2, type2, id2, type1, id1]
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send a message
router.post('/', async (req, res) => {
  const { SenderType, SenderID, ReceiverType, ReceiverID, MessageContent } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Message (SenderType, SenderID, ReceiverType, ReceiverID, MessageContent) VALUES (?, ?, ?, ?, ?)',
      [SenderType, SenderID, ReceiverType, ReceiverID, MessageContent]
    );
    res.status(201).json({ 
      MessageID: result.insertId,
      message: 'Message sent successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete message
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM Message WHERE MessageID = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
