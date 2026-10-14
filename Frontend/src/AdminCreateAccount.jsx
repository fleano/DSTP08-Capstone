import { useState } from "react";
import "./App.css";

function AdminCreateAccount({ onBack }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [roleID, setRoleID] = useState("3"); // 3 = customer, 2 = staff, 1 = manager
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!username || !email || !password) {
            setError("Please fill in all fields (including email).");
            return;
        }

        // Retrieve the stored JWT token
        const token = localStorage.getItem("token");

        let response;
        try {
            response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/admin/create-user`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": token ? token : "" 
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password,
                    roleID: Number(roleID)
                })
            });
        } catch (err) {
            console.error("Network fetch error:", err);
            setError("Cannot reach the server. Please check your network or backend URL.");
            return;
        }

        let data = {};
        try {
            data = await response.json();
        } catch (err) {
            console.log("Reply was not JSON. Status:", response.status);
        }

        if (!response.ok) {
            setError(data.error || data.message || "Request failed (status " + response.status + ").");
            return;
        }

        setSuccess("Account created for " + username + "!");
        setUsername("");
        setEmail("");
        setPassword("");
        setRoleID("3");
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <button className="back-button" onClick={onBack}>
                    &larr; Back to dashboard
                </button>

                <div className="auth-header">
                    <h2 className="auth-title">🍜 Golden Dragon</h2>
                    <p className="auth-subtitle">Admin - Create Account</p>
                </div>

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

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            className="form-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            className="form-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Account Type</label>
                        <select
                            className="form-input"
                            value={roleID}
                            onChange={(e) => setRoleID(e.target.value)}
                        >
                            <option value="3">Customer</option>
                            <option value="2">Staff</option>
                            <option value="1">Manager</option>
                        </select>
                    </div>

                    <button type="submit" className="submit-btn">
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminCreateAccount;