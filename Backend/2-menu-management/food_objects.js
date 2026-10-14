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
    static async addFood(name, description, imageLink=null, price, discountedPrice=null, foodCategory=0, enabled=0, available=0, featured=0) {

        let validationErrors = []
        const nameValidation = (name != null) && (name.length > 0);
        if (!nameValidation) {
            validationErrors.push("Name is invalid")
        }
        const descriptionValidation = (description != null) && (description.length > 0);
        if (!descriptionValidation) {
            validationErrors.push("Description is invalid")
        }
        const priceValidation = !isNaN(parseFloat(price));
        console.log("priceValidation", priceValidation)
        if (!priceValidation) {
            validationErrors.push("Price is invalid, must be number")
        }
        const discountedPriceValidation = discountedPrice == null || !isNaN(parseFloat(discountedPrice));
        if (!discountedPriceValidation) {
            validationErrors.push("Discounted price is invalid, must be null or number")
        }
        //convert to cents
        if (priceValidation) {
            price = Math.trunc(price * 100);
        }
        if (discountedPriceValidation && discountedPrice != null) { //do not process if null
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
        const featuredValidation = Number.isInteger(parseInt(featured)) && (featured == 0 || featured == 1);
        if (!featuredValidation) {
            validationErrors.push("Featured is invalid, must be 0 or 1")
        }
        const sql = `INSERT INTO Food (name, description, imageLink, price, 
        discountedPrice, foodCategory, enabled, available, featured)
        VALUES (?,?,?,?,?,?,?,?,?);`; //9 args
        if (validationErrors.length == 0) {
            try {
                const result = await runQuery(sql, [
                    name, description, imageLink, 
                    price, discountedPrice, foodCategory, 
                    enabled, available, featured])
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
    static async preprocessFoodRow(array) { //converts to dollars and cents and converts image name to static ref
        for (let i = 0; i < array.length; i++) {
            array[i].imageLink = Food.appendImageDirectory(array[i].imageLink)
            array[i].price /= 100;
            if (array[i].discountedPrice != null) {
                array[i].discountedPrice /= 100;
            }
        }
        return array
    }
    static appendImageDirectory(filename) {
        // ?/uploads/foodImages/file.name
        const dir = 'uploads/' + 'foodImages/' + filename;
        return dir;
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
        //convert price to dollars and cents and href
        result = await Food.preprocessFoodRow(result);
        res.locals.foodList = result;
        next();
    }
    static async getAllFoodFeatured(req, res, next) {
        const sql = `SELECT * FROM Food WHERE featured = 1;`
        let result = []
        try {
            result = await allQuery(sql, []);

        }
        catch (error) {
            console.log(error);
            response.status(409).json({ error: "Could not retrieve food items due to SQL error"});
            return;
        }
        //convert price to dollars and cents and href
        result = Food.preprocessFoodRow(result);
        res.locals.foodList = result;
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
        res.locals.foodList = result;
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
class FoodCart { //WIP
    static async getCartByAccountID(req, res, next) {
        const sql1 = `SELECT * FROM FoodCart WHERE ;`
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
module.exports = {Food, FoodCategory, FoodCart}