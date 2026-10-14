const {Session} = require("../sql_objects.js")
/**
 *Auth user controller
 * @param {import('express').Request} req Incoming HTTP request.
 * @param {import('express').Response} res Outgoing HTTP response.
 * @param {import('express').NextFunction} next Passes control to the next middleware.
 */
async function logoutController(req, res, next) {
    const incomingToken = req.get('Authorization');
    const result = await Session.deleteToken(incomingToken);
    if (result) {
        return res.status(200).json({message: "Logout OK"});
    }
    else {
        return res.status(400).json({message: "Logout failed"});
    }
}
async function logoutControllerAll(req, res, next) {
    const incomingToken = req.get('Authorization');
    console.log(incomingToken)
    const id = await Session.getIDByToken(incomingToken);
    console.log(id)
    const result = await Session.expireTokensByID(id);
    console.log(result)
    if (result) {
        return res.status(200).json({message: "Logout OK"});
    }
    else {
        return res.status(400).json({message: "Logout failed"});
    }
}
module.exports = {logoutController, logoutControllerAll}