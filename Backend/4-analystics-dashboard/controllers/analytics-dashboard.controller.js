const {
  queryObjects,
  runQuery,
  getQuery,
  allQuery,
  database,
} = require("../../1-auth/controllers/register.controller");
const { ROLE } = require("../../constants/global");

/**
 * Analytics dashboard controller
 * @param {import('express').Request} request Incoming HTTP request.
 * @param {import('express').Response} response Outgoing HTTP response.
 * @param {import('express').NextFunction} next Passes control to the next middleware.
 */
async function analyticsDashboardController(request, response, next) {
  try {
    // 1. POPULAR ITEMS
    const topOrderedItems = await allQuery(`
      SELECT
        Food.id AS foodId,
        Food.name,
        SUM(OrderHistoryItems.quantity) AS orders
      FROM OrderHistoryItems
      JOIN Food
        ON Food.id = OrderHistoryItems.foodID
      GROUP BY Food.id
      ORDER BY orders DESC
      LIMIT 5
    `);

    // ORDERS

    const totalOrders = await getQuery(`
      SELECT COUNT(*) AS totalOrders
      FROM OrderHistory
    `);

    const totalRevenue = await getQuery(`
      SELECT
        COALESCE(
          SUM(costPrice * quantity),
          0
        ) AS totalRevenue
      FROM OrderHistoryItems
    `);
    // 2. STAFF SCHEDULING ANALYTICS
    // TODO: ADD STAFF SCHEDULING ANALYTICS

    // 3. MENU ANALYTICS

    const totalMenuItems = await getQuery(`
      SELECT COUNT(*) AS totalMenuItems
      FROM Food
    `);

    const featuredItems = await getQuery(`
      SELECT COUNT(*) AS featuredItems
      FROM Food
      WHERE featured = 1
    `);

    const discountedItems = await getQuery(`
      SELECT COUNT(*) AS discountedItems
      FROM Food
      WHERE discountedPrice IS NOT NULL
    `);

    const pricing = await allQuery(`
      SELECT
        id AS foodId,
        name,
        price,
        discountedPrice
      FROM Food
      LIMIT 10
    `);

    // 4. SYSTEM USAGE REPORTS

    const registeredUsers = await getQuery(`
      SELECT COUNT(*) AS count
      FROM Account
    `);

    const roleBreakdownRows = await allQuery(`
    SELECT
        Account.roleID,
        COUNT(*) AS count
    FROM Account
    GROUP BY Account.roleID
    `);

    const roleBreakdown = {
      customers: 0,
      staff: 0,
      managers: 0,
      admins: 0,
    };

    roleBreakdownRows.forEach((row) => {
      switch (Number(row.roleID)) {
        case ROLE.CUSTOMER:
          roleBreakdown.customers = row.count;
          break;

        case ROLE.STAFF:
          roleBreakdown.staff = row.count;
          break;

        case ROLE.MANAGER:
          roleBreakdown.managers = row.count;
          break;

        case ROLE.ADMIN:
          roleBreakdown.admins = row.count;
          break;
      }
    });

    response.status(200).json({
      popularItems: {
        topOrderedItems,
      },

      staffScheduling: {
        summary: {
          totalStaff: roleBreakdown.staff,
          totalShifts: 0,
          coveredShifts: 0,
          uncoveredShifts: 0,
          coverageRate: 0,
        },

        utilization: [],
      },

      menuAnalytics: {
        summary: {
          totalMenuItems: totalMenuItems.totalMenuItems,

          featuredItems: featuredItems.featuredItems,

          discountedItems: discountedItems.discountedItems,
        },

        pricing,
      },

      systemUsage: {
        summary: {
          registeredUsers: registeredUsers.count,

          activeUsersToday: 0,

          totalSessions: 0,
        },

        roleBreakdown,
      },

      overview: {
        totalOrders: totalOrders.totalOrders,

        totalRevenue: totalRevenue.totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { analyticsDashboardController };
