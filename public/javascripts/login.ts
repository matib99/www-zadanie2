//const sqlite3 = require('sqlite3')
import * as sqlite3 from 'sqlite3'
const sqlite = sqlite3.verbose()

const quiz_DATABASE = 'database.db'
export const login = (login : string, password : string) => {
    return new Promise<number>((resolve, reject) => {
        let db = new sqlite.Database(quiz_DATABASE)
        db.get(`SELECT id FROM users WHERE login = '${login}' AND password = '${password}'`, 
        (err, rows) => {
            if(err) reject(err)
            if(rows === undefined) {
                resolve(undefined)
            } 
            else {
                resolve(rows.id)
            }
        })
    })
} 