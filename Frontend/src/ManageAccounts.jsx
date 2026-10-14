import { useState, useEffect } from "react";
import "./App.css";

function ManageAccounts({ onBack }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Get current logged-in user to check their role
    const savedUser = JSON.parse(localStorage.getItem("restaurant_user") || "{}");
    const isManager = Number(savedUser.role) === 1;
    const isRootAdmin = Number(savedUser.role) === 0;

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/admin/users`, {
                method: "GET",
                headers: {
                    "Authorization": token ? token : "",
                },
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || data.message || "Failed to fetch users.");
                setLoading(false);
                return;
            }

            let fetchedUsers = data.users || data.message || data;

            // If the user is a Manager, hide root admin accounts (roleID 0) from the list
            if (isManager) {
                fetchedUsers = fetchedUsers.filter(u => {
                    const r = u.roleID !== undefined ? Number(u.roleID) : Number(u.role);
                    return r !== 0; // Exclude Admins
                });
            }

            setUsers(fetchedUsers);
        } catch (err) {
            console.error("Fetch users error:", err);
            setError("Cannot reach the server to fetch users.");
        }
        setLoading(false);
    }

    async function handleRoleChange(userId, newRoleID) {
        setError("");
        setSuccess("");
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/admin/update-role`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token ? token : "",
                },
                credentials: "include",
                body: JSON.stringify({ userId, roleID: Number(newRoleID) }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || data.message || "Failed to update role.");
                return;
            }

            setSuccess("User role updated successfully!");
            fetchUsers();
        } catch (err) {
            console.error("Update role error:", err);
            setError("Cannot reach the server.");
        }
    }

    async function handleDeleteUser(userId, username) {
        if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
            return;
        }

        setError("");
        setSuccess("");
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/admin/user/${userId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": token ? token : "",
                },
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || data.message || "Failed to delete user.");
                return;
            }

            setSuccess(`User "${username}" deleted successfully.`);
            setUsers(users.filter(u => u.id !== userId && u._id !== userId));
        } catch (err) {
            console.error("Delete user error:", err);
            setError("Cannot reach the server.");
        }
    }

    const getRoleName = (roleID) => {
        const r = Number(roleID);
        if (r === 0) return "Admin";
        if (r === 1) return "Manager";
        if (r === 2) return "Staff";
        if (r === 3) return "Customer";
        return "Guest/Unknown";
    };

    return (
        <div style={{ padding: "3rem 2rem", maxWidth: "1000px", margin: "0 auto" }}>
            <button className="back-button" onClick={onBack} style={{ marginBottom: "1.5rem" }}>
                &larr; Back to dashboard
            </button>

            <div className="auth-header" style={{ textAlign: "left", marginBottom: "2rem" }}>
                <h2 className="auth-title" style={{ color: "#f7d070" }}>👥 Manage Accounts</h2>
                <p className="auth-subtitle">View, promote, demote, or delete system users.</p>
            </div>

            {error !== "" && <div className="error-message" style={{ marginBottom: "1rem" }}>{error}</div>}
            {success !== "" && <div className="success-message" style={{ marginBottom: "1rem" }}>{success}</div>}

            {loading ? (
                <p style={{ color: "#ebd9bd" }}>Loading accounts...</p>
            ) : (
                <div style={{ background: "#2a1515", padding: "1.5rem", borderRadius: "8px", overflowX: "auto" }}>
                    {users.length === 0 ? (
                        <p style={{ color: "#ebd9bd" }}>No accounts found.</p>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", color: "#ebd9bd", textAlign: "left" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid #4a2525" }}>
                                    <th style={{ padding: "10px" }}>Username</th>
                                    <th style={{ padding: "10px" }}>Email</th>
                                    <th style={{ padding: "10px" }}>Current Role</th>
                                    <th style={{ padding: "10px" }}>Change Role</th>
                                    <th style={{ padding: "10px" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => {
                                    const uid = u.id || u._id;
                                    const roleVal = u.roleID !== undefined ? u.roleID : u.role;
                                    return (
                                        <tr key={uid} style={{ borderBottom: "1px solid #3a1d1d" }}>
                                            <td style={{ padding: "12px" }}>{u.username}</td>
                                            <td style={{ padding: "12px" }}>{u.email || "N/A"}</td>
                                            <td style={{ padding: "12px" }}>{getRoleName(roleVal)}</td>
                                            <td style={{ padding: "12px" }}>
                                                <select
                                                    value={roleVal}
                                                    onChange={(e) => handleRoleChange(uid, e.target.value)}
                                                    style={{ padding: "5px", borderRadius: "4px", background: "#1a0d0d", color: "#ebd9bd", border: "1px solid #4a2525" }}
                                                >
                                                    {/* Only Root Admin can assign Admin role */}
                                                    {isRootAdmin && <option value="0">Admin (0)</option>}
                                                    <option value="1">Manager (1)</option>
                                                    <option value="2">Staff (2)</option>
                                                    <option value="3">Customer (3)</option>
                                                </select>
                                            </td>
                                            <td style={{ padding: "12px" }}>
                                                <button
                                                    onClick={() => handleDeleteUser(uid, u.username)}
                                                    style={{ background: "#a93226", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

export default ManageAccounts;