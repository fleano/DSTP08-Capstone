// analyticsData.js

export const analyticsData = {
  popularItems: {
    topOrderedItems: [],
  },
  staffScheduling: {
    summary: {
      totalStaff: 2,
      totalShifts: 0,
      coveredShifts: 0,
      uncoveredShifts: 0,
      coverageRate: 0,
    },
    utilization: [],
  },
  menuAnalytics: {
    summary: {
      totalMenuItems: 4,
      featuredItems: 1,
      discountedItems: 3,
    },
    pricing: [
      {
        foodId: 1,
        name: "Fried Chicken 4",
        price: 1037,
        discountedPrice: null,
      },
      {
        foodId: 2,
        name: "1",
        price: null,
        discountedPrice: 1037,
      },
      {
        foodId: 3,
        name: "1",
        price: null,
        discountedPrice: 1037,
      },
      {
        foodId: 4,
        name: "1",
        price: null,
        discountedPrice: 1037,
      },
    ],
  },
  systemUsage: {
    summary: {
      registeredUsers: 7,
      activeUsersToday: 0,
      totalSessions: 0,
    },
    roleBreakdown: {
      customers: 1,
      staff: 2,
      managers: 3,
      admins: 1,
    },
  },
  overview: {
    totalOrders: 0,
    totalRevenue: 0,
  },
};
