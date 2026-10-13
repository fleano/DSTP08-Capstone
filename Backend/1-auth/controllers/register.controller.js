const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
const { queryObjects } = require("v8");

const databasePath =
  process.env.DATABASE_PATH ||
  path.join(__dirname, "..", "..", "data", "database.db");
const database = new sqlite3.Database(databasePath);

/**
 * Retrieves all matching SQLite rows.
 *
 * @param {string} query Parameterized SQL statement.
 * @param {unknown[]} parameters Values for the SQL placeholders.
 * @returns {Promise<object[]>} Matching rows.
 */
function allQuery(query, parameters = []) {
  return new Promise((resolve, reject) => {
    database.all(query, parameters, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

/**
 * Retrieves one SQLite row.
 *
 * @param {string} query Parameterized SQL statement.
 * @param {unknown[]} parameters Values for the SQL placeholders.
 * @returns {Promise<object | undefined>} The matching row, if found.
 */
function getQuery(query, parameters = []) {
  return new Promise((resolve, reject) => {
    database.get(query, parameters, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row);
    });
  });
}

/**
 * Executes a SQLite statement with bound parameters.
 *
 * @param {string} query Parameterized SQL statement.
 * @param {unknown[]} parameters Values for the SQL placeholders.
 * @returns {Promise<{id: number, changes: number}>} SQLite execution metadata.
 */
function runQuery(query, parameters = []) {
  return new Promise((resolve, reject) => {
    database.run(query, parameters, function handleResult(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Register user controller
 * @param {import('express').Request} request Incoming HTTP request.
 * @param {import('express').Response} response Outgoing HTTP response.
 * @param {import('express').NextFunction} next Passes control to the next middleware.
 */
async function registerController(request, response, next) {
  console.log("registerController called");
  // TODO (Charles): Logic for registerController
  //   const validationError = validateRegistration(request.body);

  //   if (validationError) {
  //     response.status(400).json({ error: validationError });
  //     return;
  //   }

  const username = request.body.username.trim();
  const email = request.body.email.trim().toLowerCase();

  try {
    const existingUser = await getQuery(
      "SELECT id FROM Account WHERE username = ? OR email = ?",
      [username, email],
    );
    console.log(username);
    /*
    const existingUser = await getQuery(
      "SELECT id, username FROM Account WHERE username = ?",
      [username],
    );*/
    console.log("existingUser passed");
    console.log(existingUser);

    if (existingUser) {
      response
        .status(409)
        .json({ error: "Username or email is already registered" });
      return;
    }
    console.log("exitng passed");

    const passwordHash = await bcrypt.hash(request.body.password, 12);
    // const result = await runQuery(
    //   "INSERT INTO Account (username, email, passwordHash) VALUES (?, ?, ?)",
    //   [username, email, passwordHash],
    // );

    console.log("hasing passed");

    const result = await runQuery(
      "INSERT INTO Account (username, email, passwordHash) VALUES (?, ?, ?)",
      [username, email, passwordHash],
    );
    // const user = await getQuery(
    //   "SELECT id, username, email, created_at FROM Account WHERE id = ?",
    //   [result.id],
    // );

    const user = await getQuery(
      "SELECT id, username FROM Account WHERE id = ?",
      [result.id],
    );

    console.log("user passed");

    response.status(201).json({ user: "user created" });
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

module.exports = { registerController, queryObjects, runQuery, database};
