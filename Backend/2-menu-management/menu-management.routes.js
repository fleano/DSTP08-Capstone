const { Router } = require("express");

const { uploadFile } = require("./controllers/uploadFile.controller");
const { upload } = require("./middleware");

const router = Router();

// Public Routes
router.get("/test", async (request, response) => {
  response.status(200).json({ message: "Test route is working!" });
});

// Protected Routes

// TODO: Add authentication middleware to protect this route
router.post("/upload", upload.single("file"), uploadFile);
module.exports = { menuRoutes: router };
