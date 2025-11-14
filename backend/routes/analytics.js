const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get total startups per domain (aggregate query)
router.get('/startups-per-domain', async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT d.domain_id, d.d_name, COUNT(s.startup_id) AS total_startups
       FROM Domain d
       LEFT JOIN Startup s ON d.domain_id = s.domain_id
       GROUP BY d.domain_id, d.d_name
       ORDER BY total_startups DESC`
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all founders with their startup counts
router.get('/founders-startup-count', async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT f.founder_id, f.name, f.email, COUNT(s.startup_id) AS startup_count
       FROM Founder f
       LEFT JOIN Startup s ON f.founder_id = s.founder_id
       GROUP BY f.founder_id, f.name, f.email
       ORDER BY startup_count DESC`
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get latest funding rounds
router.get('/latest-funding-rounds', async (req, res) => {
  const limit = req.query.limit || 10;
  try {
    const [results] = await db.query(
      `SELECT fr.*, s.name AS startup_name, i.name AS investor_name, d.d_name
       FROM FundingRound fr
       JOIN Startup s ON fr.startup_id = s.startup_id
       JOIN Investor i ON fr.investor_id = i.investor_id
       JOIN Domain d ON s.domain_id = d.domain_id
       ORDER BY fr.date DESC
       LIMIT ?`,
      [parseInt(limit)]
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get total funding per startup
router.get('/total-funding-per-startup', async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT s.startup_id, s.name, s.funding,
       COALESCE(SUM(fr.amount), 0) AS total_raised,
       COUNT(fr.funding_round_id) AS funding_rounds
       FROM Startup s
       LEFT JOIN FundingRound fr ON s.startup_id = fr.startup_id
       GROUP BY s.startup_id, s.name, s.funding
       ORDER BY total_raised DESC`
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top investors by total investment
router.get('/top-investors', async (req, res) => {
  const limit = req.query.limit || 10;
  try {
    const [results] = await db.query(
      `SELECT i.investor_id, i.name, i.funds,
       COALESCE(SUM(fr.amount), 0) AS total_invested,
       COUNT(DISTINCT fr.startup_id) AS startups_invested,
       COUNT(fr.funding_round_id) AS total_investments
       FROM Investor i
       LEFT JOIN FundingRound fr ON i.investor_id = fr.investor_id
       GROUP BY i.investor_id, i.name, i.funds
       ORDER BY total_invested DESC
       LIMIT ?`,
      [parseInt(limit)]
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get funding trends over time
router.get('/funding-trends', async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT DATE_FORMAT(date, '%Y-%m') AS month,
       COUNT(*) AS funding_rounds_count,
       SUM(amount) AS total_funding,
       AVG(amount) AS avg_funding
       FROM FundingRound
       GROUP BY month
       ORDER BY month DESC
       LIMIT 12`
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get startup stage distribution
router.get('/startup-stage-distribution', async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT stage, COUNT(*) AS count, 
       SUM(funding) AS total_funding,
       AVG(funding) AS avg_funding
       FROM Startup
       WHERE stage IS NOT NULL
       GROUP BY stage
       ORDER BY count DESC`
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pitch match success rate
router.get('/pitch-success-rate', async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT 
       status,
       COUNT(*) AS count,
       ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM PitchMatch)), 2) AS percentage
       FROM PitchMatch
       GROUP BY status`
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard summary
router.get('/dashboard-summary', async (req, res) => {
  try {
    const [startupCount] = await db.query('SELECT COUNT(*) AS count FROM Startup');
    const [founderCount] = await db.query('SELECT COUNT(*) AS count FROM Founder');
    const [investorCount] = await db.query('SELECT COUNT(*) AS count FROM Investor');
    const [totalFunding] = await db.query('SELECT COALESCE(SUM(amount), 0) AS total FROM FundingRound');
    const [pitchCount] = await db.query('SELECT COUNT(*) AS count FROM PitchMatch WHERE status = "Pending"');
    const [messageCount] = await db.query(`
      SELECT COUNT(*) AS count 
      FROM Message m 
      WHERE NOT EXISTS (
        SELECT 1 FROM MessageModeration mm WHERE mm.m_id = m.m_id
      )
    `);
    
    res.json({
      total_startups: startupCount[0].count,
      total_founders: founderCount[0].count,
      total_investors: investorCount[0].count,
      total_funding: totalFunding[0].total,
      pending_pitches: pitchCount[0].count,
      unmoderated_messages: messageCount[0].count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------------------------------------------
// SPECIAL QUERY TYPES FOR FINAL REPORT
// ------------------------------------------------------

// 1. JOIN QUERY: List all startups with their founders and domains
router.get('/report/startups-with-details', async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT
        s.startup_id,
        s.name AS startup_name,
        f.name AS founder_name,
        f.email AS founder_email,
        d.d_name AS domain,
        s.stage,
        s.funding,
        s.description
       FROM Startup s
       JOIN Founder f ON s.founder_id = f.founder_id
       JOIN Domain d ON s.domain_id = d.domain_id
       ORDER BY s.name`
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. AGGREGATE QUERY: Count the number of startups in each domain
router.get('/report/domain-startup-count', async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT
        d.d_name AS domain_name,
        COUNT(s.startup_id) AS startup_count
       FROM Domain d
       LEFT JOIN Startup s ON d.domain_id = s.domain_id
       GROUP BY d.d_name
       ORDER BY startup_count DESC`
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. NESTED (Subquery) QUERY: Find all investors interested in a specific domain
router.get('/report/investors-by-domain/:domainName', async (req, res) => {
  try {
    const { domainName } = req.params;
    const [results] = await db.query(
      `SELECT 
        i.investor_id,
        i.name,
        i.email,
        i.funds,
        i.min_investment,
        i.max_investment
       FROM Investor i
       WHERE i.investor_id IN (
         SELECT investor_id
         FROM InvestorDomain
         WHERE domain_id = (
           SELECT domain_id 
           FROM Domain 
           WHERE d_name = ?
         )
       )
       ORDER BY i.name`,
      [domainName]
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bonus: Get all available domains for the nested query filter
router.get('/report/available-domains', async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT domain_id, d_name 
       FROM Domain 
       ORDER BY d_name`
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
