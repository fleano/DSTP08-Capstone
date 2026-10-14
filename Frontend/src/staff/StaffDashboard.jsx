// src/staff/StaffDashboard.jsx
import React, { useState } from 'react';
import '../App.css';

export default function StaffDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' or 'schedule'

  // Helper to convert numeric role into a display string
  const getRoleDisplay = (role) => {
    const r = Number(role);
    if (r === 0) return 'ADMIN';
    if (r === 1) return 'MANAGER';
    if (r === 2) return 'STAFF';
    return 'STAFF';
  };

  const isManagerOrAdmin = Number(user.role) === 0 || Number(user.role) === 1;

  return (
    <div className="homepage-wrapper">
      {/* Staff Top Navigation */}
      <nav className="navbar">
        <div className="nav-brand">
          <span className="brand-icon">🛡️</span> Staff Portal ({getRoleDisplay(user.role)})
        </div>
        <div className="nav-links">
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
            style={{ background: 'none', border: 'none', color: '#ebd9bd', cursor: 'pointer' }}
          >
            Order Analytics
          </button>
          <button 
            className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
            style={{ background: 'none', border: 'none', color: '#ebd9bd', cursor: 'pointer' }}
          >
            Calendar & Scheduling
          </button>
          
          <button className="nav-login-btn" onClick={onLogout} style={{ backgroundColor: '#a93226' }}>
            Logout ({user.name})
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div style={{ padding: '3rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        {activeTab === 'analytics' && (
          <div>
            <h2 style={{ color: '#f7d070', marginBottom: '1.5rem' }}>Live Order Analytics</h2>
            <div className="contact-container">
              <p>📊 Graphs and real-time statistics of incoming customer food orders will show here.</p>
              <ul>
                <li>Total Orders Today: 42</li>
                <li>Pending Kitchen Orders: 5</li>
                <li>Top Selling Dish: Peking Roasted Duck</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div>
            <h2 style={{ color: '#f7d070', marginBottom: '1.5rem' }}>Staff Calendar & Shift Schedule</h2>
            <div className="contact-container">
              <p>📅 View your upcoming shifts. {user.role === 'manager' && '(Manager mode: You can assign or edit shifts here)'}</p>
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#3d2222', borderRadius: '6px' }}>
                <h4>This Week's Shifts</h4>
                <p>Monday - Friday: 10:00 AM - 4:00 PM (Server Shift)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}