const fs = require('fs'); //filesystem
const path = require('path'); //file dir
const {getQuery, runQuery, allQuery, database} = require('../1-auth/controllers/register.controller');
const { isBooleanObject } = require('util/types');
const db = database;
//const multer  = require('multer')
//const foodImages = multer({ dest: '/foodImages/' })
//const foodImagesMiddleware = foodImages.fields([{ name: 'testfile', maxCount: 1 }])
//const { upload } = require('./middleware.js')
const {Session} = require("../1-auth/sql_objects.js")

class Food {
    constructor(id, name, description, imageLink=null, price, discountedPrice=null, foodCategory=0, enabled=0, available=0, featured=0) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.imageLink = imageLink;
        this.price = price //in cents
        this.discountedPrice = discountedPrice;
        this.foodCategory = foodCategory;
        this.enabled = enabled
        this.available = available
        this.featured = featured
    }
    frontEndFood() { //returns json suited for React frontend
        return {id: this.id, name: this.name, description: this.description,
            imageLink: this.imageLink, price: (parseInt(this.price) / 100), discountedPrice: (parseInt(this.discountedPrice) / 100),
            foodCategory: this.foodCategory, enabled: this.enabled, available:this.available, featured:this.featured
        }
    }
    async deleteSelf() {
        const sql1 = `DELETE FROM Food WHERE id = ?;`
        try {
            runQuery(sql1, [this.id]);
            return true;
        }
        catch (error) {
            console.log("SQL error when deleting from Food table");
            return false;
        }
    }
    async updateSelf() {
        let isInDB = undefined;
        const sql1 = `SELECT id FROM Food WHERE id = ?;`
        try {
            isInDB = await getQuery(sql1, [this.id]);
        }
        catch (error) {
            console.log("SQL error when selecting from Food table");
            return false;
        }
        if (isInDB) { //update
            const sql2 = `UPDATE Food 
            SET name = ?, description = ?, imageLink = ?, 
            price = ?, discountedPrice = ?, foodCategory = ?, 
            enabled = ?, available = ?, featured = ?
            WHERE id = ?;`
            let result;
            try {
                result = await runQuery(sql2, [this.name, this.description, this.imageLink, 
                    this.price, this.discountedPrice, this.foodCategory, 
                    this.enabled, this.available, this.featured, 
                    this.id]);
                return true;
            }
            catch (error) {
                console.log("SQL error when updating Food table");
                return false;
            }
        }
        else { // error
            console.log("Cannot update Food item that does not exist");
            return false;
        }

    }
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
    static async getFoodByID(req, res, next) {
        const foodID = req.body.foodID;
        const sql1 = `SELECT * FROM Food WHERE id = ?;`
        let result;
        try {
            res.locals.result = await getQuery(sql1, [foodID]);
        }
        catch (error) {
            console.log(error);
            response.status(409).json({ error: "Could not retrieve food items due to SQL error"});
            return;
        }
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
    constructor(accountID, orderItems) { //OOP-friendly representation
        this.accountID = accountID
        this.orderItems = orderItems; //array
    }
    static async makeFoodCart(accountID) {
        const sql1 = `SELECT * FROM FoodCart WHERE accountID = ?;`
        let result;
        try {
            result = await allQuery(sql1, [accountID]);
        }
        catch (error) {
            console.log(error);
            return null;
        }
        if (!result) {
            console.log("No items in cart")
            return FoodCart(accountID, []);
        }
        let orderItems = []
        for (row of result) {
            orderItems.push({orderID: row.orderID, foodID: row.foodID, costPrice: row.costPrice, quantity: row.quantity})
        }
        return FoodCart(accountID, orderItems);
    }
    /*
    async clearCart() {
        const sql1 = `DELETE FROM FoodCart WHERE accountID = ?;`
        try {
            runQuery(sql1, [this.accountID]);
            this.foodItems = []; //clear
            return true;
        }
        catch (error) {
            console.log(error);
            return false
        }
    }*/
    static async clearCart(req, res, next) {
        const sql1 = `DELETE FROM FoodCart WHERE accountID = ?;`
        const accountID = Session.getIDByToken(req.get('Authorization'))
        try {
            runQuery(sql1, [accountID]);
            res.status(201).json({"message": "Clear cart OK"});
        }
        catch (error) {
            return res.status(409).json({error: "Error deleting from FoodCart"})
        }
    }
        /*
    async checkout() {
        if (this.foodItems.length == 0) {
            console.log("Cannot checkout an empty foodcart");
            return false;
        }
        //create a row in OrderHistory
        const sql1 = `INSERT INTO OrderHistory (orderDate, accountID)
        VALUES (?,?);`
        //select this row
        const sql2 = `SELECT orderID FROM OrderHistory ORDER BY orderID DESC LIMIT 1;`
        const orderID = result.orderID
        //create rows in OrderHistoryItems for each item in this.foodItems
        let values = []
        for (item of this.orderItems) {
            values.push(`(${orderID}, ${item.foodID}, ${item.costPrice}, ${item.quantity})`); //sql bracket format
        }
        values = values.join(',');
        const sql3 = `INSERT INTO OrderHistoryItems (orderID, foodID, costPrice, quantity)
        VALUES ${values};`
        //delete rows in FoodCart where accountID = this.accountID
        this.clearCart();
    }*/
    static async checkout(req, res, next) {
        //check FoodCart for items
        const sql0 = `SELECT * FROM FoodCart WHERE accountID = ?;`
        let orderItems;
        const accountID = Session.getIDByToken(req.get('Authorization'))
        try {
            orderItems = await allQuery(sql0, [accountID])
        }
        catch (error) {
            return res.status(409).json({error: "Error querying FoodCart"})
        }
        //create a row in OrderHistory
        const sql1 = `INSERT INTO OrderHistory (orderDate, accountID)
        VALUES (?,?);`
        const orderDate = Date.now() / 1000;
        try {
            await runQuery(sql1, [orderDate, accountID]);
        }
        catch (error) {
            return res.status(409).json({error: "Error inserting into OrderHistory"})
        }
        //select this row
        const sql2 = `SELECT orderID FROM OrderHistory ORDER BY orderID DESC LIMIT 1;`
        try {
            result = await getQuery(sql2, []);
        }
        catch (error) {
            return res.status(409).json({error: "Error selecting from OrderHistory"})
        }
        const orderID = result.orderID
        //create rows in OrderHistoryItems for each item
        let values = []
        for (item of orderItems) {
            values.push(`(${orderID}, ${item.foodID}, ${item.costPrice}, ${item.quantity})`); //sql bracket format
        }
        values = values.join(',');
        const sql3 = `INSERT INTO OrderHistoryItems (orderID, foodID, costPrice, quantity)
        VALUES ${values};`
        try {
            runQuery(sql3, []);
            next();
            //clear cart after this!
        }
        catch (error) {

        }
        //delete rows in FoodCart where accountID = this.accountID
    }
    static async getCartByAccountID(req, res, next) {
        let result = []
        const accountID = await Session.getIDByToken(req.get('Authorization'));
        if (accountID == NaN || accountID == null) {
            response.status(400).json({error: "Account ID is invalid, cannot retrieve food cart"})
            return;
        }
        const sql1 = `SELECT * FROM FoodCart WHERE accountID = ?;`
        try {
            result = await allQuery(sql1, [accountID]);
            if (result == null || result == undefined) {
                return response.status(200).json({ message: "Cart is empty"});
            }
            res.locals.foodCartResult = result; //pass to next function
            next();
        }
        catch (error) {
            console.log(error);
            response.status(409).json({ error: "Could not retrieve food cart due to SQL error"});
            return;
        }
    }
    static async editFoodInCart(req, res, next) {
        const accountID = await Session.getIDByToken(req.get('Authorization'));
        if (accountID == NaN || accountID == null) {
            response.status(400).json({error: "Account ID is invalid, cannot retrieve food cart"})
            return;
        }
        //edit by foodID, quantity

    }
    static async addFoodToCart(req, res, next) {
        
        const accountID = await Session.getIDByToken(req.get('Authorization'));
        if (accountID == NaN || accountID == null) {
            response.status(400).json({error: "Account ID is invalid, cannot retrieve food cart"})
            return;
        }

        const sql0 = `SELECT * FROM Food WHERE foodID = ?
        INNER JOIN FoodCart ON Food.foodID = FoodCart.foodID;` //select all columns belonging to this foodID (1 item only)
        let foodresult;
        try {
            foodresult = await runQuery(sql0, [req.body.foodID]);
        }
        catch (error) {
            console.log(error);
            response.status(409).json({ error: "Could not retrieve food cart due to SQL error"});
            return;
        }

        const sql1 = `INSERT INTO FoodCart (accountID, foodID, costPrice, quantity) 
        VALUES (?,?,?,?);`;
        if (foodresult.discountedPrice != null) {
            res.locals.costPrice = foodresult.discountedPrice;
        }
        else {
            res.locals.costPrice = foodresult.price;
        }
        let result = []
        try {
            result = await runQuery(sql1, [accountID, foodresult.foodID, res.locals.costPrice, res.locals.quantity]);
            if (result) {
                next();
            }
            else {
                response.status(409).json({ error: "Count not insert into food cart due to SQL error"});
                return;
            }
            
        }
        catch (error) {
            console.log(error);
            response.status(409).json({ error: "Could not retrieve food cart due to SQL error"});
            return;
        }
    }
}
module.exports = {Food, FoodCategory, FoodCart}