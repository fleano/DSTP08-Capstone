const {Router} = require('express')


const router = Router();

router.get('/test', async (request, response, next) => {
    response.status(200).json({ message: 'Test route is working!' });
});
module.exports = { menuRoutes: router };