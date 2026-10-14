const fs = require('fs'); //filesystem
const path = require('path'); //file dir
const {getQuery, runQuery, allQuery, database} = require('../1-auth/controllers/register.controller');
const { isBooleanObject } = require('util/types');
const db = database;
//const multer  = require('multer')
//const foodImages = multer({ dest: '/foodImages/' })
//const foodImagesMiddleware = foodImages.fields([{ name: 'testfile', maxCount: 1 }])
//const { upload } = require('./middleware.js')

class Food {
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
        const priceValidation = Number.isInteger(parseInt(price));
        console.log("priceValidation", priceValidation)
        if (!priceValidation) {
            validationErrors.push("Price is invalid, must be int")
        }
        const discountedPriceValidation = discountedPrice == null || Number.isInteger(parseInt(discountedPrice));
        if (!discountedPriceValidation) {
            validationErrors.push("Discounted price is invalid, must be null or int")
        }
        //convert to cents
        if (priceValidation) {
            price = Math.trunc(price * 100);
        }
        if (discountedPriceValidation) {
            discountedPrice = Math.trunc(discountedPrice * 100);
        }
        //
        const foodCategoryValidation = Number.isInteger(parseInt(foodCategory))
        if (!foodCategoryValidation) {
            validationErrors.push("Food category is invalid, must be int")
        }
        const enabledValidation = Number.isInteger(parseInt(enabled)) && (enabled == 0 || enabled == 1);
        if (!enabledValidation) {
            validationErrors.push("Enabled is invalid, must be 0 or 1")
        }
        const availableValidation = Number.isInteger(parseInt(available)) && (available == 0 || available == 1);
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
                    return;
            }
            catch (error) {
                console.log(error, validationErrors.join('\n'));
                return {error: error, validationErrors: validationErrors.join('\n')};
            }
        }
        else {
            console.log(validationErrors.join('\n'));
            return {validationErrors: validationErrors.join('\n')};
        }
    }
    static convertDollarsandCents(array) {
        for (let i = 0; i < array.length; i++) {
            array[i].price /= 100;
            if (array[i].discountedPrice != null) {
                array[i].discountedPrice /= 100;
            }
        }
        return array
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
        //convert price to dollars and cents
        result = Food.convertDollarsandCents(result);
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
        //convert price to dollars and cents
        result = Food.convertDollarsandCents(result);
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
            res.locals.foodCategoryResult = foodCategoryResult; //pass to next function
            next();
        }
        catch (error) {
            console.log(error);
            response.status(409).json({ error: "Could not retrieve food category due to SQL error"});
            return;
        }
    }
}

module.exports = {Food, FoodCategory}