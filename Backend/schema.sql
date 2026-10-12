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
    username VARCHAR(50) NOT NULL,
    passwordHash CHAR(60) NOT NULL,
    FOREIGN KEY (roleID) REFERENCES Role(id),
    firstName VARCHAR(100),
    lastName VARCHAR(100)
);
CREATE TABLE Sessions (
    accountID INTEGER UNIQUE NOT NULL, --accepts either a registered user or a temporary guest user
    sessions TEXT --stores JSON as - session: {token:, expiryDate:}
);
CREATE TABLE BanReason (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    FOREIGN KEY (accountID) REFERENCES Account(id),
    reason VARCHAR(300),
    eventDate INTEGER NOT NULL, --unix epoch
    expiryDate INTEGER --unix epoch
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
    price INTEGER DEFAULT 0 -- stored as cents, so divide by 100 for dollars and cents e.g. 200 is $2.00
    FOREIGN KEY (foodCategory) REFERENCES FoodCategory(id) DEFAULT 0,
    enabled BOOLEAN CHECK (done IN (0, 1)) DEFAULT 0, --affects display of item
    available BOOLEAN CHECK (done IN (0, 1)) DEFAULT 0 --affects if item is sold out or not
);
CREATE TABLE FoodCart(
    accountID INTEGER UNIQUE NOT NULL, --accepts either a registered user or a temporary guest user
    items TEXT --stores as JSON - items: {foodID:, quantity:} --e.g. items: [1,6,18,25]
);




