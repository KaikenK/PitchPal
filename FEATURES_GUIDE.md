# PitchPal Features Guide

## 📋 Table of Contents
1. [Database Functions, Procedures & Triggers](#database-functions-procedures--triggers)
2. [Messaging System](#messaging-system)
3. [Account Creation](#account-creation)

---

## 🔧 Database Functions, Procedures & Triggers

### **FUNCTIONS**

#### 1. `fn_CheckInvestorApprovalStatus(investor_id)`
- **Purpose**: Check if an investor is approved by admin
- **Returns**: `'Approved'` or `'Pending Approval'`
- **Location**: `database/pitchpal.sql` (Lines 178-195)
- **Used In**: `backend/routes/investor.js` (Line 105)
  ```javascript
  // GET /api/investors/:id/approval-status
  router.get('/:id/approval-status', async (req, res) => {
    const [result] = await db.query(
      'SELECT fn_CheckInvestorApprovalStatus(?) AS approval_status',
      [req.params.id]
    );
    res.json(result[0]);
  });
  ```

#### 2. `fn_GetFounderStartupCount(founder_id)`
- **Purpose**: Count how many startups a founder has
- **Returns**: Integer count
- **Location**: `database/pitchpal.sql` (Lines 197-210)
- **Used In**: `backend/routes/founder.js` (Line 53)
  ```javascript
  // GET /api/founders/:id/startup-count
  router.get('/:id/startup-count', async (req, res) => {
    const [result] = await db.query(
      'SELECT fn_GetFounderStartupCount(?) AS startupCount',
      [req.params.id]
    );
    res.json(result[0]);
  });
  ```

---

### **STORED PROCEDURES**

#### 1. `sp_CreatePitch(founder_id, investor_id)`
- **Purpose**: Create a new pitch match between founder and investor
- **Prevents**: Duplicate pitches (raises error if already exists)
- **Location**: `database/pitchpal.sql` (Lines 220-240)
- **Used In**: `backend/routes/pitchmatch.js` (Line 46)
  ```javascript
  // POST /api/pitchmatches
  router.post('/', async (req, res) => {
    const { founder_id, investor_id } = req.body;
    const [result] = await db.query(
      'CALL sp_CreatePitch(?, ?)',
      [founder_id, investor_id]
    );
    res.json({ message: 'Pitch created successfully' });
  });
  ```

#### 2. `sp_GetInvestorMatches(founder_id)`
- **Purpose**: Find investors matching founder's startup domains
- **Returns**: List of investors who:
  - Are interested in the founder's startup domains
  - Haven't been pitched yet by this founder
- **Location**: `database/pitchpal.sql` (Lines 242-265)
- **Used In**: `backend/routes/founder.js` (Line 66)
  ```javascript
  // GET /api/founders/:id/matches
  router.get('/:id/matches', async (req, res) => {
    const [results] = await db.query(
      'CALL sp_GetInvestorMatches(?)',
      [req.params.id]
    );
    res.json(results[0]);
  });
  ```

---

### **TRIGGERS**

#### 1. `trg_AfterInsertFundingRound`
- **Purpose**: Automatically update startup's total funding when new funding round is added
- **Fires**: AFTER INSERT on FundingRound table
- **Location**: `database/pitchpal.sql` (Lines 279-286)
- **Automatic Behavior**: No explicit backend call needed
  ```javascript
  // When this happens in backend/routes/funding.js:
  await db.query(
    'INSERT INTO FundingRound (startup_id, investor_id, amount, date) VALUES (?, ?, ?, ?)',
    [startup_id, investor_id, amount, date]
  );
  // The trigger AUTOMATICALLY updates Startup.funding
  ```

#### 2. `trg_BeforeInsertFundingRound_CheckRange`
- **Purpose**: Validate investment amount is within investor's min/max range
- **Fires**: BEFORE INSERT on FundingRound table
- **Prevents**: Invalid investments (raises error if amount is out of range)
- **Location**: `database/pitchpal.sql` (Lines 288-307)
- **Automatic Behavior**: No explicit backend call needed
  ```javascript
  // When this happens in backend/routes/funding.js:
  await db.query(
    'INSERT INTO FundingRound (startup_id, investor_id, amount, date) VALUES (?, ?, ?, ?)',
    [startup_id, investor_id, amount, date]
  );
  // The trigger AUTOMATICALLY validates before insert
  // If validation fails, an error is thrown
  ```

---

## 💬 Messaging System

### **Current Status**: ✅ FULLY FUNCTIONAL

Your messaging system is already built and working! Here's how to use it:

### **Database Table Structure**
```sql
Message (
  m_id,           -- Primary key
  founder_id,     -- Foreign key to Founder
  investor_id,    -- Foreign key to Investor
  content,        -- Message text
  sender_type,    -- ENUM: 'FOUNDER' or 'INVESTOR'
  timestamp       -- Auto-generated timestamp
)
```

### **Backend API Endpoints**

Located in: `backend/routes/message.js`

#### 1. **Send Message** (Already exists)
```javascript
POST /api/messages
Body: {
  founder_id: 1,
  investor_id: 2,
  content: "Hello! I'd like to discuss...",
  sender_type: "FOUNDER"  // or "INVESTOR"
}
```

#### 2. **Get All Messages** (Already exists)
```javascript
GET /api/messages
// Returns all messages with founder and investor names
```

#### 3. **Get Founder's Messages** (Already exists)
```javascript
GET /api/founders/:id/messages
// Returns all messages for a specific founder
```

#### 4. **Get Investor's Messages** (Already exists)
```javascript
GET /api/investors/:id/messages
// Returns all messages for a specific investor
```

### **Frontend Implementation**

#### **Founder Dashboard** (`frontend/src/pages/FounderDashboard.js`)
- **Current**: Displays received messages in a table (Lines 246-271)
- **Shows**: Sender name, message content, timestamp, moderation status

#### **Investor Dashboard** (`frontend/src/pages/InvestorDashboard.js`)
- **Current**: Displays received messages in a table
- **Shows**: Sender name, message content, timestamp, moderation status

### **What's Missing: Sending Messages**

You can VIEW messages but you need UI to SEND messages. Here's what to add:

#### **Option A: Add Message Form to Dashboards**
Add a "Send Message" button next to each investor/founder, which opens a modal:

```javascript
// Add to FounderDashboard.js
const [showMessageModal, setShowMessageModal] = useState(false);
const [messageForm, setMessageForm] = useState({ investor_id: null, content: '' });

const sendMessage = async () => {
  try {
    await messageAPI.create({
      founder_id: id,
      investor_id: messageForm.investor_id,
      content: messageForm.content,
      sender_type: 'FOUNDER'
    });
    alert('Message sent!');
    setShowMessageModal(false);
    loadData();
  } catch (error) {
    alert('Error sending message: ' + error.message);
  }
};
```

#### **Option B: Create Dedicated Messaging Page**
Create a new chat-like interface for real-time conversations.

---

## 👤 Account Creation

### **Current Status**: ✅ FULLY FUNCTIONAL

Account creation endpoints already exist!

### **Backend API Endpoints**

#### 1. **Create Founder Account**
Located in: `backend/routes/founder.js` (Lines 109-125)

```javascript
POST /api/founders
Body: {
  name: "John Doe",
  email: "john@startup.com",
  password: "securePassword123"
}
Response: {
  founder_id: 8,
  message: "Founder created successfully"
}
```

**Current Code:**
```javascript
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Founder (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    res.status(201).json({ 
      founder_id: result.insertId,
      message: 'Founder created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 2. **Create Investor Account**
Located in: `backend/routes/investor.js` (Lines 137-189)

```javascript
POST /api/investors
Body: {
  name: "Jane Smith",
  email: "jane@invest.com",
  password: "securePassword456",
  funds: 50000000.00,
  min_investment: 100000.00,
  max_investment: 5000000.00,
  domain_ids: [1, 4]  // Optional: FinTech, SaaS
}
Response: {
  investor_id: 7,
  message: "Investor created successfully"
}
```

**Current Code:**
```javascript
router.post('/', async (req, res) => {
  const { name, email, password, funds, min_investment, max_investment, domain_ids } = req.body;
  try {
    // Insert investor
    const [result] = await db.query(
      'INSERT INTO Investor (name, email, password, funds, min_investment, max_investment) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, funds, min_investment, max_investment]
    );
    
    const investorId = result.insertId;
    
    // Insert domain preferences
    if (domain_ids && domain_ids.length > 0) {
      for (const domain_id of domain_ids) {
        await db.query(
          'INSERT INTO InvestorDomain (investor_id, domain_id) VALUES (?, ?)',
          [investorId, domain_id]
        );
      }
    }
    
    res.status(201).json({ 
      investor_id: investorId,
      message: 'Investor created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### **What's Missing: Registration UI**

You need to create a registration page in the frontend!

#### **Step 1: Create Registration Page**

Create `frontend/src/pages/Register.js`:

```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { founderAPI, investorAPI, domainAPI } from '../services/api';
import './Login.css'; // Reuse login styles

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
        const res = await founderAPI.create({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        alert('Founder account created successfully!');
        navigate('/login');
      } else {
        const res = await investorAPI.create({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          funds: parseFloat(formData.funds),
          min_investment: parseFloat(formData.min_investment),
          max_investment: parseFloat(formData.max_investment),
          domain_ids: formData.domain_ids
        });
        alert('Investor account created successfully! Please wait for admin approval.');
        navigate('/login');
      }
    } catch (error) {
      alert('Registration failed: ' + error.message);
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
        
        <div className="user-type-selector">
          <button 
            className={userType === 'founder' ? 'active' : ''} 
            onClick={() => setUserType('founder')}
          >
            👨‍💼 Founder
          </button>
          <button 
            className={userType === 'investor' ? 'active' : ''} 
            onClick={() => setUserType('investor')}
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
          />
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          
          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            required
          />

          {userType === 'investor' && (
            <>
              <input
                type="number"
                placeholder="Available Funds ($)"
                value={formData.funds}
                onChange={(e) => setFormData({...formData, funds: e.target.value})}
                required
              />
              
              <input
                type="number"
                placeholder="Minimum Investment ($)"
                value={formData.min_investment}
                onChange={(e) => setFormData({...formData, min_investment: e.target.value})}
                required
              />
              
              <input
                type="number"
                placeholder="Maximum Investment ($)"
                value={formData.max_investment}
                onChange={(e) => setFormData({...formData, max_investment: e.target.value})}
                required
              />

              <div className="domain-selection">
                <label>Select Domains of Interest:</label>
                <div className="domain-checkboxes">
                  {domains.map(domain => (
                    <label key={domain.domain_id}>
                      <input
                        type="checkbox"
                        checked={formData.domain_ids.includes(domain.domain_id)}
                        onChange={() => handleDomainToggle(domain.domain_id)}
                      />
                      {domain.d_name}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn-primary">Create Account</button>
        </form>

        <p className="register-link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
```

#### **Step 2: Add Route to App.js**

```javascript
import Register from './pages/Register';

// Add this route
<Route path="/register" element={<Register />} />
```

#### **Step 3: Update Login Page**

Add a "Create Account" link at the bottom of `Login.js`:

```javascript
<p className="register-link">
  Don't have an account? <a href="/register">Create one here</a>
</p>
```

---

## 🎯 Summary

### ✅ **What Already Works**
1. **Functions & Procedures**: All implemented and used in backend
2. **Triggers**: Automatically fire on FundingRound operations
3. **Messaging Backend**: Full CRUD operations available
4. **Account Creation Backend**: POST endpoints for founders and investors
5. **Message Viewing**: Dashboards show received messages

### 🔨 **What Needs To Be Added**
1. **Message Sending UI**: Add forms/modals to send messages
2. **Registration Page**: Create UI for account creation
3. **Registration Route**: Add `/register` to App.js

---

## 📝 Quick Start Guide

### To Enable Message Sending:
1. Add message form to FounderDashboard.js
2. Add message form to InvestorDashboard.js
3. Use existing `messageAPI.create()` in `services/api.js`

### To Enable Registration:
1. Create `frontend/src/pages/Register.js` (code provided above)
2. Add route to `App.js`: `<Route path="/register" element={<Register />} />`
3. Add link to Login page: "Don't have an account? Create one here"

### To Test Database Functions/Procedures:
```javascript
// In backend, these endpoints are already working:
GET  /api/founders/:id/startup-count    // Uses fn_GetFounderStartupCount
GET  /api/founders/:id/matches          // Uses sp_GetInvestorMatches
POST /api/pitchmatches                  // Uses sp_CreatePitch
GET  /api/investors/:id/approval-status // Uses fn_CheckInvestorApprovalStatus
```

All the heavy lifting is done - you just need to add the UI components! 🚀
