--insert root admin
-- user: root, password: rootmars
INSERT OR IGNORE INTO Account (id, username, email, passwordHash, roleID, firstName, lastName)
VALUES (0, "root", "root@rootbeer.com", "$2b$10$TUmDP.pEmFyCt5WGQ5xDuev9e53FjEDZ4H7AsRW0.016OJi6mFLL2", 0, "admin", NULL),
(1, "guest", "guest@rootbeer.com", "$2b$10$TUmDP.pEmFyCt5WGQ5xDuev9e53FjEDZ4H7AsRW0.016OJi6mFLL2", -1, "guest", NULL),
(2, "customer", "customer@rootbeer.com", "$2b$10$TUmDP.pEmFyCt5WGQ5xDuev9e53FjEDZ4H7AsRW0.016OJi6mFLL2", 3, "customer1", NULL);

INSERT OR IGNORE INTO Role (id, name)
VALUES (0, "Admin"), (-1, "Guest"), (1, "Manager"), (2, "Staff"), (3, "Customer");

INSERT OR IGNORE INTO FoodCategory (id, category)
VALUES
(1, "Other"),
(2, "Beverages"),
(3, "Food"),
(4, "Set Meals"),
(5, "Appetisers"),
(6, "Mains");

INSERT OR IGNORE INTO Food (id, name, description, imageLink, price, discountedPrice, foodCategory, enabled, available, featured)
VALUES (1, "Fried Chicken", "It's delicious", "1791950117656-stock-of-fried-chicken-foodgraphy-ai-generated-photo.jpg", 750, null, 2, 1, 1, 1);

INSERT OR IGNORE INTO FoodCart (accountID, foodID, costPrice, quantity)
VALUES
(1, 1, 750, 1),
(2, 1, 750, 1),
(3, 1, 325, 1)
;
INSERT OR IGNORE INTO OrderHistory (orderID, accountID, orderDate)
VALUES
(0, 1, 1792053499),
(1, 1, 1792053499),
(2, 2, 1792053499)
;
INSERT OR IGNORE INTO OrderHistoryItems(orderID, foodID, costPrice, quantity)
VALUES
(0, 1, 750, 2),
(1, 1, 750, 2),
(2, 1, 750, 5)
;
INSERT OR IGNORE INTO FoodCoupons(accountID, foodID, discountPercent)
VALUES (2, 1, 50);
INSERT OR IGNORE INTO Schedule(date, note)
VALUES
(1792004047, "Staff off day"),
(1792090447, "Mr Jones Party"),
(1792522447, "Supply delivery")
;
INSERT OR IGNORE INTO ShiftRole(id, name)
VALUES
(1, "Server"),(2, "Host"),(3, "Cleaner"),(4, "Cook"),(5, "Cashier");
