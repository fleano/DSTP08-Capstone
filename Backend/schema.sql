CREATE SCHEMA Restaurant;
USE Restaurant;

CREATE TABLE Role (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50)
);
INSERT INTO Role (name)
VALUES ("Admin"), ("Manager"), ("Staff"), ("Customer");

CREATE TABLE Account (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL, --is also email
    passwordHash CHAR(60) NOT NULL,
    roleID INTEGER,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    FOREIGN KEY (roleID) REFERENCES Role(id)
);
--insert root admin
-- user: root, password: rootmars
INSERT INTO Account (username, passwordHash, roleID, firstName, lastName)
VALUES ("root", "$2b$10$TUmDP.pEmFyCt5WGQ5xDuev9e53FjEDZ4H7AsRW0.016OJi6mFLL2", 0, "admin", NULL);
CREATE TABLE Sessions (
    accountID INTEGER UNIQUE NOT NULL, --accepts either a registered user or a temporary guest user
    sessions TEXT --stores JSON as - session: [{token, expiryDate}, ...]
);
CREATE TABLE BanReason (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    accountID INTEGER,
    reason VARCHAR(300),
    eventDate INTEGER NOT NULL, --unix epoch
    expiryDate INTEGER --unix epoch
    FOREIGN KEY (accountID) REFERENCES Account(id)
);

CREATE TABLE FoodCategory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category VARCHAR(50)
);
INSERT INTO FoodCategory (category)
VALUES ("Other"), ("Drink"), ("Food"), ("Set Meal");

CREATE TABLE Food (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50),
    description VARCHAR(1000),
    imageLink VARCHAR(200),
    price INTEGER DEFAULT 0, -- stored as cents, so divide by 100 for dollars and cents e.g. 200 is $2.00
    discountedPrice INTEGER,-- if null, display normal price, otherwise display discountedPrice
    foodCategory INTEGER DEFAULT 0,
    enabled BOOLEAN CHECK (done IN (0, 1)) DEFAULT 0, --affects display of item
    available BOOLEAN CHECK (done IN (0, 1)) DEFAULT 0, --affects if item is sold out or not
    FOREIGN KEY (foodCategory) REFERENCES FoodCategory(id)
);
CREATE TABLE FoodCart(
    accountID INTEGER UNIQUE NOT NULL, --accepts either a registered user or a temporary guest user
    items TEXT --stores as JSON - items: {foodID:, quantity:} --e.g. items: [{1, 5}] means ID 1, qty 5
);

CREATE TABLE OrderHistory( --must include price
    id INTEGER PRIMARY KEY AUTOINCREMENT, --order ID
    orderDate INTEGER, --unix epoch
    accountID INTEGER UNIQUE NOT NULL, --accepts either a registered user or a temporary guest user
    items TEXT --stores as JSON - items: {foodID:, quantity:, price:} --e.g. items: [{1, 5, 200}] means ID 1, qty 5, $2.00
);

