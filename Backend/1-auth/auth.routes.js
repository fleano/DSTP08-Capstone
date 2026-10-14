const {Router} = require('express')

const {registerController} = require('./controllers/register.controller');
const {loginController} = require('./controllers/login.controller');
const {checkUserCredentials} = require("./sql_objects.js")
const {logoutController, logoutControllerAll} = require('./controllers/logout.controller.js')

const router = Router();

router.post('/register', registerController);
//router.post('/register', AccountPasswordH.create);
router.post('/login', loginController, checkUserCredentials);
router.post('/logout', logoutController);
router.post('/logoutAll', logoutControllerAll);

module.exports = { authRoutes: router };