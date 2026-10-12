CREATE SCHEMA Restaurant;
USE Restaurant;

CREATE TABLE Role (
    id INT PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50)
);
INSERT INTO Role (name)
VALUES ("Admin"), ("Manager"), ("Staff"), ("Customer");

CREATE TABLE Account (
    id INT PRIMARY KEY AUTOINCREMENT
    username VARCHAR(50)
    passwordHash CHAR(60)
    FOREIGN KEY (roleID) REFERENCES Role(id)
);

