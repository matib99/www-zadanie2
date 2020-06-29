"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3 = __importStar(require("sqlite3"));
const sqlite = sqlite3.verbose();
const quiz_DATABASE = 'database.db';
exports.login = (login, password) => {
    return new Promise((resolve, reject) => {
        let db = new sqlite.Database(quiz_DATABASE);
        db.get(`SELECT id FROM users WHERE login = '${login}' AND password = '${password}'`, (err, rows) => {
            if (err)
                reject(err);
            if (rows === undefined) {
                resolve(undefined);
            }
            else {
                resolve(rows.id);
            }
        });
    });
};
