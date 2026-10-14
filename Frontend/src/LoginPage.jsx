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

        // Validation: Username & password always needed. Email only needed for registration.
        if (!username || !password || (!isLogin && !email)) {
            setError("Please fill in all required fields.");
            return;
        }

        const url = isLogin ? "/auth/login" : "/auth/register";

        // Build request body conditionally
        const requestBody = isLogin
            ? { username: username, password: password }
            : { username: username, email: email, password: password };

        let response;
        try {
            response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });
        } catch (err) {
            setError("Cannot reach the server. Please try again later.");
            return;
        }

        let data = {};
        try {
            data = await response.json();
        } catch (err) {
            console.log("Reply was not JSON. Status:", response.status);
        }

        if (!response.ok) {
            setError(data.message || "Request failed (status " + response.status + ").");
            return;
        }

        if (isLogin) {
            // Pass the logged-in user back up to App
            onLogin({
                username: data.username || username,
                name: data.username || username,
                role: data.role
            });
        } else {
            // Account created, switch them to the Sign In tab and clear fields
            setSuccess("Account created! Please sign in.");
            setIsLogin(true);
            setPassword("");
            setEmail("");
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
                    <p className="guest-note">Guests can order from the menu and check out.</p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;