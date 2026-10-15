const {
  allQuery,
  database,
  runQuery,
} = require("../1-auth/controllers/register.controller");

function executeSchema(sql) {
  return new Promise((resolve, reject) => {
    database.exec(sql, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

async function initializeAnalyticsSchema() {
  const foodColumns = await allQuery("PRAGMA table_info(Food)");
  if (!foodColumns.some((column) => column.name === "unitCost")) {
    await runQuery("ALTER TABLE Food ADD COLUMN unitCost INTEGER");
  }

  await executeSchema(`
    CREATE TABLE IF NOT EXISTS SystemRequestMetric (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requestAt INTEGER NOT NULL,
      method TEXT NOT NULL,
      route TEXT NOT NULL,
      statusCode INTEGER NOT NULL,
      durationMs INTEGER NOT NULL,
      accountID INTEGER,
      FOREIGN KEY (accountID) REFERENCES Account(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_SystemRequestMetric_requestAt
      ON SystemRequestMetric (requestAt);

    CREATE INDEX IF NOT EXISTS idx_SystemRequestMetric_account_requestAt
      ON SystemRequestMetric (accountID, requestAt);

    CREATE INDEX IF NOT EXISTS idx_OrderHistory_orderDate
      ON OrderHistory (orderDate);

    CREATE INDEX IF NOT EXISTS idx_OrderHistoryItems_food_order
      ON OrderHistoryItems (foodID, orderID);

    CREATE INDEX IF NOT EXISTS idx_OrderHistoryItems_order
      ON OrderHistoryItems (orderID);
  `);
}

module.exports = { initializeAnalyticsSchema };
