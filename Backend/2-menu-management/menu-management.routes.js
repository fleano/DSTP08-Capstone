const { Router } = require("express");

const {
  uploadFileEnd,
  addFoodMiddleware,
  editFoodMiddleware,
} = require("./controllers/uploadFile.controller");
const { upload } = require("./middleware");
const { decodeToken, Session } = require("../1-auth/sql_objects");
const { Food, FoodCategory, FoodCart } = require("./food_objects");
const {
  cartCheckoutController,
} = require("./controllers/cartCheckout.controller");

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

router.post("/cart/checkout", cartCheckoutController);

// Some of these routes need token to be meaningful
router.post("/cart", FoodCart.getCartByAccountID);
router.post("/clearCart", FoodCart.clearCart);
router.post("/checkout", FoodCart.checkout, FoodCart.clearCart);
router.put("/editCart", FoodCart.editFoodInCart);

// Protected Routes
// Add authentication middleware to protect these routes
// Session.adminPriviliege, Session.customerPriviliege, etc is authentication middleware
router.post(
  "/upload",
  Session.managerPlusPrivilege,
  upload.single("file"),
  addFoodMiddleware,
  uploadFileEnd,
);
router.put(
  "/editFood",
  Session.managerPlusPrivilege,
  upload.single("file"),
  editFoodMiddleware,
  uploadFileEnd,
);

router.delete("/deleteFood", Session.managerPlusPrivilege, async (req, res) => {
  const foodId = req.body.id;
  const food = new Food(foodId);
  const success = await food.deleteSelf();
  if (success) {
    return res.status(200).json({ message: "Food item deleted successfully" });
  } else {
    return res.status(500).json({ error: "Failed to delete food item" });
  }
});

module.exports = { menuRoutes: router };
