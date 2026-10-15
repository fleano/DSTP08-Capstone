const fs = require('fs'); //filesystem
const path = require('path'); //file dir
const {getQuery, runQuery, allQuery, database} = require('../1-auth/controllers/register.controller');
const { isBooleanObject } = require('util/types');
const db = database;
//const multer  = require('mu

class Schedule {
    static async getSchedule(req, res, next) {
        const sql1 = `SELECT * FROM Schedule;`
        let result
        try {
            result = await allQuery(sql1, [])
            res.locals.schedule = result;
            console.log(res.locals)
        }
        catch (error) {
            return res.status(400).json({error: "Could not query Schedule table"})
        }
        next();
    }
    static async addNote(req, res, next) {
        const sql1 = `INSERT INTO Schedule (date, note)
        VALUES (?,?)`
        let result
        try {
            result = await getQuery(sql1, [req.body.date, req.body.note])
            res.status(201).json({message: "Added note successfully"})
        }
        catch (error) {
            return res.status(400).json({error: "Could not query Schedule table"})
        }
        next();
    }
}

module.exports = {Schedule}
