import { useEffect, useState } from "react";
import { BarChart, TrendChart } from "./AnalyticsCharts.jsx";
import "./AnalyticsDashboard.css";

function localDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function initialRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 29);
  return { startDate: localDateInput(start), endDate: localDateInput(end) };
}

function money(cents) {
  return `$${((Number(cents) || 0) / 100).toFixed(2)}`;
}

function escapeCsv(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function exportAnalyticsCsv(data) {
  const rows = [["Section", "Metric", "Value", "Details"]];
  rows.push(["Report", "Start date", data.filters.startDate, ""]);
  rows.push(["Report", "End date", data.filters.endDate, ""]);
  rows.push(["Overview", "Orders", data.overview.totalOrders, ""]);
  rows.push(["Overview", "Revenue", money(data.overview.totalRevenue), ""]);
  rows.push([
    "Schedule",
    "Coverage rate",
    `${data.staffScheduling.summary.coverageRate}%`,
    "",
  ]);
  rows.push([
    "Schedule",
    "Total shifts",
    data.staffScheduling.summary.totalShifts,
    "",
  ]);
  rows.push([
    "Menu",
    "Theoretical profit",
    money(data.menuAnalytics.summary.theoreticalProfit),
    "Current sale price less current unit cost, multiplied by units sold",
  ]);
  rows.push([
    "System",
    "Active users",
    data.systemUsage.summary.activeUsers,
    "",
  ]);
  rows.push([
    "System",
    "Average response time",
    `${data.systemUsage.performance.averageResponseMs} ms`,
    "",
  ]);
  rows.push([
    "System",
    "Maximum response time",
    `${data.systemUsage.performance.maxResponseMs} ms`,
    "",
  ]);
  rows.push([
    "System",
    "Server errors",
    data.systemUsage.performance.serverErrors,
    `${data.systemUsage.performance.serverErrorRate}% of requests`,
  ]);
  rows.push([
    "System",
    "Active sessions",
    data.systemUsage.summary.activeSessions,
    "Current sessions",
  ]);

  for (const day of data.overview.orderTrend) {
    rows.push([
      "Daily sales",
      day.date,
      day.orders,
      `${money(day.revenue)} revenue`,
    ]);
  }
  for (const day of data.systemUsage.activityTrend) {
    rows.push([
      "Daily activity",
      day.date,
      day.requests,
      `${day.averageResponseMs} ms average response`,
    ]);
  }
  for (const [role, count] of Object.entries(data.systemUsage.roleBreakdown)) {
    rows.push(["User roles", role, count, "Accounts"]);
  }
  for (const route of data.systemUsage.busiestRoutes) {
    rows.push([
      "Route performance",
      `${route.method} ${route.route}`,
      route.requests,
      `${route.averageResponseMs} ms average response`,
    ]);
  }

  for (const item of data.popularItems.topOrderedItems) {
    rows.push(["Popular items", item.name, item.unitsSold, "Units sold"]);
  }
  for (const staff of data.staffScheduling.utilization) {
    rows.push([
      "Staff utilization",
      staff.name,
      `${staff.hoursWorked} hours`,
      `${staff.shiftsWorked} shifts`,
    ]);
  }
  for (const item of data.menuAnalytics.pricing) {
    rows.push([
      "Menu item",
      item.name,
      item.theoreticalProfit == null
        ? "Cost missing"
        : money(item.theoreticalProfit),
      `${item.unitsSold} units; price ${money(item.discountedPrice ?? item.price)}; unit cost ${item.unitCost == null ? "missing" : money(item.unitCost)}`,
    ]);
  }

  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `restaurant-analytics-${data.filters.startDate}-to-${data.filters.endDate}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function AnalyticsCard({ title, value, detail }) {
  return (
    <article className="analytics-kpi">
      <span>{title}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </article>
  );
}

export const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState(initialRange);
  const [appliedRange, setAppliedRange] = useState(initialRange);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadAnalytics() {
      try {
        const token = localStorage.getItem("token");
        const query = new URLSearchParams(appliedRange);
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/analytics/dashboard?${query}`,
          { headers: { Authorization: token || "" } },
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch analytics.");
        }
        if (!cancelled) {
          setAnalyticsData(data);
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAnalytics();
    return () => {
      cancelled = true;
    };
  }, [appliedRange]);

  function applyDateRange(event) {
    event.preventDefault();
    if (
      !dateRange.startDate ||
      !dateRange.endDate ||
      dateRange.startDate > dateRange.endDate
    ) {
      setError(
        "Choose a valid date range with the start date before the end date.",
      );
      return;
    }
    setLoading(true);
    setError("");
    setAppliedRange({ ...dateRange });
  }

  if (loading && !analyticsData) {
    return <p className="analytics-state">Loading analytics...</p>;
  }
  if (error && !analyticsData) {
    return (
      <p className="analytics-state analytics-error" role="alert">
        {error}
      </p>
    );
  }
  if (!analyticsData) {
    return <p className="analytics-state">No analytics found.</p>;
  }

  const {
    overview,
    popularItems,
    staffScheduling,
    menuAnalytics,
    systemUsage,
  } = analyticsData;
  const orderChart = popularItems.topOrderedItems.map((item) => ({
    ...item,
    label: item.name,
  }));
  const profitItems = menuAnalytics.pricing.filter(
    (item) => item.theoreticalProfit != null,
  );

  return (
    <main className="analytics-dashboard">
      <header className="analytics-header">
        <div>
          <p className="analytics-eyebrow">OPERATIONS / REPORTING</p>
          <h1>Restaurant analytics</h1>
          <p>Sales, staffing, menu performance, and system activity.</p>
        </div>
        <div className="analytics-export-actions">
          <button
            type="button"
            onClick={() => exportAnalyticsCsv(analyticsData)}
          >
            Export CSV
          </button>
          <button type="button" onClick={() => window.print()}>
            Print / Save PDF
          </button>
        </div>
      </header>

      <form className="analytics-filters" onSubmit={applyDateRange}>
        <label>
          From
          <input
            type="date"
            value={dateRange.startDate}
            max={dateRange.endDate}
            onChange={(event) =>
              setDateRange({ ...dateRange, startDate: event.target.value })
            }
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={dateRange.endDate}
            min={dateRange.startDate}
            onChange={(event) =>
              setDateRange({ ...dateRange, endDate: event.target.value })
            }
          />
        </label>
        <button type="submit" disabled={loading}>
          Apply range
        </button>
        <span className="analytics-range-caption">
          {analyticsData.filters.startDate} to {analyticsData.filters.endDate}
        </span>
      </form>

      {error && (
        <p className="analytics-inline-error" role="alert">
          {error}
        </p>
      )}
      {loading && (
        <p className="analytics-refreshing" role="status">
          Updating report...
        </p>
      )}

      <section
        className="analytics-kpis"
        aria-label="Key performance indicators"
      >
        <AnalyticsCard title="Orders" value={overview.totalOrders} />
        <AnalyticsCard title="Revenue" value={money(overview.totalRevenue)} />
        <AnalyticsCard
          title="Shift coverage"
          value={`${staffScheduling.summary.coverageRate}%`}
          detail={`${staffScheduling.summary.coveredShifts} of ${staffScheduling.summary.totalShifts} shifts`}
        />
        <AnalyticsCard
          title="Average response"
          value={`${systemUsage.performance.averageResponseMs} ms`}
          detail={`${systemUsage.performance.requestCount} requests`}
        />
      </section>

      <section className="analytics-section">
        <div className="analytics-section-heading">
          <div>
            <p className="analytics-eyebrow">SALES</p>
            <h2>Popular items</h2>
          </div>
          <span>Ranked by units sold</span>
        </div>
        <div className="analytics-chart-grid">
          <BarChart
            title="Top ordered items"
            data={orderChart}
            labelKey="label"
            valueKey="unitsSold"
            formatValue={(value) => `${value} sold`}
          />
          <TrendChart
            title="Daily orders"
            data={overview.orderTrend}
            valueKey="orders"
            formatValue={(value) => `${value} orders`}
          />
          <TrendChart
            title="Daily revenue"
            data={overview.orderTrend}
            valueKey="revenue"
            formatValue={money}
          />
        </div>
      </section>

      <section className="analytics-section">
        <div className="analytics-section-heading">
          <div>
            <p className="analytics-eyebrow">SCHEDULING</p>
            <h2>Staff coverage and utilization</h2>
          </div>
          <span>{staffScheduling.summary.totalStaff} staff accounts</span>
        </div>
        <div className="analytics-mini-stats">
          <div>
            <span>Total shifts</span>
            <strong>{staffScheduling.summary.totalShifts}</strong>
          </div>
          <div>
            <span>Covered</span>
            <strong>{staffScheduling.summary.coveredShifts}</strong>
          </div>
          <div>
            <span>Uncovered</span>
            <strong>{staffScheduling.summary.uncoveredShifts}</strong>
          </div>
          <div>
            <span>Coverage</span>
            <strong>{staffScheduling.summary.coverageRate}%</strong>
          </div>
        </div>
        <BarChart
          title="Hours scheduled by staff"
          data={staffScheduling.utilization}
          labelKey="name"
          valueKey="hoursWorked"
          formatValue={(value) => `${value} hrs`}
        />
      </section>

      <section className="analytics-section">
        <div className="analytics-section-heading">
          <div>
            <p className="analytics-eyebrow">MENU ECONOMICS</p>
            <h2>Pricing and theoretical profit</h2>
          </div>
          <span>
            Current price and unit cost applied to units sold in this range
          </span>
        </div>
        <div className="analytics-mini-stats">
          <div>
            <span>Menu items</span>
            <strong>{menuAnalytics.summary.totalMenuItems}</strong>
          </div>
          <div>
            <span>Featured</span>
            <strong>{menuAnalytics.summary.featuredItems}</strong>
          </div>
          <div>
            <span>Discounted</span>
            <strong>{menuAnalytics.summary.discountedItems}</strong>
          </div>
          <div>
            <span>Estimated profit</span>
            <strong>{money(menuAnalytics.summary.theoreticalProfit)}</strong>
          </div>
        </div>
        {menuAnalytics.summary.itemsMissingCost > 0 && (
          <p className="analytics-note">
            Unit cost is missing for {menuAnalytics.summary.itemsMissingCost}{" "}
            menu items. Add costs in Manage Menu to include those items in
            profit estimates.
          </p>
        )}
        <div className="analytics-chart-grid">
          <BarChart
            title="Theoretical profit by item"
            data={profitItems}
            labelKey="name"
            valueKey="theoreticalProfit"
            formatValue={money}
          />
          <div className="analytics-table-wrap">
            <h3>Menu pricing details</h3>
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Sold</th>
                  <th>Current price</th>
                  <th>Unit cost</th>
                  <th>Theoretical profit</th>
                </tr>
              </thead>
              <tbody>
                {menuAnalytics.pricing.map((item) => (
                  <tr key={item.foodId}>
                    <td>{item.name}</td>
                    <td>{item.unitsSold}</td>
                    <td>{money(item.discountedPrice ?? item.price)}</td>
                    <td>
                      {item.unitCost == null ? "Not set" : money(item.unitCost)}
                    </td>
                    <td>
                      {item.theoreticalProfit == null
                        ? "Not available"
                        : money(item.theoreticalProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="analytics-section">
        <div className="analytics-section-heading">
          <div>
            <p className="analytics-eyebrow">SYSTEM</p>
            <h2>User activity and performance</h2>
          </div>
          <span>Requests recorded by backend middleware</span>
        </div>
        <div className="analytics-mini-stats">
          <div>
            <span>Registered users</span>
            <strong>{systemUsage.summary.registeredUsers}</strong>
          </div>
          <div>
            <span>Active users in range</span>
            <strong>{systemUsage.summary.activeUsers}</strong>
          </div>
          <div>
            <span>Active sessions now</span>
            <strong>{systemUsage.summary.activeSessions}</strong>
          </div>
          <div>
            <span>5xx errors</span>
            <strong>
              {systemUsage.performance.serverErrors} (
              {systemUsage.performance.serverErrorRate}%)
            </strong>
          </div>
        </div>
        <div className="analytics-chart-grid">
          <TrendChart
            title="Daily API requests"
            data={systemUsage.activityTrend}
            valueKey="requests"
            formatValue={(value) => `${value} requests`}
          />
          <div className="analytics-table-wrap">
            <h3>Slowest active routes by average response</h3>
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Route</th>
                  <th>Requests</th>
                  <th>Average</th>
                </tr>
              </thead>
              <tbody>
                {[...systemUsage.busiestRoutes]
                  .sort(
                    (first, second) =>
                      second.averageResponseMs - first.averageResponseMs,
                  )
                  .map((route) => (
                    <tr key={`${route.method}-${route.route}`}>
                      <td>{route.method}</td>
                      <td>{route.route}</td>
                      <td>{route.requests}</td>
                      <td>{route.averageResponseMs} ms</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="analytics-note">
          Role totals: {systemUsage.roleBreakdown.customers} customers,{" "}
          {systemUsage.roleBreakdown.staff} staff,{" "}
          {systemUsage.roleBreakdown.managers} managers,{" "}
          {systemUsage.roleBreakdown.admins} admins.
        </p>
      </section>
    </main>
  );
};
