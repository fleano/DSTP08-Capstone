const {Router} = require('express')


const router = Router();

router.get('/test', async (request, response, next) => {
    response.status(200).json({ message: 'Test route is working!' });
});
router.get('/schedule', async (request, response, next) => {
    response.status(200).json({ schedule: response.locals.schedule });
});
module.exports = { schedulingRoutes: router };
