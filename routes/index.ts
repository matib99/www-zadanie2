import * as express from 'express'
var router = express.Router();
import { askForQuiz } from '../public/javascripts/quizz'

/* GET home page. */
router.get('/', function(req, res) {
  askForQuiz(3,3).then(()=>{})
  res.render('index', { title: 'Quizy' });
});

module.exports = router;
