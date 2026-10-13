import React, { useState } from 'react';
import './App.css';
import Homepage from './homepage.jsx'; // Customer view
import StaffDashboard from './staff/StaffDashboard.jsx'; // Server & Manager view

export default function App() {
  const [currentView, setCurrentView] = useState('customer'); // 'login', 'customer', 'staff'
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

const handleLoginSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (!email || !password) {
    setError('Please fill in all fields.');
    return;
  }

  try {
    // Attempt to connect to your backend login API
    // This is assuming the backend stores the data at the route "/api/login"
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: !isLogin ? name : undefined }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || 'Login failed.');
      return;
    }

    // Successful login here
    const loggedInUser = {
      email: data.email,
      name: data.name,
      role: data.role, // 'customer', 'server', or 'manager'
    };

    setUser(loggedInUser);
    setCurrentView(loggedInUser.role === 'customer' ? 'customer' : 'staff');

  } catch (err) {
    console.warn('Backend connection failed. Falling back to Guest/Staff mode:', err);
    
    // Check if the email indicates a manager or staff member
    // if the email includes "manager", it will be a staff account
    const isStaffEmail = email.toLowerCase().includes('manager') || email.toLowerCase().includes('staff');

    const fallbackUser = {
      email: email || 'guest@restaurant.com',
      name: name || email.split('@')[0] || 'User',
      role: isStaffEmail ? 'manager' : 'customer',
    };

    setUser(fallbackUser);
    setCurrentView(fallbackUser.role === 'customer' ? 'customer' : 'staff');
  }
};

  // 1. If viewing Customer Homepage
  if (currentView === 'customer') {
    return (
      <Homepage
        user={user}
        onNavigateToLogin={() => setCurrentView('login')}
        onLogout={() => { setUser(null); setCurrentView('customer'); }}
      />
    );
  }

  // 2. If viewing Staff / Manager Dashboard
  if (currentView === 'staff') {
    return (
      <StaffDashboard
        user={user}
        onLogout={() => { setUser(null); setCurrentView('login'); }}
      />
    );
  }

  // 3. Default: Login / Register View
  return (
    <div className="restaurant-auth-container">
      <div className="auth-card">
        <button 
          className="back-to-home-btn"
          onClick={() => setCurrentView('customer')}
        >
          ← Continue as Guest / Customer Home
        </button>

        <div className="auth-header">
          <div className="auth-logo-icon">🍜</div>
          <h1 className="auth-title">Restaurant Portal</h1>
          <div className="auth-subtitle">Customer & Staff Sign In</div>
        </div>

        <div className="tab-container">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`tab-btn ${isLogin ? 'active' : ''}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`tab-btn ${!isLogin ? 'active' : ''}`}
          >
            Create Account
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLoginSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Xiao Ming"
                  className="form-input"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address (Test for staff: use 'manager@rest.com' for staff view)</label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@restaurant.com"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" style={{ marginTop: isLogin ? '0' : '1.5rem' }}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}