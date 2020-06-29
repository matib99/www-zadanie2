import * as express from 'express'
var router = express.Router();
import { askForQuiz } from '../public/javascripts/quiz'

/* GET home page. */
router.get('/', function(req, res) {
  res.redirect('/quizzes/all')
});

module.exports = router;
