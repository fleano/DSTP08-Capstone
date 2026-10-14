const {Router} = require('express')

const {registerController} = require('./controllers/register.controller');
const {loginController} = require('./controllers/login.controller');
const {checkUserCredentials, Session} = require("./sql_objects.js")
const {logoutController, logoutControllerAll} = require('./controllers/logout.controller.js')
const { adminCreateUserController } = require('./controllers/adminCreateUser.controller');
const { getUsersController, updateRoleController, deleteUserController } = require('./controllers/userManagement.controller');
const router = Router();

router.post('/admin/create-user', Session.adminPrivilege, adminCreateUserController);
router.get('/admin/users', Session.managerPlusPrivilege, getUsersController);
router.post('/admin/update-role', Session.managerPlusPrivilege, updateRoleController);
router.delete('/admin/user/:id', Session.managerPlusPrivilege, deleteUserController);

router.post('/register', registerController);
//router.post('/register', AccountPasswordH.create);
router.post('/login', loginController, checkUserCredentials);
router.post('/logout', logoutController);
router.post('/logoutAll', logoutControllerAll);

module.exports = { authRoutes: router };