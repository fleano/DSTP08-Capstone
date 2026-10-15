const {
  allQuery,
  getQuery,
} = require("../../1-auth/controllers/register.controller");
const { ROLE } = require("../../constants/global");

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function getDateRange(request) {
  const today = new Date().toISOString().slice(0, 10);
  const defaultStart = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const startDate = request.query.startDate || defaultStart;
  const endDate = request.query.endDate || today;

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return { error: "startDate and endDate must use YYYY-MM-DD format" };
  }
  if (startDate > endDate) {
    return { error: "startDate must be on or before endDate" };
  }

  return {
    startDate,
    endDate,
    startEpoch: Math.floor(Date.parse(`${startDate}T00:00:00Z`) / 1000),
    endEpoch: Math.floor(Date.parse(`${endDate}T00:00:00Z`) / 1000) + 86400,
  };
}

/**
 * Returns date-bounded sales, schedule, menu, user activity, and performance aggregates.
 */
async function analyticsDashboardController(request, response, next) {
  const range = getDateRange(request);
  if (range.error) {
    return response.status(400).json({ error: range.error });
  }

  const { startDate, endDate, startEpoch, endEpoch } = range;
  try {
    const orderRange = [startEpoch, endEpoch];
    const [topOrderedItems, orderTotals, orderTrend] = await Promise.all([
      allQuery(
        `SELECT Food.id AS foodId, Food.name, SUM(OrderHistoryItems.quantity) AS unitsSold
         FROM OrderHistoryItems
         INNER JOIN OrderHistory ON OrderHistory.orderID = OrderHistoryItems.orderID
         INNER JOIN Food ON Food.id = OrderHistoryItems.foodID
         WHERE OrderHistory.orderDate >= ? AND OrderHistory.orderDate < ?
         GROUP BY Food.id, Food.name
         ORDER BY unitsSold DESC, Food.name
         LIMIT 10`,
        orderRange,
      ),
      getQuery(
        `SELECT COUNT(DISTINCT OrderHistory.orderID) AS totalOrders,
                COALESCE(SUM(OrderHistoryItems.costPrice * OrderHistoryItems.quantity), 0) AS totalRevenue
         FROM OrderHistory
         LEFT JOIN OrderHistoryItems ON OrderHistoryItems.orderID = OrderHistory.orderID
         WHERE OrderHistory.orderDate >= ? AND OrderHistory.orderDate < ?`,
        orderRange,
      ),
      allQuery(
        `SELECT date(OrderHistory.orderDate, 'unixepoch') AS date,
                COUNT(DISTINCT OrderHistory.orderID) AS orders,
                COALESCE(SUM(OrderHistoryItems.costPrice * OrderHistoryItems.quantity), 0) AS revenue
         FROM OrderHistory
         LEFT JOIN OrderHistoryItems ON OrderHistoryItems.orderID = OrderHistory.orderID
         WHERE OrderHistory.orderDate >= ? AND OrderHistory.orderDate < ?
         GROUP BY date(OrderHistory.orderDate, 'unixepoch')
         ORDER BY date`,
        orderRange,
      ),
    ]);

    const [staffCount, shiftCoverage, utilization] = await Promise.all([
      getQuery("SELECT COUNT(*) AS totalStaff FROM Account WHERE roleID = ?", [
        ROLE.STAFF,
      ]),
      getQuery(
        `SELECT COUNT(*) AS totalShifts,
                COALESCE(SUM(CASE WHEN assignedAccountID IS NOT NULL THEN 1 ELSE 0 END), 0) AS coveredShifts
         FROM StaffShift WHERE shiftDate >= ? AND shiftDate <= ?`,
        [startDate, endDate],
      ),
      allQuery(
        `SELECT Account.id AS accountId, Account.username,
                COALESCE(NULLIF(TRIM(COALESCE(Account.firstName, '') || ' ' || COALESCE(Account.lastName, '')), ''), Account.username) AS name,
                COUNT(StaffShift.id) AS shiftsWorked,
                ROUND(SUM((CAST(substr(StaffShift.endTime, 1, 2) AS INTEGER) * 60 + CAST(substr(StaffShift.endTime, 4, 2) AS INTEGER) -
                           CAST(substr(StaffShift.startTime, 1, 2) AS INTEGER) * 60 - CAST(substr(StaffShift.startTime, 4, 2) AS INTEGER)) / 60.0), 2) AS hoursWorked
         FROM StaffShift
         INNER JOIN Account ON Account.id = StaffShift.assignedAccountID
         WHERE StaffShift.shiftDate >= ? AND StaffShift.shiftDate <= ?
         GROUP BY Account.id, Account.username, Account.firstName, Account.lastName
         ORDER BY hoursWorked DESC, name`,
        [startDate, endDate],
      ),
    ]);

    const [menuSummary, menuProfitTotals, pricing] = await Promise.all([
      getQuery(
        `SELECT COUNT(*) AS totalMenuItems,
                COALESCE(SUM(CASE WHEN featured = 1 THEN 1 ELSE 0 END), 0) AS featuredItems,
                COALESCE(SUM(CASE WHEN discountedPrice IS NOT NULL THEN 1 ELSE 0 END), 0) AS discountedItems,
                COALESCE(SUM(CASE WHEN unitCost IS NOT NULL THEN 1 ELSE 0 END), 0) AS itemsWithCost,
                COALESCE(SUM(CASE WHEN unitCost IS NULL THEN 1 ELSE 0 END), 0) AS itemsMissingCost
         FROM Food`,
      ),
      getQuery(
        `SELECT COALESCE(SUM(theoreticalProfit), 0) AS theoreticalProfit
         FROM (
           SELECT CASE WHEN Food.unitCost IS NULL THEN 0
                       ELSE (COALESCE(Food.discountedPrice, Food.price) - Food.unitCost) *
                            COALESCE(SUM(CASE WHEN OrderHistory.orderID IS NOT NULL THEN OrderHistoryItems.quantity ELSE 0 END), 0)
                  END AS theoreticalProfit
           FROM Food
           LEFT JOIN OrderHistoryItems ON OrderHistoryItems.foodID = Food.id
           LEFT JOIN OrderHistory ON OrderHistory.orderID = OrderHistoryItems.orderID
                AND OrderHistory.orderDate >= ? AND OrderHistory.orderDate < ?
           GROUP BY Food.id, Food.price, Food.discountedPrice, Food.unitCost
         )`,
        orderRange,
      ),
      allQuery(
        `SELECT Food.id AS foodId, Food.name, Food.price, Food.discountedPrice,
                 Food.unitCost,
                 COALESCE(SUM(CASE WHEN OrderHistory.orderID IS NOT NULL THEN OrderHistoryItems.quantity ELSE 0 END), 0) AS unitsSold,
                CASE WHEN Food.unitCost IS NULL THEN NULL
                   ELSE (COALESCE(Food.discountedPrice, Food.price) - Food.unitCost) *
                     COALESCE(SUM(CASE WHEN OrderHistory.orderID IS NOT NULL THEN OrderHistoryItems.quantity ELSE 0 END), 0)
                END AS theoreticalProfit
         FROM Food
         LEFT JOIN OrderHistoryItems ON OrderHistoryItems.foodID = Food.id
         LEFT JOIN OrderHistory ON OrderHistory.orderID = OrderHistoryItems.orderID
              AND OrderHistory.orderDate >= ? AND OrderHistory.orderDate < ?
         GROUP BY Food.id, Food.name, Food.price, Food.discountedPrice, Food.unitCost
         ORDER BY unitsSold DESC, Food.name
         LIMIT 20`,
        orderRange,
      ),
    ]);

    const [
      registeredUsers,
      activeUsers,
      activeSessions,
      roleRows,
      performance,
      activityTrend,
      busiestRoutes,
    ] = await Promise.all([
      getQuery("SELECT COUNT(*) AS count FROM Account"),
      getQuery(
        `SELECT COUNT(DISTINCT accountID) AS count
         FROM SystemRequestMetric WHERE accountID IS NOT NULL AND requestAt >= ? AND requestAt < ?`,
        orderRange,
      ),
      getQuery(
        "SELECT COUNT(DISTINCT accountID) AS count FROM Session WHERE CAST(expiry AS REAL) > ?",
        [Date.now() / 1000],
      ),
      allQuery("SELECT roleID, COUNT(*) AS count FROM Account GROUP BY roleID"),
      getQuery(
        `SELECT COUNT(*) AS requestCount,
                ROUND(COALESCE(AVG(durationMs), 0), 2) AS averageResponseMs,
                COALESCE(MAX(durationMs), 0) AS maxResponseMs,
                COALESCE(SUM(CASE WHEN statusCode >= 500 THEN 1 ELSE 0 END), 0) AS serverErrors
         FROM SystemRequestMetric WHERE requestAt >= ? AND requestAt < ?`,
        orderRange,
      ),
      allQuery(
        `SELECT date(requestAt, 'unixepoch') AS date, COUNT(*) AS requests,
                ROUND(AVG(durationMs), 2) AS averageResponseMs
         FROM SystemRequestMetric WHERE requestAt >= ? AND requestAt < ?
         GROUP BY date(requestAt, 'unixepoch') ORDER BY date`,
        orderRange,
      ),
      allQuery(
        `SELECT method, route, COUNT(*) AS requests,
                ROUND(AVG(durationMs), 2) AS averageResponseMs
         FROM SystemRequestMetric WHERE requestAt >= ? AND requestAt < ?
         GROUP BY method, route ORDER BY requests DESC LIMIT 8`,
        orderRange,
      ),
    ]);

    const roleBreakdown = { customers: 0, staff: 0, managers: 0, admins: 0 };
    for (const row of roleRows) {
      if (Number(row.roleID) === ROLE.CUSTOMER)
        roleBreakdown.customers = row.count;
      if (Number(row.roleID) === ROLE.STAFF) roleBreakdown.staff = row.count;
      if (Number(row.roleID) === ROLE.MANAGER)
        roleBreakdown.managers = row.count;
      if (Number(row.roleID) === ROLE.ADMIN) roleBreakdown.admins = row.count;
    }

    const totalShifts = shiftCoverage.totalShifts || 0;
    const coveredShifts = shiftCoverage.coveredShifts || 0;
    return response.status(200).json({
      filters: { startDate, endDate },
      overview: {
        totalOrders: orderTotals.totalOrders || 0,
        totalRevenue: orderTotals.totalRevenue || 0,
        orderTrend,
      },
      popularItems: { topOrderedItems },
      staffScheduling: {
        summary: {
          totalStaff: staffCount.totalStaff || 0,
          totalShifts,
          coveredShifts,
          uncoveredShifts: totalShifts - coveredShifts,
          coverageRate: totalShifts
            ? Math.round((coveredShifts / totalShifts) * 100)
            : 0,
        },
        utilization,
      },
      menuAnalytics: {
        summary: {
          totalMenuItems: menuSummary.totalMenuItems || 0,
          featuredItems: menuSummary.featuredItems || 0,
          discountedItems: menuSummary.discountedItems || 0,
          itemsWithCost: menuSummary.itemsWithCost || 0,
          itemsMissingCost: menuSummary.itemsMissingCost || 0,
          theoreticalProfit: menuProfitTotals.theoreticalProfit || 0,
        },
        pricing,
      },
      systemUsage: {
        summary: {
          registeredUsers: registeredUsers.count || 0,
          activeUsers: activeUsers.count || 0,
          activeSessions: activeSessions.count || 0,
        },
        roleBreakdown,
        performance: {
          ...performance,
          serverErrorRate: performance.requestCount
            ? Math.round(
                (performance.serverErrors / performance.requestCount) * 10000,
              ) / 100
            : 0,
        },
        activityTrend,
        busiestRoutes,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { analyticsDashboardController };
