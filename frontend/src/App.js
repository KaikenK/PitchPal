import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import FounderDashboard from './pages/FounderDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Home - Only accessible when logged in */}
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />
            
            {/* Founder Dashboard - Only accessible by the specific founder */}
            <Route 
              path="/founder/:id" 
              element={
                <ProtectedRoute allowedRoles={['founder']} requireSameUser={true}>
                  <FounderDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Investor Dashboard - Only accessible by the specific investor */}
            <Route 
              path="/investor/:id" 
              element={
                <ProtectedRoute allowedRoles={['investor']} requireSameUser={true}>
                  <InvestorDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Dashboard - Only accessible by admins */}
            <Route 
              path="/admin/:id" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Analytics - Only accessible by admins */}
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
