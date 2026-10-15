const { Router } = require("express");
const router = Router();
const { Session } = require("../1-auth/sql_objects.js");
const { Schedule } = require("./staff_objects.js");
const {
  createShift,
  deleteShift,
  listMyShifts,
  listShifts,
  updateShift,
} = require("./controllers/shift.controller.js");

router.get("/test", async (request, response) => {
  response.status(200).json({ message: "Test route is working!" });
});
router.get(
  "/getSchedule",
  Session.staffManagerPrivilege,
  Schedule.getSchedule,
  async (req, res) => {
    res.status(200).json({ schedule: res.locals.schedule });
  },
);
router.post(
  "/addNote",
  Session.staffManagerPrivilege,
  Schedule.addNote,
  async () => {},
);

router.get("/shifts", Session.managerPlusPrivilege, listShifts);
router.post("/shifts", Session.managerPlusPrivilege, createShift);
router.put("/shifts/:id", Session.managerPlusPrivilege, updateShift);
router.delete("/shifts/:id", Session.managerPlusPrivilege, deleteShift);
router.get("/my-shifts", Session.staffManagerPrivilege, listMyShifts);

module.exports = { schedulingRoutes: router };
