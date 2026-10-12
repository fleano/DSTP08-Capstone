CREATE SCHEMA Restaurant;
USE Restaurant;

CREATE TABLE Role (
    id INT PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50)
);
INSERT INTO Role (name)
VALUES ("Admin"), ("Manager"), ("Staff"), ("Customer");

CREATE TABLE Account (
    id INT PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50),
    passwordHash CHAR(60),
    FOREIGN KEY (roleID) REFERENCES Role(id)
);

CREATE TABLE FoodCategory (
    id INT PRIMARY KEY AUTOINCREMENT,
    category VARCHAR(50)
);
INSERT INTO FoodCategory (category)
VALUES ("Other"), ("Drink"), ("Food"), ("Set Meal");

CREATE TABLE Food (
    id INT PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50),
    description VARCHAR(1000),
    imageLink VARCHAR(200),
    FOREIGN KEY (foodCategory) REFERENCES FoodCategory(id) DEFAULT 0,
    enabled BOOLEAN CHECK (done IN (0, 1)) DEFAULT 0, --affects display of item
    available BOOLEAN CHECK (done IN (0, 1)) DEFAULT 0 --affects if item is sold out or not
);

