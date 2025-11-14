const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all domains
router.get('/', async (req, res) => {
  try {
    const [domains] = await db.query('SELECT * FROM Domain ORDER BY d_name');
    res.json(domains);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get domain by ID
router.get('/:id', async (req, res) => {
  try {
    const [domains] = await db.query(
      'SELECT * FROM Domain WHERE domain_id = ?',
      [req.params.id]
    );
    if (domains.length === 0) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    res.json(domains[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get startups in a domain
router.get('/:id/startups', async (req, res) => {
  try {
    const [startups] = await db.query(
      `SELECT s.*, f.name AS founder_name
       FROM Startup s
       JOIN Founder f ON s.founder_id = f.founder_id
       WHERE s.domain_id = ?`,
      [req.params.id]
    );
    res.json(startups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new domain
router.post('/', async (req, res) => {
  const { d_name } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Domain (d_name) VALUES (?)',
      [d_name]
    );
    res.status(201).json({ 
      domain_id: result.insertId,
      message: 'Domain created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update domain
router.put('/:id', async (req, res) => {
  const { d_name } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE Domain SET d_name = ? WHERE domain_id = ?',
      [d_name, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    res.json({ message: 'Domain updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete domain
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM Domain WHERE domain_id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    res.json({ message: 'Domain deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
