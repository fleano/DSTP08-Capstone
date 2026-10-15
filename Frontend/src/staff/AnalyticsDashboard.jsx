import React, { useEffect, useState } from "react";

function AnalyticsCard({ title, value }) {
  return (
    <div
      style={{
        background: "#3d2222",
        padding: "1rem",
        borderRadius: "8px",
        textAlign: "center",
      }}
    >
      <h4 style={{ color: "#f7d070" }}>{title}</h4>

      <p
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
        }}
      >
        {value}
      </p>
    </div>
  );
}

export const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/analytics/dashboard`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const data = await response.json();
        console.log(data);
        setAnalyticsData(data);
      } catch (err) {
        setError("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return <p>Loading analytics...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!analyticsData) {
    return <p>No analytics found.</p>;
  }

  const {
    overview,
    popularItems,
    staffScheduling,
    menuAnalytics,
    systemUsage,
  } = analyticsData;

  return (
    <div>
      <h2
        style={{
          color: "#f7d070",
          marginBottom: "1.5rem",
        }}
      >
        Restaurant Analytics Dashboard
      </h2>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <AnalyticsCard title="Total Orders" value={overview.totalOrders} />

        <AnalyticsCard
          title="Revenue"
          value={`$${(overview.totalRevenue / 100).toFixed(2)}`}
        />

        <AnalyticsCard
          title="Registered Users"
          value={systemUsage.summary.registeredUsers}
        />

        <AnalyticsCard
          title="Menu Items"
          value={menuAnalytics.summary.totalMenuItems}
        />
      </div>

      {/* Popular Items */}
      <section className="contact-container">
        <h3>🍜 Popular Menu Items</h3>

        {popularItems.topOrderedItems.length === 0 ? (
          <p>No orders have been placed yet.</p>
        ) : (
          <ul>
            {popularItems.topOrderedItems.map((item) => (
              <li key={item.foodId}>
                {item.name} - {item.orders} sold
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Staff Analytics */}
      <section className="contact-container" style={{ marginTop: "1rem" }}>
        <h3>👨‍🍳 Staff Scheduling Analytics (NOT DONE)</h3>

        <ul>
          <li>Total Staff: {staffScheduling.summary.totalStaff}</li>
          <li>Total Shifts: {staffScheduling.summary.totalShifts}</li>
          <li>Covered Shifts: {staffScheduling.summary.coveredShifts}</li>
          <li>Uncovered Shifts: {staffScheduling.summary.uncoveredShifts}</li>
          <li>Coverage Rate: {staffScheduling.summary.coverageRate}%</li>
        </ul>

        <h4>Staff Utilization</h4>

        {staffScheduling.utilization.length === 0 ? (
          <p>Scheduling analytics not available yet.</p>
        ) : (
          <ul>
            {staffScheduling.utilization.map((staff) => (
              <li key={staff.accountId}>
                {staff.username} - {staff.hoursWorked} hrs ({staff.shiftsWorked}{" "}
                shifts)
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Menu Analytics */}
      <section className="contact-container" style={{ marginTop: "1rem" }}>
        <h3>💰 Menu Analytics</h3>

        <ul>
          <li>Total Menu Items: {menuAnalytics.summary.totalMenuItems}</li>

          <li>Featured Items: {menuAnalytics.summary.featuredItems}</li>

          <li>Discounted Items: {menuAnalytics.summary.discountedItems}</li>
        </ul>

        <h4>Food Pricing</h4>

        <ul>
          {menuAnalytics.pricing.map((item) => (
            <li key={item.foodId}>
              <strong>{item.name}</strong>
              <br />
              Price: ${item.price ? (item.price / 100).toFixed(2) : "N/A"}
              {item.discountedPrice && (
                <> | Discounted: ${(item.discountedPrice / 100).toFixed(2)}</>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* System Usage Reports */}
      <section className="contact-container" style={{ marginTop: "1rem" }}>
        <h3>📈 System Usage Reports</h3>

        <ul>
          <li>
            Registered Users:
            {systemUsage.summary.registeredUsers}
          </li>

          <li>
            Active Users:
            {systemUsage.summary.activeUsersToday}
          </li>

          <li>
            Customers:
            {systemUsage.roleBreakdown.customers}
          </li>

          <li>
            Staff:
            {systemUsage.roleBreakdown.staff}
          </li>

          <li>
            Managers:
            {systemUsage.roleBreakdown.managers}
          </li>

          <li>
            Admins:
            {systemUsage.roleBreakdown.admins}
          </li>
        </ul>
      </section>
    </div>
  );
};
