import React, { useState } from 'react';
 
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
      setError('Please fill in all required fields.');
      return;
    }
 
    setSubmitted(true);
  };
 
  return (
    <div className="restaurant-auth-container">
      {}
      <style>{`
        .restaurant-auth-container {
          min-height: 100vh;
          width: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', Georgia, serif;
          background-color: #2b0b13;
          background-image: linear-gradient(rgba(43, 11, 19, 0.85), rgba(20, 4, 8, 0.95)),
                            url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2000&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          padding: 1.5rem;
          box-sizing: border-box;
        }
 
        .auth-card {
          background: rgba(43, 11, 19, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 24px;
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
          color: #fcf8f2;
          animation: fadeIn 0.5s ease-out;
        }
 
        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }
 
        .auth-logo-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #d4af37, #b8860b);
          color: #2b0b13;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          font-size: 26px;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }
 
        .auth-title {
          font-size: 2rem;
          margin: 0;
          color: #fcf8f2;
          letter-spacing: 0.5px;
        }
 
        .auth-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #d4af37;
          opacity: 0.8;
          margin-top: 0.5rem;
        }
 
        .tab-container {
          display: flex;
          background: rgba(20, 4, 8, 0.6);
          padding: 4px;
          border-radius: 14px;
          margin-bottom: 2rem;
          border: 1px solid rgba(212, 175, 55, 0.15);
        }
 
        .tab-btn {
          flex: 1;
          padding: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          border: none;
          background: transparent;
          color: #b0a3a6;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
 
        .tab-btn.active {
          background: #d4af37;
          color: #2b0b13;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
        }
 
        .error-message {
          background: rgba(139, 0, 0, 0.4);
          border: 1px solid rgba(255, 99, 71, 0.5);
          color: #ffcdd2;
          padding: 10px 14px;
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          text-align: center;
          margin-bottom: 1.5rem;
        }
 
        .form-group {
          margin-bottom: 1.25rem;
        }
 
        .form-label {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #ebd9bd;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
 
        .input-wrapper {
          position: relative;
        }
 
        .form-input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          background: rgba(20, 4, 8, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.25);
          border-radius: 12px;
          color: #fcf8f2;
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          outline: none;
          box-sizing: border-box;
          transition: all 0.3s ease;
        }
 
        .form-input::placeholder {
          color: #7a686d;
        }
 
        .form-input:focus {
          border-color: #d4af37;
          box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
        }
 
        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #d4af37;
          opacity: 0.8;
          font-size: 1rem;
        }
 
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          margin: 1rem 0 1.5rem 0;
        }
 
        .remember-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ebd9bd;
          cursor: pointer;
        }
 
        .remember-checkbox {
          accent-color: #d4af37;
          width: 16px;
          height: 16px;
          cursor: pointer;
        }
 
        .forgot-link {
          color: #d4af37;
          text-decoration: none;
          transition: color 0.2s;
        }
 
        .forgot-link:hover {
          color: #f3e5ab;
          text-decoration: underline;
        }
 
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #d4af37, #b8860b);
          color: #2b0b13;
          border: none;
          border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
          transition: all 0.3s ease;
        }
 
        .submit-btn:hover {
          background: linear-gradient(135deg, #e6c55c, #d4af37);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
        }
 
        .submit-btn:active {
          transform: translateY(1px);
        }
 
        .auth-footer {
          margin-top: 2rem;
          text-align: center;
          border-top: 1px solid rgba(212, 175, 55, 0.15);
          padding-top: 1.25rem;
        }
 
        .footer-note {
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          color: #ebd9bd;
          opacity: 0.7;
          margin: 0;
        }
 
        .success-card {
          text-align: center;
          padding: 1rem 0;
        }
 
        .success-icon {
          width: 64px;
          height: 64px;
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #d4af37;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin-bottom: 1.25rem;
        }
 
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
 
      {}
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
              <div className="auth-logo-icon">🍽️</div>
              <h1 className="auth-title">La Maison</h1>
              <div className="auth-subtitle">Fine Dining & Culinary Experience</div>
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
                      placeholder="e.g. Julia Child"
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
                    placeholder="chef@lamaison.com"
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
 
              {isLogin && (
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
              )}
 
              <button type="submit" className="submit-btn" style={{ marginTop: isLogin ? '0' : '1.5rem' }}>
                {isLogin ? 'Sign In to Table' : 'Create Account'}
              </button>
            </form>
 
            <div className="auth-footer">
              <p className="footer-note">✨ Reserve your table or manage orders instantly</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
 
}