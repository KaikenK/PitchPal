import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

function Analytics() {
  const [summary, setSummary] = useState(null);
  const [startupsPerDomain, setStartupsPerDomain] = useState([]);
  const [foundersCount, setFoundersCount] = useState([]);
  const [latestFunding, setLatestFunding] = useState([]);
  const [totalFundingPerStartup, setTotalFundingPerStartup] = useState([]);
  const [topInvestors, setTopInvestors] = useState([]);
  const [fundingTrends, setFundingTrends] = useState([]);
  const [stageDistribution, setStageDistribution] = useState([]);
  const [pitchSuccessRate, setPitchSuccessRate] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [
        summaryRes,
        domainsRes,
        foundersRes,
        latestRes,
        totalFundingRes,
        investorsRes,
        trendsRes,
        stageRes,
        pitchRes
      ] = await Promise.all([
        analyticsAPI.getDashboardSummary(),
        analyticsAPI.getStartupsPerDomain(),
        analyticsAPI.getFoundersStartupCount(),
        analyticsAPI.getLatestFundingRounds(10),
        analyticsAPI.getTotalFundingPerStartup(),
        analyticsAPI.getTopInvestors(10),
        analyticsAPI.getFundingTrends(),
        analyticsAPI.getStartupStageDistribution(),
        analyticsAPI.getPitchSuccessRate()
      ]);

      setSummary(summaryRes.data);
      setStartupsPerDomain(domainsRes.data);
      setFoundersCount(foundersRes.data);
      setLatestFunding(latestRes.data);
      setTotalFundingPerStartup(totalFundingRes.data);
      setTopInvestors(investorsRes.data);
      setFundingTrends(trendsRes.data);
      setStageDistribution(stageRes.data);
      setPitchSuccessRate(pitchRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="navbar">
        <h1>📊 Analytics Dashboard</h1>
        <Link to="/">Home</Link>
      </div>

      <div className="container">
        <div className="card">
          <h2>Platform Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{summary?.totalStartups || 0}</h3>
              <p>Total Startups</p>
            </div>
            <div className="stat-card">
              <h3>{summary?.totalFounders || 0}</h3>
              <p>Total Founders</p>
            </div>
            <div className="stat-card">
              <h3>{summary?.totalInvestors || 0}</h3>
              <p>Approved Investors</p>
            </div>
            <div className="stat-card">
              <h3>${Number(summary?.totalFunding || 0).toLocaleString()}</h3>
              <p>Total Funding</p>
            </div>
            <div className="stat-card">
              <h3>{summary?.pendingPitches || 0}</h3>
              <p>Pending Pitches</p>
            </div>
            <div className="stat-card">
              <h3>{summary?.unmoderatedMessages || 0}</h3>
              <p>Unmoderated Messages</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Startups Per Domain</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={startupsPerDomain}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="DomainName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="TotalStartups" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Funding Trends (Last 12 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fundingTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="TotalFunding" stroke="#667eea" name="Total Funding" />
              <Line type="monotone" dataKey="FundingRoundsCount" stroke="#10b981" name="Funding Rounds" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Startup Stage Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stageDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ Stage, Count }) => `${Stage}: ${Count}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="Count"
              >
                {stageDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Pitch Match Success Rate</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pitchSuccessRate}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ Status, Percentage }) => `${Status}: ${Percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="Count"
              >
                {pitchSuccessRate.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Top Investors by Total Investment</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Investor</th>
                  <th>Total Invested</th>
                  <th>Startups Invested</th>
                  <th>Total Investments</th>
                  <th>Investment Capacity</th>
                </tr>
              </thead>
              <tbody>
                {topInvestors.map((investor, index) => (
                  <tr key={investor.InvestorID}>
                    <td>{investor.FullName}</td>
                    <td>${Number(investor.TotalInvested).toLocaleString()}</td>
                    <td>{investor.StartupsInvested}</td>
                    <td>{investor.TotalInvestments}</td>
                    <td>${Number(investor.TotalInvestmentCapacity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2>Founders by Startup Count</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Founder</th>
                  <th>Email</th>
                  <th>Startup Count</th>
                </tr>
              </thead>
              <tbody>
                {foundersCount.map((founder) => (
                  <tr key={founder.FounderID}>
                    <td>{founder.FullName}</td>
                    <td>{founder.Email}</td>
                    <td>{founder.StartupCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2>Total Funding Per Startup</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Startup</th>
                  <th>Current Funding</th>
                  <th>Funding Goal</th>
                  <th>Progress</th>
                  <th>Funding Rounds</th>
                </tr>
              </thead>
              <tbody>
                {totalFundingPerStartup.map((startup) => (
                  <tr key={startup.StartupID}>
                    <td>{startup.StartupName}</td>
                    <td>${Number(startup.CurrentFunding).toLocaleString()}</td>
                    <td>${Number(startup.FundingGoal).toLocaleString()}</td>
                    <td>{startup.FundingProgress}%</td>
                    <td>{startup.FundingRounds}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2>Latest Funding Rounds</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Startup</th>
                  <th>Investor</th>
                  <th>Domain</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {latestFunding.map((round) => (
                  <tr key={round.FundingRoundID}>
                    <td>{round.StartupName}</td>
                    <td>{round.InvestorName}</td>
                    <td>{round.DomainName}</td>
                    <td>${Number(round.Amount).toLocaleString()}</td>
                    <td>{new Date(round.RoundDate).toLocaleDateString()}</td>
                    <td>{round.Notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
