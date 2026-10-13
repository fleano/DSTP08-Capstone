--insert root admin
-- user: root, password: rootmars
INSERT INTO Account (username, passwordHash, roleID, firstName, lastName)
VALUES ("root", "$2b$10$TUmDP.pEmFyCt5WGQ5xDuev9e53FjEDZ4H7AsRW0.016OJi6mFLL2", 0, "admin", NULL);
INSERT INTO Role (name)
VALUES ("Manager"), ("Staff"), ("Customer");
INSERT INTO Role (id, name)
VALUES (0, "Admin"), (-1, "Guest");
INSERT INTO FoodCategory (category)
VALUES ("Other"), ("Drink"), ("Food"), ("Set Meal");