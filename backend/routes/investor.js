const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all investors
router.get('/', async (req, res) => {
  try {
    const [investors] = await db.query(
      'SELECT investor_id, name, email, password, funds, min_investment, max_investment FROM Investor'
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
      `SELECT i.investor_id, i.name, i.email, i.funds, i.min_investment, i.max_investment,
       EXISTS(SELECT 1 FROM AdminInvestorApproval WHERE investor_id = i.investor_id) AS is_approved
       FROM Investor i WHERE i.investor_id = ?`,
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
       JOIN InvestorDomain id ON d.domain_id = id.domain_id
       WHERE id.investor_id = ?`,
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
      `SELECT DISTINCT s.*, d.d_name, f.name AS founder_name
       FROM Startup s
       JOIN Domain d ON s.domain_id = d.domain_id
       JOIN Founder f ON s.founder_id = f.founder_id
       JOIN InvestorDomain id ON s.domain_id = id.domain_id
       WHERE id.investor_id = ?`,
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
      `SELECT fr.*, s.name AS startup_name, d.d_name
       FROM FundingRound fr
       JOIN Startup s ON fr.startup_id = s.startup_id
       JOIN Domain d ON s.domain_id = d.domain_id
       WHERE fr.investor_id = ?
       ORDER BY fr.date DESC`,
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
      `SELECT COALESCE(SUM(amount), 0) AS total_invested
       FROM FundingRound
       WHERE investor_id = ?`,
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
      'SELECT fn_CheckInvestorApprovalStatus(?) AS approval_status',
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
      `SELECT pm.*, f.name AS founder_name
       FROM PitchMatch pm
       JOIN Founder f ON pm.founder_id = f.founder_id
       WHERE pm.investor_id = ?
       ORDER BY pm.pitch_date DESC`,
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
      `SELECT m.*, i.name AS investor_name, f.name AS founder_name,
       EXISTS(SELECT 1 FROM MessageModeration mm WHERE mm.m_id = m.m_id) AS is_moderated
       FROM Message m
       LEFT JOIN Investor i ON m.investor_id = i.investor_id
       LEFT JOIN Founder f ON m.founder_id = f.founder_id
       WHERE m.investor_id = ?
       ORDER BY m.timestamp DESC`,
      [req.params.id]
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new investor
router.post('/', async (req, res) => {
  const { name, email, password, funds, min_investment, max_investment, domain_ids } = req.body;
  try {
    // Start transaction
    await db.query('START TRANSACTION');
    
    // Insert investor
    const [result] = await db.query(
      'INSERT INTO Investor (name, email, password, funds, min_investment, max_investment) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, funds || 0, min_investment || 0, max_investment || 0]
    );
    
    const investorId = result.insertId;
    
    // Add domains if provided
    if (domain_ids && Array.isArray(domain_ids) && domain_ids.length > 0) {
      const domainValues = domain_ids.map(domainId => [investorId, domainId]);
      await db.query(
        'INSERT INTO InvestorDomain (investor_id, domain_id) VALUES ?',
        [domainValues]
      );
    }
    
    // Commit transaction
    await db.query('COMMIT');
    
    res.status(201).json({ 
      investor_id: investorId,
      message: 'Investor created successfully'
    });
  } catch (error) {
    // Rollback on error
    await db.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

// Add domain to investor
router.post('/:id/domains', async (req, res) => {
  const { domain_id } = req.body;
  try {
    await db.query(
      'INSERT INTO InvestorDomain (investor_id, domain_id) VALUES (?, ?)',
      [req.params.id, domain_id]
    );
    res.status(201).json({ message: 'Domain added to investor successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update investor
router.put('/:id', async (req, res) => {
  const { name, email, funds, min_investment, max_investment } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE Investor SET name = ?, email = ?, funds = ?, min_investment = ?, max_investment = ? WHERE investor_id = ?',
      [name, email, funds, min_investment, max_investment, req.params.id]
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
      'DELETE FROM Investor WHERE investor_id = ?',
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
