const {Router} = require('express')

const {registerController} = require('./controllers/register.controller');
const {loginController} = require('./controllers/login.controller');


const router = Router();


router.post('/register', registerController);
router.post('/login', loginController);

module.exports = { authRoutes: router };