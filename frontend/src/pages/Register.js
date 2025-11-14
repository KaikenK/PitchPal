import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { founderAPI, investorAPI, domainAPI } from '../services/api';
import './Login.css';

function Register() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('founder');
  const [domains, setDomains] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Investor-specific fields
    funds: '',
    min_investment: '',
    max_investment: '',
    domain_ids: []
  });

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      const res = await domainAPI.getAll();
      setDomains(res.data);
    } catch (error) {
      console.error('Error loading domains:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      if (userType === 'founder') {
        await founderAPI.create({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        alert('✅ Founder account created successfully! Please login.');
        navigate('/login');
      } else {
        await investorAPI.create({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          funds: parseFloat(formData.funds),
          min_investment: parseFloat(formData.min_investment),
          max_investment: parseFloat(formData.max_investment),
          domain_ids: formData.domain_ids
        });
        alert('✅ Investor account created successfully! Please wait for admin approval before logging in.');
        navigate('/login');
      }
    } catch (error) {
      alert('❌ Registration failed: ' + error.message);
    }
  };

  const handleDomainToggle = (domainId) => {
    setFormData(prev => ({
      ...prev,
      domain_ids: prev.domain_ids.includes(domainId)
        ? prev.domain_ids.filter(id => id !== domainId)
        : [...prev.domain_ids, domainId]
    }));
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🚀 Create Account</h1>
        <p style={{textAlign: 'center', marginBottom: '20px', color: '#666'}}>
          Join PitchPal and start your journey
        </p>
        
        <div className="user-type-selector" style={{marginBottom: '20px'}}>
          <button 
            type="button"
            className={userType === 'founder' ? 'active' : ''} 
            onClick={() => setUserType('founder')}
            style={{
              flex: 1,
              padding: '10px',
              border: userType === 'founder' ? '2px solid #667eea' : '2px solid #ddd',
              background: userType === 'founder' ? '#667eea' : 'white',
              color: userType === 'founder' ? 'white' : '#333',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginRight: '10px'
            }}
          >
            👨‍💼 Founder
          </button>
          <button 
            type="button"
            className={userType === 'investor' ? 'active' : ''} 
            onClick={() => setUserType('investor')}
            style={{
              flex: 1,
              padding: '10px',
              border: userType === 'investor' ? '2px solid #667eea' : '2px solid #ddd',
              background: userType === 'investor' ? '#667eea' : 'white',
              color: userType === 'investor' ? 'white' : '#333',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            💰 Investor
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            style={{marginBottom: '15px'}}
          />
          
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            style={{marginBottom: '15px'}}
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            minLength="6"
            style={{marginBottom: '15px'}}
          />
          
          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            required
            minLength="6"
            style={{marginBottom: '15px'}}
          />

          {userType === 'investor' && (
            <>
              <input
                type="number"
                placeholder="Available Funds ($)"
                value={formData.funds}
                onChange={(e) => setFormData({...formData, funds: e.target.value})}
                required
                min="0"
                step="0.01"
                style={{marginBottom: '15px'}}
              />
              
              <input
                type="number"
                placeholder="Minimum Investment ($)"
                value={formData.min_investment}
                onChange={(e) => setFormData({...formData, min_investment: e.target.value})}
                required
                min="0"
                step="0.01"
                style={{marginBottom: '15px'}}
              />
              
              <input
                type="number"
                placeholder="Maximum Investment ($)"
                value={formData.max_investment}
                onChange={(e) => setFormData({...formData, max_investment: e.target.value})}
                required
                min="0"
                step="0.01"
                style={{marginBottom: '15px'}}
              />

              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#333'}}>
                  Select Domains of Interest:
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  background: '#f9f9f9'
                }}>
                  {domains.map(domain => (
                    <label key={domain.domain_id} style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                      <input
                        type="checkbox"
                        checked={formData.domain_ids.includes(domain.domain_id)}
                        onChange={() => handleDomainToggle(domain.domain_id)}
                        style={{marginRight: '8px', cursor: 'pointer'}}
                      />
                      <span style={{fontSize: '14px'}}>{domain.d_name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Create Account
          </button>
        </form>

        <p style={{textAlign: 'center', marginTop: '20px', color: '#666'}}>
          Already have an account?{' '}
          <a 
            href="/login" 
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;
