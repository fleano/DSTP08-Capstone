const { Router } = require("express");
const {
  analyticsDashboardController,
} = require("./controllers/analytics-dashboard.controller.js");
const { Session } = require("../1-auth/sql_objects.js");

const router = Router();

router.get("/test", async (request, response, next) => {
  response.status(200).json({ message: "Test route is working!" });
});

router.get(
  "/dashboard",
  Session.managerPlusPrivilege,
  analyticsDashboardController,
);
module.exports = { analyticsRoutes: router };
