import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { investorAPI, fundingAPI } from '../services/api';

function InvestorDashboard() {
  const { id } = useParams();
  const [investor, setInvestor] = useState(null);
  const [startups, setStartups] = useState([]);
  const [fundingRounds, setFundingRounds] = useState([]);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [pitches, setPitches] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [investmentNotes, setInvestmentNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [
        investorRes,
        startupsRes,
        fundingRes,
        totalRes,
        pitchesRes,
        messagesRes
      ] = await Promise.all([
        investorAPI.getById(id),
        investorAPI.getStartups(id),
        investorAPI.getFundingRounds(id),
        investorAPI.getTotalInvestment(id),
        investorAPI.getPitches(id),
        investorAPI.getMessages(id)
      ]);
      setInvestor(investorRes.data);
      setStartups(startupsRes.data);
      setFundingRounds(fundingRes.data);
      setTotalInvestment(totalRes.data.TotalInvested);
      setPitches(pitchesRes.data);
      setMessages(messagesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading investor data:', error);
      setLoading(false);
    }
  };

  const handleInvest = async (e) => {
    e.preventDefault();
    try {
      await fundingAPI.create({
        StartupID: selectedStartup.StartupID,
        InvestorID: id,
        Amount: parseFloat(investmentAmount),
        Notes: investmentNotes
      });
      setShowInvestModal(false);
      setSelectedStartup(null);
      setInvestmentAmount('');
      setInvestmentNotes('');
      alert('Investment successful!');
      loadData();
    } catch (error) {
      alert('Error creating investment: ' + (error.response?.data?.error || error.message));
    }
  };

  const openInvestModal = (startup) => {
    setSelectedStartup(startup);
    setShowInvestModal(true);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!investor) {
    return <div className="error">Investor not found</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="navbar">
        <h1>💼 Investor Dashboard</h1>
        <Link to="/">Home</Link>
        <Link to="/analytics">Analytics</Link>
      </div>

      <div className="container">
        <div className="card">
          <h2>Welcome, {investor.FullName}!</h2>
          <p><strong>Email:</strong> {investor.Email}</p>
          <p><strong>Bio:</strong> {investor.Bio || 'No bio provided'}</p>
          <p><strong>Investment Capacity:</strong> ${Number(investor.TotalInvestmentCapacity).toLocaleString()}</p>
          <p>
            <strong>Status:</strong>{' '}
            <span className={`status-badge ${investor.IsApproved ? 'status-approved' : 'status-pending'}`}>
              {investor.IsApproved ? 'Approved' : 'Pending Approval'}
            </span>
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>${Number(totalInvestment).toLocaleString()}</h3>
            <p>Total Invested</p>
          </div>
          <div className="stat-card">
            <h3>{fundingRounds.length}</h3>
            <p>Funding Rounds</p>
          </div>
          <div className="stat-card">
            <h3>{startups.length}</h3>
            <p>Available Startups</p>
          </div>
          <div className="stat-card">
            <h3>{pitches.filter(p => p.Status === 'Pending').length}</h3>
            <p>Pending Pitches</p>
          </div>
        </div>

        <div className="card">
          <h2>Available Startups in My Domains</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Startup</th>
                  <th>Founder</th>
                  <th>Domain</th>
                  <th>Stage</th>
                  <th>Funding Goal</th>
                  <th>Current Funding</th>
                  <th>Progress</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {startups.map(startup => (
                  <tr key={startup.StartupID}>
                    <td>{startup.StartupName}</td>
                    <td>{startup.FounderName}</td>
                    <td>{startup.DomainName}</td>
                    <td>{startup.Stage}</td>
                    <td>${Number(startup.FundingGoal).toLocaleString()}</td>
                    <td>${Number(startup.CurrentFunding).toLocaleString()}</td>
                    <td>
                      {Math.round((startup.CurrentFunding / startup.FundingGoal) * 100)}%
                    </td>
                    <td>
                      <button 
                        className="btn btn-success" 
                        onClick={() => openInvestModal(startup)}
                        disabled={!investor.IsApproved}
                      >
                        Invest
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2>My Investments</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Startup</th>
                  <th>Domain</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {fundingRounds.map(round => (
                  <tr key={round.FundingRoundID}>
                    <td>{round.StartupName}</td>
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

        <div className="card">
          <h2>Pitch Matches</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Startup</th>
                  <th>Founder</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {pitches.map(pitch => (
                  <tr key={pitch.PitchMatchID}>
                    <td>{pitch.StartupName}</td>
                    <td>{pitch.FounderName}</td>
                    <td>
                      <span className={`status-badge status-${pitch.Status.toLowerCase()}`}>
                        {pitch.Status}
                      </span>
                    </td>
                    <td>{new Date(pitch.PitchDate).toLocaleDateString()}</td>
                    <td>{pitch.Notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2>Messages</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>From/To</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Moderated</th>
                </tr>
              </thead>
              <tbody>
                {messages.map(message => (
                  <tr key={message.MessageID}>
                    <td>
                      {message.SenderType === 'Investor' && message.SenderID === parseInt(id)
                        ? `To: ${message.ReceiverName || 'Unknown'}`
                        : `From: ${message.SenderName || 'Unknown'}`
                      }
                    </td>
                    <td>{message.MessageContent}</td>
                    <td>{new Date(message.SentAt).toLocaleDateString()}</td>
                    <td>{message.IsModerated ? '✓' : '✗'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showInvestModal && selectedStartup && (
        <div className="modal-overlay" onClick={() => setShowInvestModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Invest in {selectedStartup.StartupName}</h2>
            <p><strong>Founder:</strong> {selectedStartup.FounderName}</p>
            <p><strong>Domain:</strong> {selectedStartup.DomainName}</p>
            <p><strong>Funding Goal:</strong> ${Number(selectedStartup.FundingGoal).toLocaleString()}</p>
            <p><strong>Current Funding:</strong> ${Number(selectedStartup.CurrentFunding).toLocaleString()}</p>
            
            <form onSubmit={handleInvest}>
              <div className="form-group">
                <label>Investment Amount</label>
                <input
                  type="number"
                  min="1"
                  max="10000000"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  required
                />
                <small>Note: Amount must be between $1 and $10,000,000</small>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={investmentNotes}
                  onChange={(e) => setInvestmentNotes(e.target.value)}
                  placeholder="Add any notes about this investment..."
                />
              </div>
              <button type="submit" className="btn btn-success">
                Confirm Investment
              </button>
              <button type="button" className="btn btn-danger" onClick={() => setShowInvestModal(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvestorDashboard;
