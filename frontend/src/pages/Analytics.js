import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

function Analytics() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
  
  // Special Report Query States
  const [startupsWithDetails, setStartupsWithDetails] = useState([]);
  const [domainStartupCount, setDomainStartupCount] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('AI/ML');
  const [investorsByDomain, setInvestorsByDomain] = useState([]);
  const [availableDomains, setAvailableDomains] = useState([]);
  const [showReports, setShowReports] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

      console.log('Analytics Data Loaded:', {
        summary: summaryRes.data,
        domains: domainsRes.data,
        founders: foundersRes.data
      });

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
      alert('Error loading analytics: ' + error.message);
      setLoading(false);
    }
  };

  const loadSpecialReports = async () => {
    try {
      const [domainsRes, startupsRes, domainCountRes] = await Promise.all([
        analyticsAPI.getAvailableDomains(),
        analyticsAPI.getStartupsWithDetails(),
        analyticsAPI.getDomainStartupCount()
      ]);
      
      setAvailableDomains(domainsRes.data);
      setStartupsWithDetails(startupsRes.data);
      setDomainStartupCount(domainCountRes.data);
      
      // Load investors for the initially selected domain
      if (selectedDomain) {
        const investorsRes = await analyticsAPI.getInvestorsByDomain(selectedDomain);
        setInvestorsByDomain(investorsRes.data);
      }
    } catch (error) {
      console.error('Error loading special reports:', error);
      alert('Error loading special reports: ' + error.message);
    }
  };

  const handleDomainChange = async (domainName) => {
    setSelectedDomain(domainName);
    try {
      const investorsRes = await analyticsAPI.getInvestorsByDomain(domainName);
      setInvestorsByDomain(investorsRes.data);
    } catch (error) {
      console.error('Error loading investors by domain:', error);
      alert('Error loading investors: ' + error.message);
    }
  };

  useEffect(() => {
    if (showReports && availableDomains.length === 0) {
      loadSpecialReports();
    }
  }, [showReports]);

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="navbar">
        <h1>📊 Analytics Dashboard</h1>
        <Link to={`/admin/${user?.id}`}>Back to Admin Dashboard</Link>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="container">
        <div className="card">
          <h2>Platform Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{summary?.total_startups || 0}</h3>
              <p>Total Startups</p>
            </div>
            <div className="stat-card">
              <h3>{summary?.total_founders || 0}</h3>
              <p>Total Founders</p>
            </div>
            <div className="stat-card">
              <h3>{summary?.total_investors || 0}</h3>
              <p>Approved Investors</p>
            </div>
            <div className="stat-card">
              <h3>${Number(summary?.total_funding || 0).toLocaleString()}</h3>
              <p>Total Funding</p>
            </div>
            <div className="stat-card">
              <h3>{summary?.pending_pitches || 0}</h3>
              <p>Pending Pitches</p>
            </div>
            <div className="stat-card">
              <h3>{summary?.unmoderated_messages || 0}</h3>
              <p>Unmoderated Messages</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Startups Per Domain</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={startupsPerDomain}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="d_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_startups" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Funding Trends (Last 12 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fundingTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total_funding" stroke="#667eea" name="Total Funding" />
              <Line type="monotone" dataKey="funding_rounds_count" stroke="#10b981" name="Funding Rounds" />
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
                label={({ stage, count }) => `${stage}: ${count}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
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
                label={({ status, percentage }) => `${status}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
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
                  <th>Available Funds</th>
                </tr>
              </thead>
              <tbody>
                {topInvestors.map((investor, index) => (
                  <tr key={investor.investor_id}>
                    <td>{investor.name}</td>
                    <td>${Number(investor.total_invested || 0).toLocaleString()}</td>
                    <td>{investor.startups_invested || 0}</td>
                    <td>{investor.total_investments || 0}</td>
                    <td>${Number(investor.funds || 0).toLocaleString()}</td>
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
                  <tr key={founder.founder_id}>
                    <td>{founder.name}</td>
                    <td>{founder.email}</td>
                    <td>{founder.startup_count}</td>
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
                  <th>Funding Rounds</th>
                </tr>
              </thead>
              <tbody>
                {totalFundingPerStartup.map((startup) => (
                  <tr key={startup.startup_id}>
                    <td>{startup.name}</td>
                    <td>${Number(startup.funding || 0).toLocaleString()}</td>
                    <td>{startup.funding_rounds || 0}</td>
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
                </tr>
              </thead>
              <tbody>
                {latestFunding.map((round) => (
                  <tr key={round.funding_round_id}>
                    <td>{round.startup_name}</td>
                    <td>{round.investor_name}</td>
                    <td>{round.d_name}</td>
                    <td>${Number(round.amount).toLocaleString()}</td>
                    <td>{new Date(round.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Special Report Queries Section */}
        <div className="card" style={{marginTop: '30px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'}}>
          <h2 style={{color: 'white'}}>📋 Database Report Queries</h2>
          <p style={{marginBottom: '15px'}}>Special query types: JOIN, AGGREGATE, and NESTED (Subquery)</p>
          <button 
            onClick={() => setShowReports(!showReports)}
            style={{
              padding: '10px 20px',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '5px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {showReports ? 'Hide Reports ▲' : 'Show Reports ▼'}
          </button>
        </div>

        {showReports && (
          <>
            {/* JOIN QUERY: Startups with Details */}
            <div className="card">
              <h2>🔗 JOIN Query: Startups with Founder & Domain Details</h2>
              <p style={{color: '#666', marginBottom: '15px'}}>
                <strong>Query Type:</strong> Multi-table JOIN <br/>
                <strong>Description:</strong> Lists all startups with their founder and domain information using INNER JOIN
              </p>
              <div className="table-container" style={{maxHeight: '400px', overflowY: 'auto'}}>
                <table>
                  <thead>
                    <tr>
                      <th>Startup</th>
                      <th>Founder</th>
                      <th>Email</th>
                      <th>Domain</th>
                      <th>Stage</th>
                      <th>Funding</th>
                    </tr>
                  </thead>
                  <tbody>
                    {startupsWithDetails.map((startup) => (
                      <tr key={startup.startup_id}>
                        <td><strong>{startup.startup_name}</strong></td>
                        <td>{startup.founder_name}</td>
                        <td>{startup.founder_email}</td>
                        <td>{startup.domain}</td>
                        <td>{startup.stage}</td>
                        <td>${Number(startup.funding || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{marginTop: '15px', padding: '10px', background: '#f5f5f5', borderRadius: '5px', fontFamily: 'monospace', fontSize: '12px'}}>
                <strong>SQL Query:</strong><br/>
                SELECT s.name, f.name, d.d_name<br/>
                FROM Startup s<br/>
                <strong>JOIN</strong> Founder f ON s.founder_id = f.founder_id<br/>
                <strong>JOIN</strong> Domain d ON s.domain_id = d.domain_id
              </div>
            </div>

            {/* AGGREGATE QUERY: Domain Startup Count */}
            <div className="card">
              <h2>📊 AGGREGATE Query: Startup Count Per Domain</h2>
              <p style={{color: '#666', marginBottom: '15px'}}>
                <strong>Query Type:</strong> GROUP BY with COUNT aggregate<br/>
                <strong>Description:</strong> Counts number of startups in each domain using GROUP BY and aggregate function
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={domainStartupCount}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="domain_name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="startup_count" fill="#667eea" name="Startups" />
                </BarChart>
              </ResponsiveContainer>
              <div className="table-container" style={{marginTop: '20px'}}>
                <table>
                  <thead>
                    <tr>
                      <th>Domain</th>
                      <th>Startup Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domainStartupCount.map((domain, index) => (
                      <tr key={index}>
                        <td><strong>{domain.domain_name}</strong></td>
                        <td>{domain.startup_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{marginTop: '15px', padding: '10px', background: '#f5f5f5', borderRadius: '5px', fontFamily: 'monospace', fontSize: '12px'}}>
                <strong>SQL Query:</strong><br/>
                SELECT d.d_name, <strong>COUNT(s.startup_id)</strong> AS startup_count<br/>
                FROM Domain d<br/>
                LEFT JOIN Startup s ON d.domain_id = s.domain_id<br/>
                <strong>GROUP BY</strong> d.d_name<br/>
                ORDER BY startup_count DESC
              </div>
            </div>

            {/* NESTED QUERY: Investors by Domain */}
            <div className="card">
              <h2>🔍 NESTED (Subquery) Query: Investors by Domain</h2>
              <p style={{color: '#666', marginBottom: '15px'}}>
                <strong>Query Type:</strong> Subquery with IN clause and nested SELECT<br/>
                <strong>Description:</strong> Finds all investors interested in a specific domain using nested subqueries
              </p>
              <div style={{marginBottom: '20px'}}>
                <label style={{fontWeight: 'bold', marginRight: '10px'}}>Select Domain:</label>
                <select 
                  value={selectedDomain}
                  onChange={(e) => handleDomainChange(e.target.value)}
                  style={{
                    padding: '8px 15px',
                    borderRadius: '5px',
                    border: '2px solid #667eea',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {availableDomains.map(domain => (
                    <option key={domain.domain_id} value={domain.d_name}>
                      {domain.d_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Investor Name</th>
                      <th>Email</th>
                      <th>Available Funds</th>
                      <th>Min Investment</th>
                      <th>Max Investment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investorsByDomain.length > 0 ? (
                      investorsByDomain.map((investor) => (
                        <tr key={investor.investor_id}>
                          <td><strong>{investor.name}</strong></td>
                          <td>{investor.email}</td>
                          <td>${Number(investor.funds || 0).toLocaleString()}</td>
                          <td>${Number(investor.min_investment || 0).toLocaleString()}</td>
                          <td>${Number(investor.max_investment || 0).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{textAlign: 'center', color: '#999'}}>
                          No investors found for {selectedDomain}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{marginTop: '15px', padding: '10px', background: '#f5f5f5', borderRadius: '5px', fontFamily: 'monospace', fontSize: '12px'}}>
                <strong>SQL Query:</strong><br/>
                SELECT name, email, funds<br/>
                FROM Investor<br/>
                WHERE investor_id <strong>IN</strong> (<br/>
                &nbsp;&nbsp;SELECT investor_id FROM InvestorDomain<br/>
                &nbsp;&nbsp;WHERE domain_id = (<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<strong>SELECT domain_id FROM Domain WHERE d_name = '{selectedDomain}'</strong><br/>
                &nbsp;&nbsp;)<br/>
                )
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Analytics;
