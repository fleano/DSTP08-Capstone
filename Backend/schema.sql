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
    FOREIGN KEY (foodCategory) REFERENCES FoodCategory(id)
);
CREATE TABLE IF NOT EXISTS FoodCart (
    accountID INTEGER UNIQUE NOT NULL, --accepts either a registered user or a temporary guest user
    items TEXT --stores as JSON - items: {foodID:, quantity:} --e.g. items: [{1, 5}] means ID 1, qty 5
);
CREATE TABLE IF NOT EXISTS OrderHistory ( --must include price
    id INTEGER PRIMARY KEY AUTOINCREMENT, --order ID
    orderDate INTEGER, --unix epoch
    accountID INTEGER UNIQUE NOT NULL, 
    items TEXT --stores as JSON - items: {foodID:, quantity:, price:} --e.g. items: [{1, 5, 200}] means ID 1, qty 5, $2.00
);