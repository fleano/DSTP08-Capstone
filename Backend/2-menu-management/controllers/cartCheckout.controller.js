const { ROLE } = require("../../constants/global");

const {
  queryObjects,
  runQuery,
  getQuery,
  allQuery,
  database,
} = require("../../1-auth/controllers/register.controller");

const { Session } = require("../../1-auth/sql_objects");
const { awardCoupons } = require("../coupons");

async function cartCheckoutController(request, response, next) {
  try {
    const token = request.get("Authorization");

    let accountID = -1;

    // Logged-in user
    if (token) {
      accountID = await Session.getIDByToken(token);

      if (accountID == null) {
        return response.status(401).json({
          error: "Invalid session",
        });
      }
    }

    const items = request.body.items;

    if (!Array.isArray(items) || items.length === 0) {
      return response.status(400).json({
        error: "Cart is empty",
      });
    }

    // Create OrderHistory row

    const orderDate = Math.floor(Date.now() / 1000);

    const orderResult = await runQuery(
      `
      INSERT INTO OrderHistory
      (
        orderDate,
        accountID
      )
      VALUES (?, ?)
      `,
      [orderDate, accountID],
    );

    const orderID = orderResult.id;

    // Process all cart items

    for (const item of items) {
      const food = await getQuery(
        `
        SELECT
          id,
          price,
          discountedPrice
        FROM Food
        WHERE id = ?
        `,
        [item.foodID],
      );

      if (!food) {
        continue;
      }

      // Prices are in cents. A customer coupon overrides Food.discountedPrice,
      // matching getMenuController.
      let costPrice = food.discountedPrice ?? food.price;

      if (accountID > 0) {
        const coupon = await getQuery(
          `SELECT discountPercent FROM FoodCoupons WHERE accountID = ? AND foodID = ?`,
          [accountID, food.id],
        );
        if (coupon && coupon.discountPercent > 0) {
          costPrice = Math.round(
            (food.price * (100 - coupon.discountPercent)) / 100,
          );
        }
      }

      await runQuery(
        `
        INSERT INTO OrderHistoryItems
        (
          orderID,
          foodID,
          costPrice,
          quantity
        )
        VALUES (?, ?, ?, ?)
        `,
        [orderID, food.id, costPrice, item.quantity],
      );
    }

    // Grant any coupons this order has earned
    await awardCoupons(accountID);

    return response.status(201).json({
      message: "Checkout successful",
      orderID,
    });
  } catch (error) {
    console.error(error);

    return response.status(500).json({
      error: "Checkout failed",
    });
  }
}

module.exports = { cartCheckoutController };
