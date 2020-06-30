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

export const changePassword= (user_id: number, oldPassword : string, newPassword : string) => {
    return new Promise<boolean>((resolve, reject) => {
        let db = new sqlite.Database(quiz_DATABASE)
        db.get(`SELECT id FROM users WHERE id = '${user_id}' AND password = '${oldPassword}'`, 
        (err, rows) => {
            if(err) {
                reject(err)
                return;
            }
            if(rows === undefined) {
                resolve(false)
                return;
            } 
            else {
                db.run(`UPDATE users SET password='${newPassword}' WHERE id = '${user_id}'`, (err) =>{
                    if(err) {
                        reject(err)
                        return;
                    } else 
                    resolve(true)
                })
            }
        })
    })
} 