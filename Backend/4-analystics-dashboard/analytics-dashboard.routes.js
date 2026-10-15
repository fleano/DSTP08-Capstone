const { Router } = require("express");
const {
  analyticsDashboardController,
} = require("./controllers/analytics-dashboard.controller.js");

const router = Router();

router.get("/test", async (request, response, next) => {
  response.status(200).json({ message: "Test route is working!" });
});

router.get("/dashboard", analyticsDashboardController);
module.exports = { analyticsRoutes: router };
