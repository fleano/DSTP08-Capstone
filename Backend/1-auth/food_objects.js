const fs = require('fs'); //filesystem
const path = require('path'); //file dir
const {getQuery, runQuery, allQuery, database} = require('./controllers/register.controller');
const { isBooleanObject } = require('util/types');
const db = database;
const multer  = require('multer')
const foodImages = multer({ dest: 'foodImages/' })

class Food {
    static async uploadFoodImage(req, res, next) { //receive an image object TODO
        //query db for next number
        const sql = `SELECT id FROM Food ORDER BY id DESC;`
        let result = 0;
        try {
            result = await getQuery(sql, []);
        }
        catch (error) {
            console.log(error);
            response.status(409).json({ error: "Could not retrieve food items due to SQL error"});
            return;
        }
        ++result;
        //store local directory link as string, to be passed to addFood
        res.locals.imageName = req.body.name + "_" + toString(result) + ".jpg";
        //take binary image from req and store it as jpeg
        //multer functions here
    }
    static async addFood(name, description, imageLink=null, price, discountedPrice=null, foodCategory=0, enabled=0, available=0) {
        let validationErrors = []
        const nameValidation = (name != null) && (name.length > 0);
        if (!nameValidation) {
            validationErrors.push("Name is invalid")
        }
        const descriptionValidation = (description != null) && (description.length > 0);
        if (!descriptionValidation) {
            validationErrors.push("Description is invalid")
        }
        const priceValidation = Number.isInteger(price);
        if (!priceValidation) {
            validationErrors.push("Price is invalid, must be int")
        }
        const discountedPriceValidation = discountedPrice == null || Number.isInteger(discountedPrice);
        if (!discountedPriceValidation) {
            validationErrors.push("Discounted price is invalid, must be null or int")
        }
        const foodCategoryValidation = Number.isInteger(foodCategory)
        if (!foodCategoryValidation) {
            validationErrors.push("Food category is invalid, must be int")
        }
        const enabledValidation = Number.isInteger(enabled) && (enabled == 0 || enabled == 1);
        if (!enabledValidation) {
            validationErrors.push("Enabled is invalid, must be 0 or 1")
        }
        const availableValidation = Number.isInteger(available) && (available == 0 || available == 1);
        if (!availableValidation) {
            validationErrors.push("Available is invalid, must be 0 or 1")
        }
        const sql = `INSERT INTO Food (name, description, imageLink, price, 
        discountedPrice, foodCategory, enabled, available)
        VALUES (?,?,?,?,?,?,?,?);`; //8 args
        if (validationErrors.length == 0) {
            try {
                const result = await runQuery(sql, [name, description, imageLink, price, 
                    discountedPrice, foodCategory, enabled, available])
                response.status(201).json({message: "Added food item successfully."})
                    return;
            }
            catch (error) {
                console.log(error);
                response.status(409).json({ error: "Could not add food item due to SQL error", "validationErrors": validationErrors.join("/n") });
                return;
            }
        }
        else {
            return response.status(409).json({ error: "Could not add food item, there are validation errors", "validationErrors": validationErrors.join("/n") });
        }
    }
    static async getAllFood(req, res, next) {
        const sql = `SELECT * FROM Food;`
        let result = []
        try {
            result = await allQuery(sql, []);
        }
        catch (error) {
            console.log(error);
            response.status(409).json({ error: "Could not retrieve food items due to SQL error"});
            return;
        }
        res.body.foodList = result;
        next();
    }
    static async getFoodByCategory(req, res, next) { //intended for filtering
        let category = req.body.filters; //should be list
        let categoryString = ""
        if (category != null && category.length > 0) {
            categoryString = `WHERE FoodCategory IN (${category.join(",")})`;
        }
        const sql1 = `SELECT * FROM Food ${categoryString};`
        let result = []
        try {
            result = await getQuery(sql1, []);
        }
        catch (error) {
            console.log(error);
            response.status(409).json({ error: "Could not retrieve food items due to SQL error"});
            return;
        }
        res.body.foodList = result;
        next();
    }
}
class FoodCategory {
    static async getAllFoodCategory(req, res, next) { //food category
        const sql1 = `SELECT * FROM FoodCategory;`
        let foodCategoryResult = []
        try {
            foodCategoryResult = await allQuery(sql1, []);
            res.body.foodCategory = foodCategoryResult; //pass to next function
            next();
        }
        catch (error) {
            console.log(error);
            response.status(409).json({ error: "Could not retrieve food category due to SQL error"});
            return;
        }
    }
}