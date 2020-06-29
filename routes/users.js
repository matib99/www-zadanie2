"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const login_1 = require("../public/javascripts/login");
const express = __importStar(require("express"));
var router = express.Router();
router.get('/', (req, res) => {
    res.send('respond with a resource');
});
router.get('/login', (req, res) => {
    res.render('login', { logged: (req.session.userID !== undefined), login: true });
});
router.get('/logout', (req, res) => {
    req.session.userID = undefined;
    res.status(200);
    res.redirect("../");
});
router.post('/login', (req, res) => {
    login_1.login(req.body.login, req.body.password)
        .then((userID) => {
        if (userID === undefined) {
            res.status(403);
            res.send("Wrong login or password");
        }
        else {
            req.session.userID = userID;
            res.status(200);
            res.redirect('../quizzes/all');
        }
    })
        .catch((err) => {
        res.status(500);
    });
});
module.exports = router;
