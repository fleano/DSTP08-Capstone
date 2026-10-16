const {
  runQuery,
  allQuery,
} = require("../1-auth/controllers/register.controller");

// Coupon rule: once a customer has bought THRESHOLD or more of one dish in
// total (summed over OrderHistoryItems), they get PERCENT% off that dish.
const THRESHOLD = 5;
const PERCENT = 10;

// Makes sure (accountID, foodID) is unique so coupons can't be duplicated.
// schema.sql only runs on a fresh database, so this also covers existing ones.
async function initializeCouponSchema() {
  try {
    await runQuery(
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_coupon_unique
       ON FoodCoupons(accountID, foodID)`,
      [],
    );
  } catch (error) {
    // Usually means duplicate rows already exist; clean them up, then restart.
    console.error("Could not create coupon unique index:", error);
  }
}

async function awardCoupons(accountID) {
  // No coupons for guests (-1) or unknown accounts
  if (accountID == null || accountID <= 0) return;

  try {
    const eligible = await allQuery(
      `SELECT ohi.foodID, SUM(ohi.quantity) AS total
         FROM OrderHistoryItems ohi
         JOIN OrderHistory oh ON oh.orderID = ohi.orderID
        WHERE oh.accountID = ?
        GROUP BY ohi.foodID
       HAVING total >= ?`,
      [accountID, THRESHOLD],
    );

    for (const row of eligible) {
      // INSERT OR IGNORE keeps any existing (possibly manager-set) coupon
      await runQuery(
        `INSERT OR IGNORE INTO FoodCoupons (accountID, foodID, discountPercent)
         VALUES (?, ?, ?)`,
        [accountID, row.foodID, PERCENT],
      );
    }
  } catch (error) {
    // A coupon failure must never break checkout
    console.error("awardCoupons failed:", error);
  }
}

module.exports = { awardCoupons, initializeCouponSchema };
