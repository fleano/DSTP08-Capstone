const { Router } = require("express");

const { uploadFileEnd, addFoodMiddleware } = require("./controllers/uploadFile.controller");
const { upload } = require("./middleware");
const { decodeToken } = require("../1-auth/sql_objects")
const {Food, FoodCategory} = require("./food_objects")

const router = Router();

// Public Routes
router.get("/test", Food.getAllFood, async (request, response) => {
  
  response.status(200).json({ message: response.locals.foodList });
  //response.status(200).json({ message: "Test route is working!" });
});

// Protected Routes

// TODO: Add authentication middleware to protect this route
//decodeToken is authentication middleware
router.post("/upload", decodeToken, upload.single("file"), addFoodMiddleware, uploadFileEnd);
module.exports = { menuRoutes: router };
