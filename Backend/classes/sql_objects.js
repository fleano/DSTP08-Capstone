//import sqlite and setup
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt'); //cryptographic module
const jwt = require('jsonwebtoken') // jsonwebtoken
const fs = require('fs'); //filesystem
const path = require('path'); //file dir

//helper functions for SQL queries. Assume the user is already authenticated for such actions
let db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => { //connect to database, if not exist create it then connect
        if (err) {
            console.error(err.message);
        }
        console.log("Connected to 'database.db' database.");
    }
);
class Role { // 0: Admin, 1: Manager, 2: Staff, 3: Customer
    static tableName = "Role";
    static row1 = "name";
    constructor(name) {
        this.name = name;
    }
    insert() { //should not need to use this but 
        const sql = `
        INSERT INTO ${tableName} (${row1})
        VALUES (${this.name});
        `;
        db.run(sql), (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log("Inserted ${this.name} role success.");
            }
        }
    }
}

class Account { //only contains public data
    constructor(id, roleID, firstName, lastName) {
        this.id = id;
        this.roleID = roleID;
        this.firstName = firstName;
        this.lastName = lastName;
    }
    static getAccountByID(id) {
        id = parseInt(id);
        if (id == NaN) {
            console.log("Invalid ID provided for account.");
            return null;
        }
        const sql = `SELECT id, roleID, firstName, lastName FROM Account
            WHERE id = ?`;
        db.all(sql, [id], (err, rows) => {
            if (err) {
                console.log("Error querying database for Account.");
                return null;
            }   
            if (rows.length == 0) {
                console.log("No account exists for this ID.");
                return null;
            }
            const row = rows[0];
            return Account(row.id, row.roleID, row.firstName, row.lastName);
        });
    }
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
    updateName(firstName, lastName) {
        const sql = `UPDATE Account
        SET firstName = ?, lastName = ?
        WHERE id = ?`;
        db.run(sql, [this.firstName, this.lastName, this.id],), (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log("Updated Account names success.");
            }
        }
    }
}

function registerUser(req, res, next) {
    let hashedPassword
    bcrypt.hash(req.body.password, 10).then( (result) => {
      hashedPassword = result;
      //db run with hashed password
    })
    //console.log(hashedPassword);
    db.run(`INSERT INTO users(username, email, password)
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
  });
  next();
}
const privateKey = fs.readFileSync('./private-key-rs256.pem');
const publicKey = fs.readFileSync('./public-key-rs256.pem');
function checkUserCredentials(req, res, next) {
  const sql = `SELECT id, username, passwordHash FROM Accounts
  WHERE username = ?`
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
            jwt.sign(obj, publicKey, { algorithm: 'RS256', expiresIn: "1 day" }, function(err, token) {
          //console.log(token);
          res.status(200).json({"token": token});
        });
      }
      else { //failed
        res.status(401).json({"error": "Password does not match."})
      }
    })
  });
}
function decodeToken (req, res, next) {
  const incomingToken = req.get('Authorization');
  console.log(incomingToken)
  //check token validity
  jwt.verify(incomingToken, privateKey, function(err, decoded) {
    //console.log(decoded)
    if (err) {
      res.status(400).json(err) //could be wrong token, expired token...
      return;
    }
    else {
      res.locals.decoded = decoded;
    }
  })
  next();
  //
  
}
class AccountPasswordH {
    constructor(username, passwordHash, roleID) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.roleID = roleID;
    }
    static create(username, password, roleID=3) { //supply username and raw password, default role is Customer
        let passwordHash
        bcrypt.hash(password, 10).then( (result) => {
            passwordHash = result;
        })
        const sql = `INSERT INTO Account (username, passwordHash, roleID)
        SET username = ?, passwordHash = ?, roleID = ?,
        WHERE id = ?`;
        db.run(sql, [username, passwordHash, roleID, this.id]), (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log("Inserted new account success.");
            }
        }
    }
}
class Sessions {
    constructor(accountID, sessions) {
        this.accountID = accountID;
        this.sessions = sessions;
    }
    getSessions() {
        return this.sessions; //JSON session: [{token, expiryDate}, ...]
    }
    static getSessionsByID(accountID) {
        const sql = `SELECT id, roleID, firstName, lastName FROM Sessions
            WHERE id = ?`;
        db.all(sql, [id], (err, rows) => {
            if (err) {
                console.log("Error querying database for Account.");
                return null;
            }   
            if (rows.length == 0) {
                console.log("No account exists for this ID.");
                return null;
            }
            const row = rows[0];
            return Account(row.id, row.roleID, row.firstName, row.lastName);
        });
    }
}

module.exports = {Account, AccountPasswordH, checkUserCredentials, decodeToken, registerUser}