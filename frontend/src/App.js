import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import pages
import Home from './pages/Home';
import FounderDashboard from './pages/FounderDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/founder/:id" element={<FounderDashboard />} />
          <Route path="/investor/:id" element={<InvestorDashboard />} />
          <Route path="/admin/:id" element={<AdminDashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
