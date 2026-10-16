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
const { getMenuController } = require("./controllers/getMenu.controller.js");
const { runQuery } = require("../1-auth/controllers/register.controller");

const router = Router();

// Public Routes

router.get("/test", Food.getAllFood, async (request, response) => {
  response.status(200).json({ message: response.locals.foodList });
  //response.status(200).json({ message: "Test route is working!" });
});
router.get("/all", Food.getAllFood, async (request, response) => {
  response.status(200).json({ message: response.locals.foodList });
});
router.get("/account/all", getMenuController);
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

// Manager+ can assign (or update) a coupon for one customer and one dish
router.post("/coupons", Session.managerPlusPrivilege, async (req, res) => {
  const { accountID, foodID, discountPercent } = req.body;
  if (
    !Number.isInteger(accountID) ||
    !Number.isInteger(foodID) ||
    !(discountPercent > 0 && discountPercent <= 100)
  ) {
    return res.status(400).json({ error: "Invalid coupon data" });
  }
  try {
    await runQuery(
      `INSERT INTO FoodCoupons (accountID, foodID, discountPercent) VALUES (?, ?, ?)
       ON CONFLICT(accountID, foodID) DO UPDATE SET discountPercent = excluded.discountPercent`,
      [accountID, foodID, discountPercent],
    );
    return res.status(201).json({ message: "Coupon saved" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to save coupon" });
  }
});

module.exports = { menuRoutes: router };
