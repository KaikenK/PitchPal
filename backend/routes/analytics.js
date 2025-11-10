const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get total startups per domain (aggregate query)
router.get('/startups-per-domain', async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT d.DomainID, d.DomainName, COUNT(s.StartupID) AS TotalStartups
       FROM Domain d
       LEFT JOIN Startup s ON d.DomainID = s.DomainID
       GROUP BY d.DomainID, d.DomainName
       ORDER BY TotalStartups DESC`
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
      `SELECT f.FounderID, f.FullName, f.Email, fn_GetFounderStartupCount(f.FounderID) AS StartupCount
       FROM Founder f
       ORDER BY StartupCount DESC`
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
      `SELECT fr.*, s.StartupName, i.FullName AS InvestorName, d.DomainName
       FROM FundingRound fr
       JOIN Startup s ON fr.StartupID = s.StartupID
       JOIN Investor i ON fr.InvestorID = i.InvestorID
       JOIN Domain d ON s.DomainID = d.DomainID
       ORDER BY fr.RoundDate DESC
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
      `SELECT s.StartupID, s.StartupName, s.CurrentFunding, s.FundingGoal,
       COALESCE(SUM(fr.Amount), 0) AS TotalRaised,
       COUNT(fr.FundingRoundID) AS FundingRounds,
       ROUND((s.CurrentFunding / NULLIF(s.FundingGoal, 0)) * 100, 2) AS FundingProgress
       FROM Startup s
       LEFT JOIN FundingRound fr ON s.StartupID = fr.StartupID
       GROUP BY s.StartupID, s.StartupName, s.CurrentFunding, s.FundingGoal
       ORDER BY TotalRaised DESC`
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
      `SELECT i.InvestorID, i.FullName, i.TotalInvestmentCapacity,
       COALESCE(SUM(fr.Amount), 0) AS TotalInvested,
       COUNT(DISTINCT fr.StartupID) AS StartupsInvested,
       COUNT(fr.FundingRoundID) AS TotalInvestments
       FROM Investor i
       LEFT JOIN FundingRound fr ON i.InvestorID = fr.InvestorID
       GROUP BY i.InvestorID, i.FullName, i.TotalInvestmentCapacity
       ORDER BY TotalInvested DESC
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
      `SELECT DATE_FORMAT(RoundDate, '%Y-%m') AS Month,
       COUNT(*) AS FundingRoundsCount,
       SUM(Amount) AS TotalFunding,
       AVG(Amount) AS AvgFunding
       FROM FundingRound
       GROUP BY Month
       ORDER BY Month DESC
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
      `SELECT Stage, COUNT(*) AS Count, 
       SUM(CurrentFunding) AS TotalFunding,
       AVG(CurrentFunding) AS AvgFunding
       FROM Startup
       GROUP BY Stage
       ORDER BY Count DESC`
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
       Status,
       COUNT(*) AS Count,
       ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM PitchMatch)), 2) AS Percentage
       FROM PitchMatch
       GROUP BY Status`
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
    const [investorCount] = await db.query('SELECT COUNT(*) AS count FROM Investor WHERE IsApproved = TRUE');
    const [totalFunding] = await db.query('SELECT COALESCE(SUM(Amount), 0) AS total FROM FundingRound');
    const [pitchCount] = await db.query('SELECT COUNT(*) AS count FROM PitchMatch WHERE Status = "Pending"');
    const [messageCount] = await db.query('SELECT COUNT(*) AS count FROM Message WHERE IsModerated = FALSE');
    
    res.json({
      totalStartups: startupCount[0].count,
      totalFounders: founderCount[0].count,
      totalInvestors: investorCount[0].count,
      totalFunding: totalFunding[0].total,
      pendingPitches: pitchCount[0].count,
      unmoderatedMessages: messageCount[0].count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
