import { useState } from "react";
import "./App.css";

function LoginPage({ onLogin, onBack, onGuest, notice }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!username || !password || (!isLogin && !email)) {
      setError("Please fill in all required fields.");
      return;
    }

    const url = isLogin
      ? `${import.meta.env.VITE_API_BASE_URL}/auth/login`
      : `${import.meta.env.VITE_API_BASE_URL}/auth/register`;

    const requestBody = isLogin
      ? {
          username,
          password,
        }
      : {
          username,
          email,
          password,
        };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      console.log("Response:", data);

      if (!response.ok) {
        setError(data.message || "Authentication failed.");
        return;
      }

      if (isLogin) {
        // Save token if backend returns one
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        // Save user info
        localStorage.setItem(
          "restaurant_user",
          JSON.stringify(data.user || data),
        );

        onLogin({
          username: data.user?.username || data.username || username,

          role: data.user?.role || data.role || data.roleId,
        });
      } else {
        setSuccess("Account created! Please sign in.");
        setIsLogin(true);
        setPassword("");
        setEmail("");
      }
    } catch (err) {
      console.error(err);
      setError("Cannot reach the server. Please try again later.");
    }
  }

  function switchTab(loginTab) {
    setIsLogin(loginTab);
    setError("");
    setSuccess("");
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button className="back-button" onClick={onBack}>
          &larr; Back to home
        </button>

        <div className="auth-header">
          <h2 className="auth-title">🍜 Golden Dragon</h2>
          <p className="auth-subtitle">Customer & Staff Sign In</p>
        </div>

        {/* Tabs to switch between Sign In and Create Account */}
        <div className="tab-container">
          <button
            className={isLogin ? "tab-btn active" : "tab-btn"}
            onClick={() => switchTab(true)}
          >
            Sign In
          </button>
          <button
            className={!isLogin ? "tab-btn active" : "tab-btn"}
            onClick={() => switchTab(false)}
          >
            Create Account
          </button>
        </div>

        {notice && <div className="notice-message">{notice}</div>}
        {error !== "" && <div className="error-message">{error}</div>}
        {success !== "" && <div className="success-message">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Email field only appears when creating an account */}
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="submit-btn">
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="guest-section">
          <p className="guest-text">or</p>
          <button className="guest-btn" onClick={onGuest}>
            Continue as Guest
          </button>
          <p className="guest-note">
            Guests can order from the menu and check out.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
