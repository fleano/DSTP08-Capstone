//import sqlite and setup
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt'); //cryptographic module
const jwt = require('jsonwebtoken') // jsonwebtoken
const fs = require('fs'); //filesystem
const path = require('path'); //file dir
//key files
const privateKey = fs.readFileSync('./private-key-rs256.pem');
const publicKey = fs.readFileSync('./public-key-rs256.pem');

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
    static insert(name) { 
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
                return err;
            } else {
                return true;
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
    static changeRole(id, roleID) {
        id = parseInt(id);
        if (id == NaN) {
            console.log("Invalid ID provided for account.");
            return null;
        }
        const sql = `SELECT id FROM Account
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
        });
        const sql1 = `UPDATE Account roleID = ? WHERE id = ?`;
        db.run(sql1, [roleID, id], (err) => {
            if (err) {
                console.log("Error querying database for Account.");
                return null;
            } 
            else {
                return true;
            }
        });
    }
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
    }*/
    static updateName(id, firstName, lastName) {
        const sql = `UPDATE Account
        SET firstName = ?, lastName = ?
        WHERE id = ?`;
        db.run(sql, [firstName, lastName, id],), (err) => {
            if (err) {
                console.error(err.message);
                return null;
            } else {
                console.log("Updated Account names success.");
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
        //add token to database
        Sessions.saveSessionToken(token);
        res.status(200).json({"token": token});
        });
      }
      else { //failed
        res.status(401).json({"error": "Password does not match."})
      }
    })
  });
  next();
}
function decodeToken (req, res, next) { //token validator and decoder middleware
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
class Sessions { //handles tokens and user sessions
    constructor(accountID, sessions) {
        this.accountID = accountID;
        this.sessions = sessions; // [token, ...]
    }
    getSessions() {
        return this.sessions; //JSON session: [{token, ...]
    }
    static getSessionTokensByID(accountID) {
        const sql = `SELECT sessions FROM Sessions
            WHERE accountID = ?`;
        db.all(sql, [accountID], (err, rows) => {
            if (err) {
                console.log("Error querying database for Sessions.");
                return null;
            }   
            if (rows.length == 0) {
                console.log("No session exists for this ID.");
                return null;
            }
            const row = rows[0];
            return JSON(row.sessions);
        });
    }
    static saveSessionToken(accountID, token) { //save the token, used with login and authentication for persistence
        const sql = `SELECT sessions FROM Sessions WHERE accountID = ?`;
        db.all(sql, [accountID], (err, rows) => {
            if (err) {
                console.log("Error querying database for Sessions.");
                return null;
            }   
            if (rows.length == 0) {
                console.log("No sessions exists at all");
                return null;
            }
            let sessionList = rows.sessions;
            sessionList.push(token);
            const sessionsAsString = "[" + sessionList.join(", ") + "]";
            const sql2 = `UPDATE Sessions
            SET sessions = ?
            WHERE accountID = ?`;
            db.run(sql2, [sessionsAsString, accountID], (err) => {
                if (err) {
                    console.log("Error querying database for Sessions.");
                }
            })
        })

    }
    static expireSessionTokensByID(accountID) { //remove all tokens belonging to that user (purge logins)
        const sql = `DELETE FROM Sessions WHERE accountID = ?`;
        db.run(sql, [accountID], (err) => {
            if (err) {
                console.log("Error querying database for Sessions.");
            }
        })
    }
    static pruneSessionToken() { //remove all expired tokens iteratively
        const sql = `SELECT sessions FROM Sessions`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.log("Error querying database for Sessions.");
                return null;
            }   
            if (rows.length == 0) {
                console.log("No sessions exists at all");
                return null;
            }
            for (let row of rows) { //for each ID's sessions,
                let sessionListValid = [];
                let sessionList = JSON(row.sessions); //parse string to list (I hope it works)
                for (token of sessionList) { //for each token in sessionList
                    //check token date validity
                    jwt.verify(token, privateKey, function(err, decoded) {
                        //console.log(decoded)
                        if (err.name != "TokenExpiredError") {
                            sessionListValid.push(token)
                        }
                    })
                }
                if (sessionListValid.length == 0) { //if no more session tokens, delete that user from Sessions
                    const sql1 = `DELETE FROM Sessions WHERE accountID = ?`;
                    db.run(sql1, [row.accountID], (err) => {
                        if (err) {
                            console.log("Error querying database for Sessions.");
                        }
                    })
                }
                else { //update user with remaining sessions
                    const sessionsAsString = "[" + sessionListValid.join(",") + "]";
                    const sql2 = `UPDATE Sessions
                    SET sessions = ?
                    WHERE accountID = ?`;
                    db.run(sql2, [sessionsAsString, row.accountID], (err) => {
                        if (err) {
                            console.log("Error querying database for Sessions.");
                        }
                    })
                }
            }
        });
    }
}

module.exports = {Account, AccountPasswordH, Sessions, checkUserCredentials, decodeToken, registerUser}