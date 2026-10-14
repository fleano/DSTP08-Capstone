const bcrypt = require("bcrypt");
const { getQuery, runQuery } = require("./register.controller");

const ALLOWED_ROLE_IDS = [0, 1, 2, 3];
const DEFAULT_ROLE_ID = 3;


async function adminCreateUserController(request, response, next) {
  console.log("HIT adminCreateUserController! Body:", request.body); 
  const body = request.body ?? {};

  // --- validation ---
  const errors = [];
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username) errors.push("username is required");
  if (!email) errors.push("email is required");
  if (!password) errors.push("password is required");

  let roleID = DEFAULT_ROLE_ID;
  if (body.roleID !== undefined && body.roleID !== null && body.roleID !== "") {
    roleID = Number(body.roleID);
    if (!Number.isInteger(roleID) || !ALLOWED_ROLE_IDS.includes(roleID)) {
      errors.push("roleID must be one of 0 (Admin), 1 (Manager), 2 (Staff), 3 (Customer)");
    }
  }

  const firstName =
    typeof body.firstName === "string" && body.firstName.trim()
      ? body.firstName.trim()
      : null;
  const lastName =
    typeof body.lastName === "string" && body.lastName.trim()
      ? body.lastName.trim()
      : null;

  if (errors.length > 0) {
    response.status(400).json({ error: errors.join("; ") });
    return;
  }

  // --- create account ---
  try {
    const existingUser = await getQuery(
      "SELECT id FROM Account WHERE username = ? OR email = ?",
      [username, email],
    );

    if (existingUser) {
      response
        .status(409)
        .json({ error: "Username or email is already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await runQuery(
      `INSERT INTO Account (username, email, passwordHash, roleID, firstName, lastName)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, passwordHash, roleID, firstName, lastName],
    );

    response.status(201).json({
      message: "user created",
      user: { id: result.id, username, email, roleID, firstName, lastName },
    });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT") {
      response
        .status(409)
        .json({ error: "Username or email is already registered" });
      return;
    }
    next(error);
  }
}

module.exports = { adminCreateUserController };