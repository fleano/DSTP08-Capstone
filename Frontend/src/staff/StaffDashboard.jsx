// src/staff/StaffDashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

import { AnalyticsDashboard } from "./AnalyticsDashboard";

export default function StaffDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("analytics"); // 'analytics' or 'schedule'
  const navigate = useNavigate();

  // Helper to convert numeric role into a display string
  const getRoleDisplay = (role) => {
    const r = Number(role);
    if (r === 0) return "ADMIN";
    if (r === 1) return "MANAGER";
    if (r === 2) return "STAFF";
    return "STAFF";
  };

  const isManagerOrAdmin = Number(user.role) === 0 || Number(user.role) === 1;
  {
    /*Calendar variables*/
  } /*
  const [modalVisibility, setmodalVisibility] = useState(false);
  function setModalVisibility() {
    setModalVisibility(true);
  }

  const [value, onChange] = useState(new Date());
  function PopupGfg() {
    return (
      <div>
        <h4>Popup - GeeksforGeeks</h4>
        <Popup trigger={<button> Click to open modal </button>} modal nested>
          {(close) => (
            <div className="modal">
              <div className="content">Welcome to GFG!!!</div>
              <div>
                <button onClick={() => close()}>Close modal</button>
              </div>
            </div>
          )}
        </Popup>
      </div>
    );
  }*/
  return (
    <div className="homepage-wrapper">
      {/* Staff Top Navigation */}
      <nav className="navbar">
        <div className="nav-brand">
          <span className="brand-icon">🛡️</span> Staff Portal (
          {getRoleDisplay(user.role)})
        </div>
        <div className="nav-links">
          <button
            className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
            style={{
              background: "none",
              border: "none",
              color: "#ebd9bd",
              cursor: "pointer",
            }}
          >
            Order Analytics
          </button>
          <button
            className={`tab-btn ${activeTab === "schedule" ? "active" : ""}`}
            onClick={() => navigate("/my-schedule")}
            style={{
              background: "none",
              border: "none",
              color: "#ebd9bd",
              cursor: "pointer",
            }}
          >
            Calendar & Scheduling
          </button>

          <button
            className="nav-login-btn"
            onClick={onLogout}
            style={{ backgroundColor: "#a93226" }}
          >
            Logout ({user.name})
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div
        style={{ padding: "3rem 2rem", maxWidth: "1100px", margin: "0 auto" }}
      >
        {activeTab === "analytics" && <AnalyticsDashboard />}
      </div>
    </div>
  );
}
