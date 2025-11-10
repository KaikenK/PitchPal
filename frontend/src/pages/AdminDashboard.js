import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI, investorAPI } from '../services/api';

function AdminDashboard() {
  const { id } = useParams();
  const [admin, setAdmin] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [allApprovals, setAllApprovals] = useState([]);
  const [unmoderatedMessages, setUnmoderatedMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('approvals');

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
        AdminID: id,
        InvestorID: investorId,
        ApprovalStatus: status,
        Notes: `${status} by admin`
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
        MessageID: messageId,
        AdminID: id,
        Action: action,
        Reason: `Message ${action.toLowerCase()} by admin`
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
        <Link to="/">Home</Link>
        <Link to="/analytics">Analytics</Link>
      </div>

      <div className="container">
        <div className="card">
          <h2>Welcome, {admin.FullName}!</h2>
          <p><strong>Email:</strong> {admin.Email}</p>
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
                        <tr key={approval.ApprovalID}>
                          <td>{approval.FullName}</td>
                          <td>{approval.Email}</td>
                          <td>${Number(approval.TotalInvestmentCapacity).toLocaleString()}</td>
                          <td>
                            <span className="status-badge status-pending">
                              {approval.ApprovalStatus}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-success"
                              onClick={() => handleApproval(approval.InvestorID, 'Approved')}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn btn-danger"
                              onClick={() => handleApproval(approval.InvestorID, 'Rejected')}
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
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allApprovals.map(approval => (
                      <tr key={approval.ApprovalID}>
                        <td>{approval.FullName}</td>
                        <td>{approval.AdminName}</td>
                        <td>
                          <span className={`status-badge status-${approval.ApprovalStatus.toLowerCase()}`}>
                            {approval.ApprovalStatus}
                          </span>
                        </td>
                        <td>{new Date(approval.ApprovalDate).toLocaleDateString()}</td>
                        <td>{approval.Notes}</td>
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
                        <tr key={message.MessageID}>
                          <td>{message.SenderName}</td>
                          <td>{message.ReceiverName}</td>
                          <td>{message.MessageContent}</td>
                          <td>{new Date(message.SentAt).toLocaleDateString()}</td>
                          <td>
                            <button 
                              className="btn btn-success"
                              onClick={() => handleModeration(message.MessageID, 'Approved')}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn btn-warning"
                              onClick={() => handleModeration(message.MessageID, 'Flagged')}
                            >
                              Flag
                            </button>
                            <button 
                              className="btn btn-danger"
                              onClick={() => handleModeration(message.MessageID, 'Deleted')}
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
                      <th>Moderated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allMessages.map(message => (
                      <tr key={message.MessageID}>
                        <td>{message.SenderName}</td>
                        <td>{message.ReceiverName}</td>
                        <td>{message.MessageContent}</td>
                        <td>{new Date(message.SentAt).toLocaleDateString()}</td>
                        <td>{message.IsModerated ? '✓' : '✗'}</td>
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
