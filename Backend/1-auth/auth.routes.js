const {Router} = require('express')

const {registerController} = require('./controllers/register.controller');
const {loginController} = require('./controllers/login.controller');
const {checkUserCredentials} = require("./sql_objects.js")

const router = Router();


router.post('/register', registerController);
router.post('/login', loginController, checkUserCredentials);

module.exports = { authRoutes: router };