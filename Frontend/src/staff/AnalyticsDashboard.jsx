import React from "react";

export const AnalyticsDashboard = () => {
  return (
    <div>
      <h2 style={{ color: "#f7d070", marginBottom: "1.5rem" }}>
        Live Order Analytics
      </h2>
      <div className="contact-container">
        <p>
          📊 Graphs and real-time statistics of incoming customer food orders
          will show here.
        </p>
        <ul>
          <li>Total Orders Today: 42</li>
          <li>Pending Kitchen Orders: 5</li>
          <li>Top Selling Dish: Peking Roasted Duck</li>
        </ul>
      </div>
    </div>
  );
};
