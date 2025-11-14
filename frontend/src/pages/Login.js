import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { founderAPI, investorAPI, adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
  const [userType, setUserType] = useState('founder');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let users = [];
      
      // Get all users of the selected type
      if (userType === 'founder') {
        const response = await founderAPI.getAll();
        users = response.data;
      } else if (userType === 'investor') {
        const response = await investorAPI.getAll();
        users = response.data;
      } else if (userType === 'admin') {
        const response = await adminAPI.getAll();
        users = response.data;
      }

      // Find user by email and verify password (name)
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      console.log('Login attempt:', { userType, email, password, foundUser: !!user });
      if (user) {
        console.log('User data:', { 
          name: user.name, 
          email: user.email, 
          hasPassword: !!user.password,
          password: user.password 
        });
      }
      
      if (!user) {
        setError(`No ${userType} found with email: ${email}. Please check the email and user type.`);
        setLoading(false);
        return;
      }

      // Check if password matches the stored password
      // For founder and investor: check password column
      // For admin: use name as password (no password column in Admin table)
      if (userType === 'founder' || userType === 'investor') {
        console.log('Checking password:', { entered: password, stored: user.password, match: user.password === password });
        if (user.password !== password) {
          setError('Invalid email or password');
          setLoading(false);
          return;
        }
      } else if (userType === 'admin') {
        // Admin uses name as password (case-insensitive)
        console.log('Checking admin name:', { 
          entered: password.toLowerCase(), 
          stored: user.name.toLowerCase(), 
          match: user.name.toLowerCase() === password.toLowerCase() 
        });
        if (user.name.toLowerCase() !== password.toLowerCase()) {
          setError('Invalid email or password');
          setLoading(false);
          return;
        }
      }

      // Create user session object
      const userSession = {
        id: user.founder_id || user.investor_id || user.admin_id,
        name: user.name,
        email: user.email,
        role: userType
      };

      // Login successful - save to context
      login(userSession);

      // Redirect to dashboard
      if (userType === 'founder') {
        navigate(`/founder/${user.founder_id}`);
      } else if (userType === 'investor') {
        navigate(`/investor/${user.investor_id}`);
      } else if (userType === 'admin') {
        navigate(`/admin/${user.admin_id}`);
      }
      
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🚀 PitchPal Login</h1>
        <p className="login-subtitle">Connect founders with investors</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Login As</label>
            <select 
              value={userType} 
              onChange={(e) => setUserType(e.target.value)}
              className="form-control"
            >
              <option value="founder">Founder</option>
              <option value="investor">Investor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>Password (Your Name)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your name"
              className="form-control"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{textAlign: 'center', marginTop: '20px', marginBottom: '20px', color: '#666'}}>
          Don't have an account?{' '}
          <a 
            href="/register" 
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Create one here
          </a>
        </p>

        <div className="demo-credentials">
          <p><strong>Demo Credentials:</strong></p>
          <div className="demo-section">
            <strong>Founder:</strong>
            <p>Email: arjun@startup.com | Password: hash_arjun123</p>
          </div>
          <div className="demo-section">
            <strong>Investor:</strong>
            <p>Email: anilvc@invest.com | Password: hash_anilvc</p>
          </div>
          <div className="demo-section">
            <strong>Admin:</strong>
            <p>Email: admin@pitchpal.com | Password: Super Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
