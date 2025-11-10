const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all domains
router.get('/', async (req, res) => {
  try {
    const [domains] = await db.query('SELECT * FROM Domain ORDER BY DomainName');
    res.json(domains);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get domain by ID
router.get('/:id', async (req, res) => {
  try {
    const [domains] = await db.query(
      'SELECT * FROM Domain WHERE DomainID = ?',
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
      `SELECT s.*, f.FullName AS FounderName
       FROM Startup s
       JOIN Founder f ON s.FounderID = f.FounderID
       WHERE s.DomainID = ?
       ORDER BY s.CreatedAt DESC`,
      [req.params.id]
    );
    res.json(startups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new domain
router.post('/', async (req, res) => {
  const { DomainName, Description } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Domain (DomainName, Description) VALUES (?, ?)',
      [DomainName, Description]
    );
    res.status(201).json({ 
      DomainID: result.insertId,
      message: 'Domain created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update domain
router.put('/:id', async (req, res) => {
  const { DomainName, Description } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE Domain SET DomainName = ?, Description = ? WHERE DomainID = ?',
      [DomainName, Description, req.params.id]
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
      'DELETE FROM Domain WHERE DomainID = ?',
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
