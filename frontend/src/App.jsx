import React, { useState } from 'react';
import './App.css';

export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (!isLogin && !name)) {
      setError('Wrong email or password.');
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="restaurant-auth-container">
      <div className="auth-card">
        {submitted ? (
          <div className="success-card">
            <div className="success-icon">✓</div>
            <h2 className="auth-title" style={{ fontSize: '24px', marginBottom: '10px' }}>Welcome Back!</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#ebd9bd', fontSize: '0.9rem', marginBottom: '2rem' }}>
              {isLogin ? `Successfully logged in as ${email}` : `Account created successfully for ${name}!`}
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setPassword('');
              }}
              className="submit-btn"
            >
              Sign Out / Back
            </button>
          </div>
        ) : (
          <>
            <div className="auth-header">
              <div className="auth-logo-icon">🍜</div>
              <h1 className="auth-title">Chinese Restaurant</h1>
              <div className="auth-subtitle">Succulent Chinese Meal Experience</div>
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

            <form onSubmit={handleSubmit}>
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
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="leexiaoming@gmail.com"
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

              {/* {isLogin && (
                <div className="form-options">
                  <label className="remember-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="remember-checkbox"
                    />
                    <span>Remember me</span>
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password reset link sent!"); }} className="forgot-link">
                    Forgot password?
                  </a>
                </div>
              )} */}

              <button type="submit" className="submit-btn" style={{ marginTop: isLogin ? '0' : '1.5rem' }}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="auth-footer">
              <p className="footer-note">Made by DSTP08 group X</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}