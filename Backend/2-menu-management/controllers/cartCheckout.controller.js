const { ROLE } = require("../../constants/global");

const {
  queryObjects,
  runQuery,
  getQuery,
  allQuery,
  database,
} = require("../../1-auth/controllers/register.controller");

const { Session } = require("../../1-auth/sql_objects");

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
    console.log(accountID)
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

      const costPrice = food.discountedPrice ?? food.price;

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
    //add a coupon for that food item if they have ordered at least 5 of that item total
    addFoodCoupon(accountID);
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
async function addFoodCoupon(accountID) { //adds food coupons if they are eligible
  const sql1 = `SELECT A.orderID, A.accountID, B.foodID, SUM(b.quantity) AS totalQuantity
  FROM
  OrderHistory AS A,
  OrderHistoryItems AS B
  JOIN
  A.orderID = B.orderID
  WHERE A.accountID = ?
  GROUP BY B.foodID;`
  console.log("accountID", accountID)
  let result;
  try {
    result = await allQuery(sql1, [accountID])
  }
  catch {

  }
  console.log(result)
  //for every food item determine a discount
  for (row of result) {
    let discountPercent
    if (row.totalQuantity >= 15) {
      discountPercent = 40;
    }
    else if (row.totalQuantity >= 10) {
      discountPercent = 30;
    }
    else if (row.totalQuantity >= 5) {
      discountPercent = 20;
    }
    else {
      discountPercent = 0;
    }
    row.discountPercent = discountPercent;
  }
  let valuesParameter = []
  for (row of result) {
    if (row.discountPercent != 0) { //do not add if discount is zero
      valuesParameter.push(`( ${row.accountID}, ${row.foodID}, ${row.discountPercent} )`)
    }
  }
  valuesParameter.join(",");
  const sql2 = `INSERT OR IGNORE INTO FoodCoupons (accountID, foodID, discountPercent)
  VALUES ${valuesParameter};`
  try {
    await runQuery(sql2, [])
  }
  catch {

  }
}

module.exports = { cartCheckoutController };
