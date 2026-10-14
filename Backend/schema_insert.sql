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
VALUES ("Fried Chicken", "It's delicious", "1791950117656-stock-of-fried-chicken-foodgraphy-ai-generated-photo.jpg", 750, null, 2, 1, 1, 1)