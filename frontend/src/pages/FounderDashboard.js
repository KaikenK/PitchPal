import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { founderAPI, startupAPI, domainAPI, pitchMatchAPI } from '../services/api';

function FounderDashboard() {
  const { id } = useParams();
  const [founder, setFounder] = useState(null);
  const [startups, setStartups] = useState([]);
  const [pitches, setPitches] = useState([]);
  const [messages, setMessages] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStartupModal, setShowStartupModal] = useState(false);
  const [editingStartup, setEditingStartup] = useState(null);
  const [startupForm, setStartupForm] = useState({
    StartupName: '',
    Description: '',
    FundingGoal: '',
    Stage: 'Pre-seed',
    DomainID: ''
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [founderRes, startupsRes, pitchesRes, messagesRes, domainsRes] = await Promise.all([
        founderAPI.getById(id),
        founderAPI.getStartups(id),
        founderAPI.getPitches(id),
        founderAPI.getMessages(id),
        domainAPI.getAll()
      ]);
      setFounder(founderRes.data);
      setStartups(startupsRes.data);
      setPitches(pitchesRes.data);
      setMessages(messagesRes.data);
      setDomains(domainsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading founder data:', error);
      setLoading(false);
    }
  };

  const handleCreateStartup = async (e) => {
    e.preventDefault();
    try {
      await startupAPI.create({
        ...startupForm,
        FounderID: id
      });
      setShowStartupModal(false);
      setStartupForm({
        StartupName: '',
        Description: '',
        FundingGoal: '',
        Stage: 'Pre-seed',
        DomainID: ''
      });
      loadData();
    } catch (error) {
      alert('Error creating startup: ' + error.message);
    }
  };

  const handleUpdateStartup = async (e) => {
    e.preventDefault();
    try {
      await startupAPI.update(editingStartup.StartupID, startupForm);
      setShowStartupModal(false);
      setEditingStartup(null);
      setStartupForm({
        StartupName: '',
        Description: '',
        FundingGoal: '',
        Stage: 'Pre-seed',
        DomainID: ''
      });
      loadData();
    } catch (error) {
      alert('Error updating startup: ' + error.message);
    }
  };

  const handleDeleteStartup = async (startupId) => {
    if (window.confirm('Are you sure you want to delete this startup?')) {
      try {
        await startupAPI.delete(startupId);
        loadData();
      } catch (error) {
        alert('Error deleting startup: ' + error.message);
      }
    }
  };

  const openEditModal = (startup) => {
    setEditingStartup(startup);
    setStartupForm({
      StartupName: startup.StartupName,
      Description: startup.Description,
      FundingGoal: startup.FundingGoal,
      Stage: startup.Stage,
      DomainID: startup.DomainID
    });
    setShowStartupModal(true);
  };

  const createPitch = async (startupId, investorId) => {
    try {
      await pitchMatchAPI.create({
        StartupID: startupId,
        InvestorID: investorId,
        Notes: 'Pitch request from founder dashboard'
      });
      alert('Pitch created successfully!');
      loadData();
    } catch (error) {
      alert('Error creating pitch: ' + error.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!founder) {
    return <div className="error">Founder not found</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="navbar">
        <h1>🚀 Founder Dashboard</h1>
        <Link to="/">Home</Link>
        <Link to="/analytics">Analytics</Link>
      </div>

      <div className="container">
        <div className="card">
          <h2>Welcome, {founder.FullName}!</h2>
          <p><strong>Email:</strong> {founder.Email}</p>
          <p><strong>Bio:</strong> {founder.Bio || 'No bio provided'}</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>{startups.length}</h3>
            <p>Total Startups</p>
          </div>
          <div className="stat-card">
            <h3>{pitches.filter(p => p.Status === 'Pending').length}</h3>
            <p>Pending Pitches</p>
          </div>
          <div className="stat-card">
            <h3>{pitches.filter(p => p.Status === 'Accepted').length}</h3>
            <p>Accepted Pitches</p>
          </div>
          <div className="stat-card">
            <h3>{messages.length}</h3>
            <p>Messages</p>
          </div>
        </div>

        <div className="card">
          <h2>My Startups</h2>
          <button className="btn btn-primary" onClick={() => {
            setEditingStartup(null);
            setStartupForm({
              StartupName: '',
              Description: '',
              FundingGoal: '',
              Stage: 'Pre-seed',
              DomainID: ''
            });
            setShowStartupModal(true);
          }}>
            Add New Startup
          </button>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
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
                    <td>{startup.DomainName}</td>
                    <td>{startup.Stage}</td>
                    <td>${Number(startup.FundingGoal).toLocaleString()}</td>
                    <td>${Number(startup.CurrentFunding).toLocaleString()}</td>
                    <td>
                      {Math.round((startup.CurrentFunding / startup.FundingGoal) * 100)}%
                    </td>
                    <td>
                      <button className="btn btn-warning" onClick={() => openEditModal(startup)}>
                        Edit
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDeleteStartup(startup.StartupID)}>
                        Delete
                      </button>
                    </td>
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
                  <th>Investor</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {pitches.map(pitch => (
                  <tr key={pitch.PitchMatchID}>
                    <td>{pitch.StartupName}</td>
                    <td>{pitch.InvestorName}</td>
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
                      {message.SenderType === 'Founder' && message.SenderID === parseInt(id) 
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

      {showStartupModal && (
        <div className="modal-overlay" onClick={() => setShowStartupModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingStartup ? 'Edit Startup' : 'Create New Startup'}</h2>
            <form onSubmit={editingStartup ? handleUpdateStartup : handleCreateStartup}>
              <div className="form-group">
                <label>Startup Name</label>
                <input
                  type="text"
                  value={startupForm.StartupName}
                  onChange={(e) => setStartupForm({...startupForm, StartupName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={startupForm.Description}
                  onChange={(e) => setStartupForm({...startupForm, Description: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Domain</label>
                <select
                  value={startupForm.DomainID}
                  onChange={(e) => setStartupForm({...startupForm, DomainID: e.target.value})}
                  required
                >
                  <option value="">Select Domain</option>
                  {domains.map(domain => (
                    <option key={domain.DomainID} value={domain.DomainID}>
                      {domain.DomainName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Funding Goal</label>
                <input
                  type="number"
                  value={startupForm.FundingGoal}
                  onChange={(e) => setStartupForm({...startupForm, FundingGoal: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Stage</label>
                <select
                  value={startupForm.Stage}
                  onChange={(e) => setStartupForm({...startupForm, Stage: e.target.value})}
                  required
                >
                  <option value="Pre-seed">Pre-seed</option>
                  <option value="Seed">Seed</option>
                  <option value="Series A">Series A</option>
                  <option value="Series B">Series B</option>
                  <option value="Series C">Series C</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">
                {editingStartup ? 'Update Startup' : 'Create Startup'}
              </button>
              <button type="button" className="btn btn-danger" onClick={() => setShowStartupModal(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FounderDashboard;
