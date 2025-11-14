import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { founderAPI, startupAPI, domainAPI, pitchMatchAPI, messageAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function FounderDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [founder, setFounder] = useState(null);
  const [startups, setStartups] = useState([]);
  const [pitches, setPitches] = useState([]);
  const [messages, setMessages] = useState([]);
  const [domains, setDomains] = useState([]);
  const [investorMatches, setInvestorMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStartupModal, setShowStartupModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [messageForm, setMessageForm] = useState({
    investor_id: '',
    investor_name: '',
    content: ''
  });
  const [editingStartup, setEditingStartup] = useState(null);
  const [startupForm, setStartupForm] = useState({
    name: '',
    description: '',
    stage: 'Seed',
    domain_id: ''
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [founderRes, startupsRes, pitchesRes, messagesRes, domainsRes, matchesRes] = await Promise.all([
        founderAPI.getById(id),
        founderAPI.getStartups(id),
        founderAPI.getPitches(id),
        founderAPI.getMessages(id),
        domainAPI.getAll(),
        founderAPI.getMatches(id)
      ]);
      setFounder(founderRes.data);
      setStartups(startupsRes.data);
      setPitches(pitchesRes.data);
      setMessages(messagesRes.data);
      setDomains(domainsRes.data);
      setInvestorMatches(matchesRes.data);
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
        founder_id: id
      });
      setShowStartupModal(false);
      setStartupForm({
        name: '',
        description: '',
        stage: 'Seed',
        domain_id: ''
      });
      loadData();
    } catch (error) {
      alert('Error creating startup: ' + error.message);
    }
  };

  const handleUpdateStartup = async (e) => {
    e.preventDefault();
    try {
      await startupAPI.update(editingStartup.startup_id, startupForm);
      setShowStartupModal(false);
      setEditingStartup(null);
      setStartupForm({
        name: '',
        description: '',
        stage: 'Seed',
        domain_id: ''
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
      name: startup.name,
      description: startup.description,
      stage: startup.stage,
      domain_id: startup.domain_id
    });
    setShowStartupModal(true);
  };

  const createPitch = async (founderId, investorId) => {
    try {
      await pitchMatchAPI.create({
        founder_id: founderId,
        investor_id: investorId
      });
      alert('Pitch created successfully!');
      loadData();
    } catch (error) {
      alert('Error creating pitch: ' + error.message);
    }
  };

  const openMessageModal = (investorId, investorName) => {
    setMessageForm({
      investor_id: investorId,
      investor_name: investorName,
      content: ''
    });
    setShowMessageModal(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      await messageAPI.create({
        founder_id: parseInt(id),
        investor_id: messageForm.investor_id,
        content: messageForm.content,
        sender_type: 'FOUNDER'
      });
      alert('Message sent successfully!');
      setShowMessageModal(false);
      setMessageForm({ investor_id: '', investor_name: '', content: '' });
      loadData();
    } catch (error) {
      alert('Error sending message: ' + error.message);
    }
  };

  const handleCreatePitch = async (investorId) => {
    try {
      await pitchMatchAPI.create({
        founder_id: parseInt(id),
        investor_id: investorId
      });
      alert('Pitch sent successfully!');
      setShowPitchModal(false);
      loadData();
    } catch (error) {
      alert('Error creating pitch: ' + error.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
        <button onClick={handleLogout} className="btn btn-danger">Logout</button>
      </div>

      <div className="container">
        <div className="card">
          <h2>Welcome, {founder.name}!</h2>
          <p><strong>Email:</strong> {founder.email}</p>
          <p><strong>Bio:</strong> {founder.bio || 'No bio provided'}</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>{startups.length}</h3>
            <p>Total Startups</p>
          </div>
          <div className="stat-card">
            <h3>{pitches.filter(p => p.status === 'Pending').length}</h3>
            <p>Pending Pitches</p>
          </div>
          <div className="stat-card">
            <h3>{pitches.filter(p => p.status === 'Accepted').length}</h3>
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
              name: '',
              description: '',
              stage: 'Seed',
              domain_id: ''
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
                  <th>Funding</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {startups.map(startup => (
                  <tr key={startup.startup_id}>
                    <td>{startup.name}</td>
                    <td>{startup.d_name}</td>
                    <td>{startup.stage}</td>
                    <td>${Number(startup.funding || 0).toLocaleString()}</td>
                    <td>
                      <button className="btn btn-warning" onClick={() => openEditModal(startup)}>
                        Edit
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDeleteStartup(startup.startup_id)}>
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
          <button 
            onClick={() => setShowPitchModal(true)} 
            className="btn btn-primary"
            style={{marginBottom: '15px'}}
          >
            + Find Investors to Pitch
          </button>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Investor</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {pitches.map(pitch => (
                  <tr key={pitch.pitch_match_id}>
                    <td>{pitch.investor_name}</td>
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
                      {message.sender_type === 'Founder' && message.founder_id === parseInt(id) 
                        ? `To: Investor`
                        : `From: Investor`
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

      {showStartupModal && (
        <div className="modal-overlay" onClick={() => setShowStartupModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingStartup ? 'Edit Startup' : 'Create New Startup'}</h2>
            <form onSubmit={editingStartup ? handleUpdateStartup : handleCreateStartup}>
              <div className="form-group">
                <label>Startup Name</label>
                <input
                  type="text"
                  value={startupForm.name}
                  onChange={(e) => setStartupForm({...startupForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={startupForm.description}
                  onChange={(e) => setStartupForm({...startupForm, description: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Domain</label>
                <select
                  value={startupForm.domain_id}
                  onChange={(e) => setStartupForm({...startupForm, domain_id: e.target.value})}
                  required
                >
                  <option value="">Select Domain</option>
                  {domains.map(domain => (
                    <option key={domain.domain_id} value={domain.domain_id}>
                      {domain.d_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Stage</label>
                <select
                  value={startupForm.stage}
                  onChange={(e) => setStartupForm({...startupForm, stage: e.target.value})}
                  required
                >
                  <option value="Seed">Seed</option>
                  <option value="Series A">Series A</option>
                  <option value="Series B">Series B</option>
                  <option value="Series C">Series C</option>
                  <option value="Growth">Growth</option>
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

      {showMessageModal && (
        <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>📧 Send Message to Investor</h2>
            <form onSubmit={handleSendMessage}>
              <div className="form-group">
                <label>Select Investor</label>
                <select
                  value={messageForm.investor_id}
                  onChange={(e) => {
                    const selectedInvestor = pitches.find(p => p.investor_id === parseInt(e.target.value));
                    setMessageForm({
                      ...messageForm, 
                      investor_id: parseInt(e.target.value),
                      investor_name: selectedInvestor?.investor_name || ''
                    });
                  }}
                  required
                >
                  <option value="">Choose an investor...</option>
                  {pitches.filter(p => p.status === 'Accepted').map(pitch => (
                    <option key={pitch.investor_id} value={pitch.investor_id}>
                      {pitch.investor_name}
                    </option>
                  ))}
                </select>
                <small style={{color: '#666', fontSize: '12px', marginTop: '5px', display: 'block'}}>
                  You can only message investors with accepted pitches
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

      {showPitchModal && (
        <div className="modal-overlay" onClick={() => setShowPitchModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>🎯 Find Investors to Pitch</h2>
            {investorMatches.length === 0 ? (
              <div>
                <p>No matching investors found.</p>
                <p style={{color: '#666', fontSize: '14px', marginTop: '10px'}}>
                  Matching investors must:
                  <ul style={{textAlign: 'left', marginTop: '10px'}}>
                    <li>Be approved by an admin</li>
                    <li>Have interest in your startup's domain</li>
                    <li>Not have received a pitch from you yet</li>
                  </ul>
                </p>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => setShowPitchModal(false)}
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                <p style={{marginBottom: '20px'}}>
                  Found {investorMatches.length} matching investor(s) based on your startup domains
                </p>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Investor Name</th>
                        <th>Matching Domain</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investorMatches.map(investor => (
                        <tr key={investor.investor_id}>
                          <td>{investor.name}</td>
                          <td>{investor.matching_domain}</td>
                          <td>
                            <button 
                              className="btn btn-success"
                              onClick={() => handleCreatePitch(investor.investor_id)}
                            >
                              Send Pitch
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => setShowPitchModal(false)}
                  style={{marginTop: '15px'}}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FounderDashboard;
