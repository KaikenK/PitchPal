import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { adminAPI, investorAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [admin, setAdmin] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [allApprovals, setAllApprovals] = useState([]);
  const [unmoderatedMessages, setUnmoderatedMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('approvals');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [
        adminRes,
        pendingApprovalsRes,
        allApprovalsRes,
        unmoderatedRes,
        allMessagesRes
      ] = await Promise.all([
        adminAPI.getById(id),
        adminAPI.getPendingApprovals(),
        adminAPI.getAllApprovals(),
        adminAPI.getUnmoderatedMessages(),
        adminAPI.getAllMessages()
      ]);
      setAdmin(adminRes.data);
      setPendingApprovals(pendingApprovalsRes.data);
      setAllApprovals(allApprovalsRes.data);
      setUnmoderatedMessages(unmoderatedRes.data);
      setAllMessages(allMessagesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setLoading(false);
    }
  };

  const handleApproval = async (investorId, status) => {
    try {
      await adminAPI.createApproval({
        admin_id: id,
        investor_id: investorId,
        approval_status: status
      });
      alert(`Investor ${status.toLowerCase()} successfully!`);
      loadData();
    } catch (error) {
      alert('Error processing approval: ' + error.message);
    }
  };

  const handleModeration = async (messageId, action) => {
    try {
      await adminAPI.moderateMessage({
        m_id: messageId,
        admin_id: id,
        action: action
      });
      alert('Message moderated successfully!');
      loadData();
    } catch (error) {
      alert('Error moderating message: ' + error.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!admin) {
    return <div className="error">Admin not found</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="navbar">
        <h1>⚙️ Admin Dashboard</h1>
        <Link to="/analytics">Analytics</Link>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="container">
        <div className="card">
          <h2>Welcome, {admin.name}!</h2>
          <p><strong>Email:</strong> {admin.email}</p>
          <p><strong>Role:</strong> Administrator</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>{pendingApprovals.length}</h3>
            <p>Pending Approvals</p>
          </div>
          <div className="stat-card">
            <h3>{unmoderatedMessages.length}</h3>
            <p>Unmoderated Messages</p>
          </div>
          <div className="stat-card">
            <h3>{allApprovals.length}</h3>
            <p>Total Approvals</p>
          </div>
          <div className="stat-card">
            <h3>{allMessages.length}</h3>
            <p>Total Messages</p>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <button 
            className={`btn ${activeTab === 'approvals' ? 'btn-primary' : 'btn-warning'}`}
            onClick={() => setActiveTab('approvals')}
          >
            Investor Approvals
          </button>
          <button 
            className={`btn ${activeTab === 'messages' ? 'btn-primary' : 'btn-warning'}`}
            onClick={() => setActiveTab('messages')}
          >
            Message Moderation
          </button>
        </div>

        {activeTab === 'approvals' && (
          <>
            <div className="card">
              <h2>Pending Investor Approvals</h2>
              {pendingApprovals.length === 0 ? (
                <p>No pending approvals</p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Investor Name</th>
                        <th>Email</th>
                        <th>Investment Capacity</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingApprovals.map(approval => (
                        <tr key={approval.approval_id}>
                          <td>{approval.name}</td>
                          <td>{approval.email}</td>
                          <td>${Number(approval.funds || 0).toLocaleString()}</td>
                          <td>
                            <span className="status-badge status-pending">
                              {approval.approval_status}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-success"
                              onClick={() => handleApproval(approval.investor_id, 'Approved')}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn btn-danger"
                              onClick={() => handleApproval(approval.investor_id, 'Rejected')}
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card">
              <h2>All Approval History</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Investor</th>
                      <th>Admin</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allApprovals.map(approval => (
                      <tr key={approval.approval_id}>
                        <td>{approval.investor_name}</td>
                        <td>{approval.admin_name}</td>
                        <td>
                          <span className={`status-badge status-${approval.approval_status ? approval.approval_status.toLowerCase() : 'pending'}`}>
                            {approval.approval_status}
                          </span>
                        </td>
                        <td>{new Date(approval.approval_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'messages' && (
          <>
            <div className="card">
              <h2>Unmoderated Messages</h2>
              {unmoderatedMessages.length === 0 ? (
                <p>No unmoderated messages</p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>From</th>
                        <th>To</th>
                        <th>Message</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unmoderatedMessages.map(message => (
                        <tr key={message.m_id}>
                          <td>
                            {message.sender_type === 'Founder' 
                              ? message.founder_name 
                              : message.investor_name}
                          </td>
                          <td>
                            {message.sender_type === 'Founder' 
                              ? message.investor_name 
                              : message.founder_name}
                          </td>
                          <td>{message.content}</td>
                          <td>{new Date(message.timestamp).toLocaleDateString()}</td>
                          <td>
                            <button 
                              className="btn btn-success"
                              onClick={() => handleModeration(message.m_id, 'Approved')}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn btn-warning"
                              onClick={() => handleModeration(message.m_id, 'Flagged for review')}
                            >
                              Flag
                            </button>
                            <button 
                              className="btn btn-danger"
                              onClick={() => handleModeration(message.m_id, 'Deleted')}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card">
              <h2>All Messages</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>From</th>
                      <th>To</th>
                      <th>Message</th>
                      <th>Date</th>
                      <th>Moderation Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allMessages.map(message => (
                      <tr key={message.m_id}>
                        <td>
                          {message.sender_type === 'Founder' 
                            ? message.founder_name 
                            : message.investor_name}
                        </td>
                        <td>
                          {message.sender_type === 'Founder' 
                            ? message.investor_name 
                            : message.founder_name}
                        </td>
                        <td>{message.content}</td>
                        <td>{new Date(message.timestamp).toLocaleDateString()}</td>
                        <td>
                          {message.is_moderated ? (
                            <span className={`status-badge status-${message.moderation_action?.toLowerCase().replace(' ', '-') || 'moderated'}`}>
                              {message.moderation_action || 'Reviewed'}
                            </span>
                          ) : (
                            <span className="status-badge status-pending">Not Moderated</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
