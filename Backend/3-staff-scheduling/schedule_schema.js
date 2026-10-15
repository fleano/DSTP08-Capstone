const {
  runQuery,
  database,
} = require("../1-auth/controllers/register.controller");

const SCHEDULE_ROLES = ["Server", "Host", "Cleaner", "Cook", "Cashier"];

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

async function initializeStaffSchedulingSchema() {
  await executeSchema(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS ShiftRole (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS StaffShift (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shiftDate TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      roleID INTEGER NOT NULL,
      assignedAccountID INTEGER,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (date(shiftDate) IS NOT NULL),
      CHECK (startTime < endTime),
      FOREIGN KEY (roleID) REFERENCES ShiftRole(id),
      FOREIGN KEY (assignedAccountID) REFERENCES Account(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_StaffShift_date_time
      ON StaffShift (shiftDate, startTime);

    CREATE INDEX IF NOT EXISTS idx_StaffShift_assignee_date
      ON StaffShift (assignedAccountID, shiftDate);

    CREATE TRIGGER IF NOT EXISTS update_StaffShift_updatedAt
    AFTER UPDATE ON StaffShift
    FOR EACH ROW
    BEGIN
      UPDATE StaffShift
      SET updatedAt = CURRENT_TIMESTAMP
      WHERE id = NEW.id;
    END;
  `);

  for (const roleName of SCHEDULE_ROLES) {
    await runQuery("INSERT OR IGNORE INTO ShiftRole (name) VALUES (?)", [
      roleName,
    ]);
  }
}

module.exports = { initializeStaffSchedulingSchema };
