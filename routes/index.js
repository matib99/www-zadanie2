"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
var router = express.Router();
const quizz_1 = require("../public/javascripts/quizz");
router.get('/', function (req, res) {
    quizz_1.askForQuiz(3, 3).then(() => { });
    res.render('index', { title: 'Quizy' });
});
module.exports = router;
