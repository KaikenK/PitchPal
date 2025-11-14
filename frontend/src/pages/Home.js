import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { founderAPI, investorAPI, adminAPI } from '../services/api';

function Home() {
  const [founders, setFounders] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [foundersRes, investorsRes, adminsRes] = await Promise.all([
        founderAPI.getAll(),
        investorAPI.getAll(),
        adminAPI.getAll()
      ]);
      setFounders(foundersRes.data);
      setInvestors(investorsRes.data);
      setAdmins(adminsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-container">
      <h1>Welcome to PitchPal</h1>
      <p>Your complete database management platform for startup funding</p>

      <div className="role-grid">
        <div className="role-card">
          <h2>👨‍💼 Founders</h2>
          <p>Manage startups, view matches, and create pitches</p>
          <div style={{ marginTop: '1rem' }}>
            {founders.slice(0, 5).map(founder => (
              <Link 
                key={founder.founder_id} 
                to={`/founder/${founder.founder_id}`}
                style={{ display: 'block', margin: '0.5rem 0' }}
              >
                {founder.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="role-card">
          <h2>💼 Investors</h2>
          <p>View startups, manage investments, and track funding</p>
          <div style={{ marginTop: '1rem' }}>
            {investors.slice(0, 5).map(investor => (
              <Link 
                key={investor.investor_id} 
                to={`/investor/${investor.investor_id}`}
                style={{ display: 'block', margin: '0.5rem 0' }}
              >
                {investor.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="role-card">
          <h2>⚙️ Admins</h2>
          <p>Approve investors, moderate messages, and manage platform</p>
          <div style={{ marginTop: '1rem' }}>
            {admins.slice(0, 5).map(admin => (
              <Link 
                key={admin.admin_id} 
                to={`/admin/${admin.admin_id}`}
                style={{ display: 'block', margin: '0.5rem 0' }}
              >
                {admin.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <Link to="/analytics" className="btn btn-primary">
          View Analytics Dashboard
        </Link>
      </div>
    </div>
  );
}

export default Home;
