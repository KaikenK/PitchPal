import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { investorAPI, fundingAPI, messageAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function InvestorDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [investor, setInvestor] = useState(null);
  const [startups, setStartups] = useState([]);
  const [fundingRounds, setFundingRounds] = useState([]);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [pitches, setPitches] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageForm, setMessageForm] = useState({
    founder_id: '',
    founder_name: '',
    content: ''
  });
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
      setTotalInvestment(totalRes.data.total_invested || 0);
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
        startup_id: selectedStartup.startup_id,
        investor_id: id,
        amount: parseFloat(investmentAmount)
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      await messageAPI.create({
        founder_id: messageForm.founder_id,
        investor_id: parseInt(id),
        content: messageForm.content,
        sender_type: 'INVESTOR'
      });
      alert('Message sent successfully!');
      setShowMessageModal(false);
      setMessageForm({ founder_id: '', founder_name: '', content: '' });
      loadData();
    } catch (error) {
      alert('Error sending message: ' + error.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
        <button onClick={handleLogout} className="btn btn-danger">Logout</button>
      </div>

      <div className="container">
        <div className="card">
          <h2>Welcome, {investor.name}!</h2>
          <p><strong>Email:</strong> {investor.email}</p>
          <p><strong>Bio:</strong> {investor.bio || 'No bio provided'}</p>
          <p><strong>Available Funds:</strong> ${Number(investor.funds || 0).toLocaleString()}</p>
          <p><strong>Min Investment:</strong> ${Number(investor.min_investment || 0).toLocaleString()}</p>
          <p><strong>Max Investment:</strong> ${Number(investor.max_investment || 0).toLocaleString()}</p>
          <p>
            <strong>Status:</strong>{' '}
            <span className={`status-badge ${investor.is_approved ? 'status-approved' : 'status-pending'}`}>
              {investor.is_approved ? 'Approved' : 'Pending Approval'}
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
            <h3>{pitches.filter(p => p.status === 'Pending').length}</h3>
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
                  <th>Funding</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {startups.map(startup => (
                  <tr key={startup.startup_id}>
                    <td>{startup.name}</td>
                    <td>{startup.founder_name}</td>
                    <td>{startup.d_name}</td>
                    <td>{startup.stage}</td>
                    <td>${Number(startup.funding || 0).toLocaleString()}</td>
                    <td>
                      <button 
                        className="btn btn-success" 
                        onClick={() => openInvestModal(startup)}
                        disabled={!investor.is_approved}
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
                </tr>
              </thead>
              <tbody>
                {fundingRounds.map(round => (
                  <tr key={round.funding_round_id}>
                    <td>{round.startup_name}</td>
                    <td>{round.d_name}</td>
                    <td>${Number(round.amount).toLocaleString()}</td>
                    <td>{new Date(round.date).toLocaleDateString()}</td>
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
                  <th>Founder</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {pitches.map(pitch => (
                  <tr key={pitch.pitch_match_id}>
                    <td>{pitch.founder_name}</td>
                    <td>
                      <span className={`status-badge status-${pitch.status ? pitch.status.toLowerCase() : 'pending'}`}>
                        {pitch.status}
                      </span>
                    </td>
                    <td>{new Date(pitch.pitch_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2>Messages</h2>
          <button 
            onClick={() => setShowMessageModal(true)} 
            className="btn btn-primary"
            style={{marginBottom: '15px'}}
          >
            + Send New Message
          </button>
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
                  <tr key={message.m_id}>
                    <td>
                      {message.sender_type === 'Investor' && message.investor_id === parseInt(id)
                        ? `To: Founder`
                        : `From: Founder`
                      }
                    </td>
                    <td>{message.content}</td>
                    <td>{new Date(message.timestamp).toLocaleDateString()}</td>
                    <td>{message.is_moderated ? '✓' : '✗'}</td>
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
            <h2>Invest in {selectedStartup.name}</h2>
            <p><strong>Founder:</strong> {selectedStartup.founder_name}</p>
            <p><strong>Domain:</strong> {selectedStartup.d_name}</p>
            <p><strong>Current Funding:</strong> ${Number(selectedStartup.funding || 0).toLocaleString()}</p>
            
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

      {showMessageModal && (
        <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>📧 Send Message to Founder</h2>
            <form onSubmit={handleSendMessage}>
              <div className="form-group">
                <label>Select Founder</label>
                <select
                  value={messageForm.founder_id}
                  onChange={(e) => {
                    const selectedPitch = pitches.find(p => p.founder_id === parseInt(e.target.value));
                    setMessageForm({
                      ...messageForm, 
                      founder_id: parseInt(e.target.value),
                      founder_name: selectedPitch?.founder_name || ''
                    });
                  }}
                  required
                >
                  <option value="">Choose a founder...</option>
                  {pitches.filter(p => p.status === 'Accepted').map(pitch => (
                    <option key={pitch.founder_id} value={pitch.founder_id}>
                      {pitch.founder_name}
                    </option>
                  ))}
                </select>
                <small style={{color: '#666', fontSize: '12px', marginTop: '5px', display: 'block'}}>
                  You can only message founders with accepted pitches
                </small>
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={messageForm.content}
                  onChange={(e) => setMessageForm({...messageForm, content: e.target.value})}
                  rows="5"
                  placeholder="Type your message here..."
                  required
                  style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd'}}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Send Message
              </button>
              <button type="button" className="btn btn-danger" onClick={() => setShowMessageModal(false)}>
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
