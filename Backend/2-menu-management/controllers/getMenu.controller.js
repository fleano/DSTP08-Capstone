const { ROLE } = require("../../constants/global");

const {
  queryObjects,
  runQuery,
  getQuery,
  allQuery,
  database,
} = require("../../1-auth/controllers/register.controller");

const { Session } = require("../../1-auth/sql_objects");

async function getMenuController(request, response, next) {
  try {
    const token = request.get("Authorization");

    let accountID = null;

    if (token) {
      accountID = await Session.getIDByToken(token);
    }

    // Get all food items
    let foods = await allQuery(`
      SELECT *
      FROM Food
    `);

    // Convert cents to dollars and prepend image path
    foods = foods.map((food) => ({
      ...food,
      imageLink: `uploads/foodImages/${food.imageLink}`,
      price: food.price / 100,
      discountedPrice:
        food.discountedPrice != null ? food.discountedPrice / 100 : null,
      unitCost: food.unitCost != null ? food.unitCost / 100 : null,
    }));

    // Guest users
    if (accountID == null) {
      const menu = foods.map((food) => ({
        ...food,
        customerDiscountPercent: 0,
        finalPrice: food.discountedPrice ?? food.price,
      }));

      return response.status(200).json({
        message: menu,
      });
    }

    // Logged-in users: fetch coupons
    const coupons = await allQuery(
      `
      SELECT
        foodID,
        discountPercent
      FROM FoodCoupons
      WHERE accountID = ?
      `,
      [accountID],
    );

    const couponMap = {};
    console.log("Current account:", accountID);

    coupons.forEach((coupon) => {
      console.log(
        "Coupon:",
        coupon.accountID,
        coupon.foodID,
        coupon.discountPercent,
      );
    });
    coupons.forEach((coupon) => {
      couponMap[coupon.foodID] = coupon.discountPercent;
    });

    const menu = foods.map((food) => {
      const customerDiscountPercent = couponMap[food.id] || 0;

      let finalPrice;

      // Customer coupon overrides Food.discountedPrice
      if (customerDiscountPercent > 0) {
        finalPrice = food.price * ((100 - customerDiscountPercent) / 100);
      } else {
        finalPrice = food.discountedPrice ?? food.price;
      }

      return {
        ...food,

        // Override discountedPrice for frontend compatibility
        discountedPrice:
          customerDiscountPercent > 0
            ? Math.round(finalPrice * 100) / 100
            : food.discountedPrice,

        customerDiscountPercent,

        finalPrice: Math.round(finalPrice * 100) / 100,
      };
    });

    return response.status(200).json({
      message: menu,
    });
  } catch (error) {
    console.error(error);

    return response.status(500).json({
      error: "Failed to load menu",
    });
  }
}

module.exports = {
  getMenuController,
};
