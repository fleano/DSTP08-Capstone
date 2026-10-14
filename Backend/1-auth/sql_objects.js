//import sqlite and setup
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt'); //cryptographic module
const jwt = require('jsonwebtoken') // jsonwebtoken
const fs = require('fs'); //filesystem
const path = require('path'); //file dir
const multer = require('multer')
const profileImages = multer({ dest: '/profileImages/' })
//key files
const privateKey = fs.readFileSync(path.join(__dirname, 'private-key-rs256.pem'));
const publicKey = fs.readFileSync(path.join(__dirname, 'public-key-rs256.pem'));

const TOKEN_LIFETIME_DAYS = 1;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_DAY = SECONDS_IN_HOUR * 24
const GUEST_TOKEN_LIFETIME = SECONDS_IN_HOUR * 3 // 3 hours


const {queryObjects, runQuery, getQuery, allQuery, database} = require('./controllers/register.controller');
const db = database;
//helper functions for SQL queries. Assume the user is already authenticated for such actions

//check if db exists, if exists, skip inserts
//todo: create and mount 'data' folder
const dbExists = fs.existsSync(path.join('data', 'database.db'));
/*
let db = new sqlite3.Database('./data/database.db', (err) => { //connect to database, if not exist create it then connect
        //console.log(path.join(__dirname, 'data', 'database.db'))
    if (err) {
            console.error(err.message);
        }
        else {        
            console.log("Connected to 'database.db' database.");
        }
    }
);*/
console.log("db exists", dbExists)
if (!dbExists) {
    const initDatabaseScript = fs.readFileSync(path.join(__dirname, "..", 'schema.sql'), {encoding: 'utf8'});
    try {
        db.exec(initDatabaseScript), (err) => { //use exec to read multiple lines
            if (err) {
                console.log("insert table script")
                console.error(err.message);
                db.close()
            } else {
                console.log("Database init success");
            }
        }
    }
    catch {
    }
    const insertScript = fs.readFileSync(path.join(__dirname, "..", 'schema_insert.sql'), {encoding: 'utf8'});
    try {
        db.exec(insertScript), (err) => { //use exec to read multiple lines
            if (err) {
                console.error(err.message);
                console.log("insert data script")
                db.close()
            } else {
                console.log("Database init success");
            }
        }
    }
    catch {

    }

}
class Role { // -1: Guest, 0: Admin, 1: Manager, 2: Staff, 3: Customer
    static tableName = "Role";
    static row1 = "name";
    constructor(id, name) {
        this.id = id
        this.name = name;
    }
    static insert() { 
        const name = req.body.name
        const sql = `
        INSERT INTO ${tableName} (${row1})
        VALUES (${name});
        `;
        db.run(sql), (err) => {
            if (err) {
                console.error(err.message);
                return null;
            } else {
                console.log("Inserted ${this.name} role success.");
                return true;
            }
        }
    }
}
class AccountPasswordH { //contains private data, call this first when creating an account
    constructor(username, passwordHash, roleID) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.roleID = roleID;
    }
    /*
    static async create(req, res, next) { //supply username and raw password, default role is Customer
        const username = req.body.username
        const email = req.body.email
        const password = req.body.password
        const roleID = 3
        const passwordHash = await bcrypt.hash(password, 12);
        const sql = `INSERT INTO Account (username, email, passwordHash, roleID)
        VALUES (?,?,?,?);`;
        const status = await runQuery(sql, [username, email, passwordHash, roleID]);
        if (status) {
            return res.status(200);
        }
        else {
            return res.status(400);
        }
    }*/
}
class Account { //only contains public data
    constructor(id, roleID, firstName, lastName) {
        this.id = id;
        this.roleID = roleID;
        this.firstName = firstName;
        this.lastName = lastName;
    }
    /*
    static getAccountByID(id) {
        id = parseInt(id);
        if (id == NaN) {
            console.log("Invalid ID provided for account.");
            return null;
        }
        const sql = `SELECT id, roleID, firstName, lastName FROM Account WHERE id = ?;`;
        db.all(sql, [id], (err, rows) => {
            if (err) {
                console.log(err);
                return null;
            }   
            if (rows.length == 0) {
                console.log("No account exists for this ID.");
                return null;
            }
            const row = rows[0];
            //console.log(rows[0])
            return new Account(row.id, row.roleID, row.firstName, row.lastName);
        });
        
    }
    static changeRole(id, roleID) {
        id = parseInt(id);
        if (id == NaN) {
            console.log("Invalid ID provided for account.");
            return null;
        }
        const sql1 = `UPDATE Account roleID = ? WHERE id = ?;`;
        db.run(sql1, [roleID, id], (err) => {
            if (err) {
                console.log("Error querying database for Account.");
                return null;
            } 
            else {
                return true;
            }
        });
    }*/
    /*
    update() {
        const sql = `UPDATE Account
        SET roleID = ?, firstName = ?, lastName = ?
        WHERE id = ?`;
        db.run(sql, [this.roleID, this.firstName, this.lastName, this.id], (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log("Updated Account success.");
            }
        });
    }
    static updateName(id, firstName, lastName) {
        const sql = `UPDATE Account
        SET firstName = ?, lastName = ?
        WHERE id = ?;`;
        db.run(sql, [firstName, lastName, id],), (err) => {
            if (err) {
                console.error(err.message);
                return null;
            } else {
                console.log("Updated Account names success.");
                return true;
            }
        }
    }*/
    static generateGuestAccount(req, res, next) { //generate an account for use in guest applications and return it
        const randomUsername = "<Guest>";
        const guestRole = -1;
        const sql = `INSERT INTO Accounts (username, roleID) VALUES (?,?);`;
        db.run(sql, [randomUsername, guestRole]), (err) => {
            if (err) {
                console.error(err.message);
                res.status(400).json({ error: 'Could not generate guest account' });
            } else {
                
                const obj = {"id": data.id, "username" : data.username}
                jwt.sign(obj, publicKey, { algorithm: 'RS256', expiresIn: "1 day" }, function(err, token) {
                 //add token to database
                Session.saveToken(data.id, token);
                res.status(201).json({"token": token}); //send token back to client
                }
                )

            }
        }
        next();
    }
    static pruneGuests() { //delete all guest accounts with no valid tokens
        const sql = `DELETE FROM Account 
        WHERE (Account.roleID = ? AND Session.token = NULL)
        LEFT JOIN Session ON Account.id = Session.accountID;`;
        //delete all guests in guestList without tokens
        db.run(sql, [-1]), (err) => {
            if (err) {
                console.error(err.message);
                return null;
            } else {
                console.log("Guest account creation success.");
                return true;
            }
        }
    }
}
//account creator helper
function registerUser(req, res, next) {
    let result = AccountPasswordH.create(req.body.username, req.body.password);
    if (result == true) {
        res.status(201).json({"message": "success"})
    }
    /* deprecated and replaced with AccountPasswordH class
    let hashedPassword
    bcrypt.hash(req.body.password, 10).then( (result) => {
      hashedPassword = result;
      //db run with hashed password
    })
    //console.log(hashedPassword);
    db.run(`INSERT INTO users(username, email, passwordHash)
            VALUES(?, ?, ?)
            `, 
            [req.body.username, req.body.email, hashedPassword], 
    function(err) {
      if (err) {
        return res.status(400).json({"error":err.message});
      }
      //console.log(this);
      return res.status(201).json({
        "message": "success",
        "data": {id: this.lastID}
      });
    });*/
    next();
}
function checkUserCredentials(req, res, next) {
  const sql = `SELECT id, username, passwordHash FROM Account
  WHERE username = ?;`
  db.all(sql, [req.body.username], (err, rows) => {
    if (err) {
      res.status(400).json({"error":err.message});
      return;
    }
    //check if result is empty
    if (rows.length == 0) {
      res.status(400).json({"error": "User not found."});
      return;
    }
    //compare obtained password
    const data = rows[0];
    let comparePassword;
    bcrypt.compare(req.body.password, data.passwordHash).then( (result) => {
      comparePassword = result
      if (comparePassword) { //success
        const obj = {"id": data.id, "username" : data.username}
        //begin jwt
        jwt.sign(obj, privateKey, { algorithm: 'RS256', expiresIn: "1 day" }, function(err, token) {
        //console.log(token);
            //add token to database
            Session.saveToken(data.id, token);
            return res.status(201).json({"token": token});
        });
      }
      else { //failed
        return res.status(401).json({"error": "Password does not match."})
      }
    })
  });
  //next(); //do not next
}
async function decodeToken (req, res, next) { //token validator and decoder middleware
  const incomingToken = req.get('Authorization');
  console.log(incomingToken)
  //check if token is in db
  const isTokenInDB = await Session.isTokenInDB(incomingToken);
  if (isTokenInDB) {
    //check token validity
    jwt.verify(incomingToken, publicKey, function(err, decoded) {
        //console.log(decoded)
        if (err) {
            Session.deleteToken(incomingToken); //expire the token
            res.status(400).json(err)
            return;
        }
        else { //OK
            res.locals.decoded = decoded;
        }
    })
  }
  else {
        const error = "Token not in DB";
        return res.status(400).json(error) //could be wrong token, expired token...
  }
  next();
}
function transpose(array) { //transposes vertical to horizontal (array of arrays, into a single array). Only works on single column
    let result = [];
    for (let elem of array) {
        result.push(elem[0]);
    }
    return result;
}
class Session { //handles tokens and user sessions
    constructor(accountID, tokens) {
        this.accountID = accountID;
        this.tokens = tokens; // [token, ...]
    }/*
    static getSessionByID(accountID) {
        accountID = parseInt(accountID);
        if (accountID == NaN) {
            console.log("Could not expire tokens, accountID specified is invalid.");
            return false;
        }
        const sql = `SELECT token FROM Session
            WHERE accountID = ?;`;
        db.all(sql, [accountID], (err, rows) => {
            if (err) {
                console.log("Error querying database for Session.");
                return null;
            }   
            if (rows.length == 0) {
                console.log("No session tokens exist for this ID.");
                return null;
            }
            const tokens = transpose(rows);
            return new Session(accountID, tokens);
        });
    }*/
    static async isTokenInDB(token) {
        const sql = `SELECT token, expiry FROM Session WHERE token = ?`;
        let result = null;
        try {
            result = await getQuery(sql, [token]);
            if (result) {
                return true;
            }
            else {
                return false;
            }
        }
        catch (error) {
            console.log("Could not check token, due to sql error.", error.message);
            return false;
        }
    }
    static saveToken(accountID, token, guest=false) { //save the token, used with login and authentication for persistence //working
        accountID = parseInt(accountID);
        if (accountID == NaN) {
            console.log("Could not expire tokens, accountID specified is invalid.");
            return false;
        }
        let tokenLifetime;
        if (guest) {
            tokenLifetime = GUEST_TOKEN_LIFETIME; // 3 hours
        }
        else {
            tokenLifetime = TOKEN_LIFETIME_DAYS * SECONDS_IN_DAY; // 1 day
        }
        const expiry = Date.now() / 1000 + tokenLifetime //epoch seconds
        const sql = `INSERT INTO Session (accountID, token, expiry) VALUES (?,?,?);`
        db.run(sql, [accountID, token, expiry], (err) => {
            if (err) {
                console.log("Error querying database for Session.");
            }
        })
    }
    static async deleteToken(token) { //delete a specific token
        const sql = `DELETE FROM Session WHERE token = ?`
        let result;
        try {
            result = await runQuery(sql, [token]);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    static expireTokensByID(accountID) { //remove all tokens belonging to that user (purge logins)
        accountID = parseInt(accountID);
        if (accountID == NaN) {
            console.log("Could not expire tokens, accountID specified is invalid.");
            return false;
        }
        const sql = `DELETE FROM Session WHERE accountID = ?;`;
        db.run(sql, [accountID], (err) => {
            if (err) {
                console.log("Error querying database for Session.");
            }
        })
    }
    static pruneTokens() { //remove all expired tokens
        const sql = `DELETE FROM Session WHERE expiry <= ?;`
        const epochSecondsNow = Date.now() / 1000 //epoch seconds NOW
        db.run(sql, [epochSecondsNow], (err) => {
            if (err) {
                console.log("Error querying database for Session.");
            }
        })
    }
}

module.exports = {Role, Account, AccountPasswordH, Session, checkUserCredentials, decodeToken, registerUser}