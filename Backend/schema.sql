--CREATE SCHEMA Restaurant;
--USE Restaurant;
CREATE TABLE IF NOT EXISTS Role (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50)
);
CREATE TABLE IF NOT EXISTS Account (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    passwordHash CHAR(60) NOT NULL,
    roleID INTEGER,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    FOREIGN KEY (roleID) REFERENCES Role(id)
);
CREATE TABLE IF NOT EXISTS Session (
    accountID INTEGER NOT NULL,
    token TEXT NOT NULL,
    expiry DATE NOT NULL
);
CREATE TABLE IF NOT EXISTS BanReason (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    accountID INTEGER,
    reason VARCHAR(300),
    eventDate INTEGER NOT NULL, --unix epoch
    expiry INTEGER, --unix epoch
    FOREIGN KEY (accountID) REFERENCES Account(id)
);
CREATE TABLE IF NOT EXISTS FoodCategory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category VARCHAR(50)
);
CREATE TABLE IF NOT EXISTS Food (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50),
    description VARCHAR(1000),
    imageLink VARCHAR(200),
    price INTEGER DEFAULT 0, -- stored as cents, so divide by 100 for dollars and cents e.g. 200 is $2.00
    discountedPrice INTEGER,-- if null, display normal price, otherwise display discountedPrice
    foodCategory INTEGER DEFAULT 0,
    enabled INTEGER DEFAULT 0, --affects display of item
    available INTEGER DEFAULT 0, --affects if item is sold out or not
    featured INTEGER DEFAULT 0, --affects if item is FEATURED on /featured
    FOREIGN KEY (foodCategory) REFERENCES FoodCategory(id)
);
CREATE TABLE IF NOT EXISTS FoodCart (
    accountID INTEGER NOT NULL, --accepts either a registered user or a temporary guest user
    foodID INTEGER NOT NULL,
    costPrice INTEGER NOT NULL, --declared as price at time of adding
    quantity INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS OrderHistory ( --must include price
    orderID INTEGER PRIMARY KEY AUTOINCREMENT, --order ID
    orderDate INTEGER NOT NULL, --unix epoch
    accountID INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS OrderHistoryItems(
    orderID INTEGER NOT NULL,
    foodID INTEGER NOT NULL,
    costPrice INTEGER NOT NULL, --declared as price at time of adding
    quantity INTEGER NOT NULL,
    FOREIGN KEY (orderID) REFERENCES OrderHistory(orderID)
);
CREATE TABLE IF NOT EXISTS FoodCoupons( --if user orders 5 items in the history, give them a coupon?
    accountID INTEGER NOT NULL,
    foodID INTEGER NOT NULL,
    discountPercent INTEGER NOT NULL,
    FOREIGN KEY (accountID) REFERENCES Account(id),
    FOREIGN KEY (foodID) REFERENCES Food(id)
);
CREATE TABLE IF NOT EXISTS Schedule(
    date INTEGER NOT NULL, --unix epoch
    note TEXT NOT NULL
);
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
