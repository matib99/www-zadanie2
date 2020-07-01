//const sqlite3 = require('sqlite3')
import * as sqlite3 from 'sqlite3'
const sqlite = sqlite3.verbose()

export type login_data_t = {
    id: number,
    last_change: string
}


const quiz_DATABASE = 'database.db'

export const checkSession = (user_id: number, last_change: string):Promise<boolean> => {
    return new Promise((resolve, reject) => {
        let db = new sqlite.Database(quiz_DATABASE)
        db.get(`SELECT id FROM users WHERE id = '${user_id}' AND last_change = '${last_change}'`, (err, row) => {
            if(err){
                reject(err)
            } else if(row === undefined) {
                resolve(false)
            } else {
                resolve(true)
            }
        })
    })
}


export const login = (login : string, password : string) => {
    return new Promise<login_data_t>((resolve, reject) => {
        let db = new sqlite.Database(quiz_DATABASE)
        db.get(`SELECT id, last_change FROM users WHERE login = '${login}' AND password = '${password}'`, 
        (err, rows) => {
            if(err) reject(err)
            if(rows === undefined) {
                resolve({id: undefined, last_change: undefined})
            } 
            else {
                resolve({
                    id: rows.id,
                    last_change: rows.last_change
                })
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
                const new_change = new Date().toString();
                db.run(`UPDATE users SET password='${newPassword}', last_change='${new_change}' WHERE id = '${user_id}'`, (err) =>{
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

module.exports = { checkSession, login, changePassword }