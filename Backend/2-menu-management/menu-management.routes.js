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
const { runQuery, allQuery } = require("../1-auth/controllers/register.controller");

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

// Manager+ list of all coupons (who, which dish, how much)
router.get("/coupons", Session.managerPlusPrivilege, async (req, res) => {
  try {
    const rows = await allQuery(
      `SELECT fc.accountID, a.username, fc.foodID, f.name AS foodName, fc.discountPercent
         FROM FoodCoupons fc
         JOIN Account a ON a.id = fc.accountID
         JOIN Food f ON f.id = fc.foodID
        ORDER BY a.username, f.name`,
      [],
    );
    return res.status(200).json({ message: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load coupons" });
  }
});

// Manager+ list of customer accounts (role 3) to pick from
router.get("/coupons/customers", Session.managerPlusPrivilege, async (req, res) => {
  try {
    const rows = await allQuery(
      `SELECT id, username, firstName, lastName FROM Account WHERE roleID = 3 ORDER BY username`,
      [],
    );
    return res.status(200).json({ message: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load customers" });
  }
});

router.delete("/coupons", Session.managerPlusPrivilege, async (req, res) => {
  const { accountID, foodID } = req.body;
  if (!Number.isInteger(accountID) || !Number.isInteger(foodID)) {
    return res.status(400).json({ error: "Invalid coupon data" });
  }
  try {
    await runQuery(
      `DELETE FROM FoodCoupons WHERE accountID = ? AND foodID = ?`,
      [accountID, foodID],
    );
    return res.status(200).json({ message: "Coupon removed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to remove coupon" });
  }
});

// Manager+ view: what each customer has ordered, per dish, to guide coupons
router.get("/coupons/order-summary", Session.managerPlusPrivilege, async (req, res) => {
  try {
    const rows = await allQuery(
      `SELECT oh.accountID,
              a.username,
              ohi.foodID,
              f.name AS foodName,
              SUM(ohi.quantity) AS totalQuantity,
              COUNT(DISTINCT oh.orderID) AS orderCount,
              SUM(ohi.quantity * ohi.costPrice) AS totalSpentCents,
              fc.discountPercent AS currentDiscount
         FROM OrderHistory oh
         JOIN OrderHistoryItems ohi ON ohi.orderID = oh.orderID
         JOIN Account a ON a.id = oh.accountID
         LEFT JOIN Food f ON f.id = ohi.foodID
         LEFT JOIN FoodCoupons fc
                ON fc.accountID = oh.accountID AND fc.foodID = ohi.foodID
        WHERE a.roleID = 3
        GROUP BY oh.accountID, ohi.foodID
        ORDER BY a.username, totalQuantity DESC`,
      [],
    );
    const summary = rows.map((r) => ({
      accountID: r.accountID,
      username: r.username,
      foodID: r.foodID,
      foodName: r.foodName,
      totalQuantity: r.totalQuantity,
      orderCount: r.orderCount,
      totalSpent: r.totalSpentCents / 100,
      currentDiscount: r.currentDiscount ?? 0,
    }));
    return res.status(200).json({ message: summary });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load order summary" });
  }
});

module.exports = { menuRoutes: router };
