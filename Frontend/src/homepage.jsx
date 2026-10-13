// src/homepage.jsx
import React from 'react';
import './App.css'; // You can share the same CSS or create a new homepage.css

export default function Homepage({ onLogout }) {
  return (
    <div className="restaurant-auth-container" style={{ alignItems: 'flex-start', paddingTop: '3rem' }}>
      <div className="auth-card" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="auth-header">
          <div className="auth-logo-icon">🍜</div>
          <h1 className="auth-title">Welcome to Chinese Restaurant</h1>
          <div className="auth-subtitle">Explore our succulent Chinese meal experience</div>
        </div>

        <div style={{ margin: '2rem 0', color: '#ebd9bd', textAlign: 'center' }}>
          <h3>Today's Special Menus</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Enjoy our famous Peking Duck, Kung Pao Chicken, and Hand-pulled Noodles!
          </p>
        </div>

        <button
          onClick={onLogout}
          className="submit-btn"
          style={{ backgroundColor: '#a93226' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}