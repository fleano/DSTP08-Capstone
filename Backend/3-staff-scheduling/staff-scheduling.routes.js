const {Router} = require('express')


const router = Router();
const {Session} = require("../1-auth/sql_objects.js")
const {Schedule} = require("./staff_objects.js")

router.get('/test', async (request, response, next) => {
    response.status(200).json({ message: 'Test route is working!' });
});
router.get('/getSchedule', Session.staffManagerPrivilege, Schedule.getSchedule, async (req, res, next) => {
    res.status(200).json({ schedule: res.locals.schedule });
});
router.post('/addNote', Session.staffManagerPrivilege, Schedule.addNote, async (req, res, next) => {

});
module.exports = { schedulingRoutes: router };
