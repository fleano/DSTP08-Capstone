const express = require("express");
const path = require("path");
const fs = require("fs");

const { requestLogger } = require("./middleware/logger");
const { corsMiddleware } = require("./middleware/cors");

const {
  Role,
  Account,
  AccountPasswordH,
  Session,
  checkUserCredentials,
  decodeToken,
  registerUser,
} = require("./1-auth/sql_objects.js");

const { authRoutes } = require("./1-auth/auth.routes");
const { menuRoutes } = require("./2-menu-management/menu-management.routes");
const {
  schedulingRoutes,
} = require("./3-staff-scheduling/staff-scheduling.routes");
const {
  initializeStaffSchedulingSchema,
} = require("./3-staff-scheduling/schedule_schema");
const {
  analyticsRoutes,
} = require("./4-analystics-dashboard/analytics-dashboard.routes.js");

const app = express();
const port = process.env.PORT || 3000;

const uploadsDirectory = path.join(__dirname, "uploads", "foodImages");
const placeholderImage = path.join(__dirname, "uploads", "placeholder.jpg");
app.use(corsMiddleware);
app.use(
  "/uploads/foodImages",
  express.static(uploadsDirectory, { fallthrough: true }),
  (req, res) => {
    //console.log(placeholderImage)
    res.status(200).sendFile(placeholderImage);
  },
);
app.use(express.json());
app.use(requestLogger);

app.use("/auth", authRoutes);
app.use("/menu", menuRoutes);
app.use("/scheduling", schedulingRoutes);
app.use("/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).send("Ok");
});

async function startServer() {
  try {
    await initializeStaffSchedulingSchema();
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running at http://localhost:${port}/`);
    });
  } catch (error) {
    console.error("Could not initialize staff scheduling tables:", error);
    process.exitCode = 1;
  }
}

startServer();
