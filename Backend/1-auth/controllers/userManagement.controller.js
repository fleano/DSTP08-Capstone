const { getQuery, runQuery, allQuery } = require("./register.controller");
const { Session } = require("../sql_objects");

const ALLOWED_ROLE_IDS = [0, 1, 2, 3];

// 1. Get all users
async function getUsersController(req, res, next) {
    try {
        const token = req.get("Authorization");
        const requesterRole = await Session.getRoleByToken(token);

        let sql = "SELECT id, username, email, roleID, firstName, lastName FROM Account";
        
        // If requester is a Manager (role 1), hide Admin (role 0) accounts
        if (requesterRole === 1) {
            sql += " WHERE roleID != 0";
        }

        const users = await allQuery(sql + ";");
        return res.status(200).json({ users: users || [] });
    } catch (error) {
        next(error);
    }
}

// 2. Update user role
async function updateRoleController(req, res, next) {
    const body = req.body ?? {};
    const userId = body.userId;
    const roleID = Number(body.roleID);

    if (!userId) {
        return res.status(400).json({ error: "userId is required" });
    }

    if (!Number.isInteger(roleID) || !ALLOWED_ROLE_IDS.includes(roleID)) {
        return res.status(400).json({ error: "roleID must be 0, 1, 2, or 3" });
    }

    try {
        const token = req.get("Authorization");
        const requesterRole = await Session.getRoleByToken(token);

        // Verify target user exists and check their current role
        const targetUser = await getQuery("SELECT id, roleID FROM Account WHERE id = ?", [userId]);
        if (!targetUser) {
            return res.status(404).json({ error: "User not found." });
        }

        // If requester is a Manager (role 1):
        if (requesterRole === 1) {
            // Cannot modify an existing Admin
            if (targetUser.roleID === 0) {
                return res.status(403).json({ error: "Access denied. Managers cannot modify Admin accounts." });
            }
            // Cannot promote anyone TO Admin
            if (roleID === 0) {
                return res.status(403).json({ error: "Access denied. Managers cannot assign Admin roles." });
            }
        }

        await runQuery("UPDATE Account SET roleID = ? WHERE id = ?;", [roleID, userId]);

        return res.status(200).json({ message: "Role updated successfully." });
    } catch (error) {
        next(error);
    }
}

// 3. Delete user
async function deleteUserController(req, res, next) {
    const userId = req.params.id;

    if (!userId) {
        return res.status(400).json({ error: "userId parameter is required" });
    }

    try {
        const token = req.get("Authorization");
        const requesterRole = await Session.getRoleByToken(token);

        const targetUser = await getQuery("SELECT id, roleID FROM Account WHERE id = ?", [userId]);
        if (!targetUser) {
            return res.status(404).json({ error: "User not found." });
        }

        // If requester is a Manager, block deleting Admin accounts
        if (requesterRole === 1 && targetUser.roleID === 0) {
            return res.status(403).json({ error: "Access denied. Managers cannot delete Admin accounts." });
        }

        await runQuery("DELETE FROM Account WHERE id = ?;", [userId]);

        return res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getUsersController,
    updateRoleController,
    deleteUserController,
};