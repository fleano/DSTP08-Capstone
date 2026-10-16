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
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/admin/users`,
        {
          method: "GET",
          headers: {
            Authorization: token ? token : "",
          },
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || "Failed to fetch users.");
        setLoading(false);
        return;
      }

      let fetchedUsers = data.users || data.message || data;

      // If the user is a Manager, hide root admin accounts (roleID 0) from the list
      if (isManager) {
        fetchedUsers = fetchedUsers.filter((u) => {
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
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/admin/update-role`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? token : "",
          },
          credentials: "include",
          body: JSON.stringify({ userId, roleID: Number(newRoleID) }),
        },
      );

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
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/admin/user/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token ? token : "",
          },
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || "Failed to delete user.");
        return;
      }

      setSuccess(`User "${username}" deleted successfully.`);
      setUsers(users.filter((u) => u.id !== userId && u._id !== userId));
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
    <div className="admin-page">
      <div className="admin-page-inner">
        <div className="admin-topbar">
          <button className="back-button" onClick={onBack}>
            &larr; Back to dashboard
          </button>
        </div>

        <div className="admin-header">
          <h2 className="admin-title">👥 Manage Accounts</h2>
          <p className="admin-subtitle">
            View, promote, demote, or delete system users.
          </p>
        </div>

        {error !== "" && <div className="error-message">{error}</div>}
        {success !== "" && <div className="success-message">{success}</div>}

        {loading ? (
          <p className="loading-text">Loading accounts...</p>
        ) : (
          <div className="admin-card">
            {users.length === 0 ? (
              <p className="admin-empty">No accounts found.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Current Role</th>
                    <th>Change Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const uid = u.id || u._id;
                    const roleVal = u.roleID !== undefined ? u.roleID : u.role;
                    return (
                      <tr key={uid}>
                        <td>{u.username}</td>
                        <td>{u.email || "N/A"}</td>
                        <td>{getRoleName(roleVal)}</td>
                        <td>
                          <select
                            className="admin-select"
                            value={roleVal}
                            onChange={(e) =>
                              handleRoleChange(uid, e.target.value)
                            }
                          >
                            {/* Only Root Admin can assign Admin role */}
                            {isRootAdmin && (
                              <option value="0">Admin (0)</option>
                            )}
                            <option value="1">Manager (1)</option>
                            <option value="2">Staff (2)</option>
                            <option value="3">Customer (3)</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className="admin-btn admin-btn-danger admin-btn-small"
                            onClick={() => handleDeleteUser(uid, u.username)}
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
    </div>
  );
}

export default ManageAccounts;
