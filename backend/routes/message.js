const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all messages
router.get('/', async (req, res) => {
  try {
    const [messages] = await db.query(
      `SELECT m.*, i.name AS investor_name, f.name AS founder_name
       FROM Message m
       LEFT JOIN Investor i ON m.investor_id = i.investor_id
       LEFT JOIN Founder f ON m.founder_id = f.founder_id
       ORDER BY m.timestamp DESC`
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
      `SELECT m.*, i.name AS investor_name, f.name AS founder_name
       FROM Message m
       LEFT JOIN Investor i ON m.investor_id = i.investor_id
       LEFT JOIN Founder f ON m.founder_id = f.founder_id
       WHERE m.m_id = ?`,
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

// Send a message
router.post('/', async (req, res) => {
  const { founder_id, investor_id, content, sender_type } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Message (founder_id, investor_id, content, sender_type) VALUES (?, ?, ?, ?)',
      [founder_id, investor_id, content, sender_type]
    );
    res.status(201).json({ 
      m_id: result.insertId,
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
      'DELETE FROM Message WHERE m_id = ?',
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
