--insert root admin
-- user: root, password: rootmars
INSERT INTO Account (username, email, passwordHash, roleID, firstName, lastName)
VALUES ("root", "root@rootbeer.com", "$2b$10$TUmDP.pEmFyCt5WGQ5xDuev9e53FjEDZ4H7AsRW0.016OJi6mFLL2", 0, "admin", NULL);

INSERT INTO Role (name)
VALUES ("Manager"), ("Staff"), ("Customer");

INSERT INTO Role (id, name)
VALUES (0, "Admin"), (-1, "Guest");

INSERT INTO FoodCategory (category)
VALUES ("Other"), ("Beverages"), ("Food"), ("Set Meals"), ("Appetisers"), ("Mains");

INSERT INTO Food (name, description, imageLink, price, discountedPrice, foodCategory, enabled, available, featured)
VALUES ("Fried Chicken", "It's delicious", "1791950117656-stock-of-fried-chicken-foodgraphy-ai-generated-photo.jpg", 750, null, 2, 1, 1, 1);

INSERT INTO FoodCart (accountID, foodID, costPrice, quantity)
VALUES (0, 1, 750, 1),
(1, 1, 750, 1),
(2, 1, 325, 1),
;
INSERT INTO OrderHistory (orderID, accountID, orderDate)
VALUES (0, 1, 1792053499.507),
(1, 1, 1792053499.507),
(2, 2, 1792053499.507),
;
INSERT INTO OrderHistoryItems(orderID, foodID, costPrice, quantity)
VALUES (0, 1, 750, 2),
(1, 1, 750, 2),
(2, 1, 750, 5)
;
INSERT INTO FoodCoupons(accountID, foodID, discountPercent)
VALUES (2, 1, 50);