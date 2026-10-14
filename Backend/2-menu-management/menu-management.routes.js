const { Router } = require("express");

const { uploadFileEnd, addFoodMiddleware, editFoodMiddleware } = require("./controllers/uploadFile.controller");
const { upload } = require("./middleware");
const { decodeToken, Session } = require("../1-auth/sql_objects")
const {Food, FoodCategory, FoodCart} = require("./food_objects")

const router = Router();

// Public Routes
router.get("/test", Food.getAllFood, async (request, response) => {
  
  response.status(200).json({ message: response.locals.foodList });
  //response.status(200).json({ message: "Test route is working!" });
});
router.get("/all", Food.getAllFood, async (request, response) => {
  response.status(200).json({ message: response.locals.foodList });
});
router.get("/featured", Food.getAllFoodFeatured, async (request, response) => {
  response.status(200).json({ message: response.locals.foodList });
});
router.post("/cart", FoodCart.getCartByAccountID);
router.post("/clearCart", FoodCart.clearCart);
router.post("/checkout", FoodCart.checkout, FoodCart.clearCart);
// Protected Routes

// TODO: Add authentication middleware to protect this route
//decodeToken is authentication middleware
router.post("/upload", Session.adminPrivilege, upload.single("file"), addFoodMiddleware, uploadFileEnd);
router.put("/editFood", Session.adminPrivilege, upload.single("file"), editFoodMiddleware, uploadFileEnd);
module.exports = { menuRoutes: router };
