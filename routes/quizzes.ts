import { getQuizList, askForQuiz, switchQuestion, submitAnswers, getResults} from "../public/javascripts/quiz"
import * as express from 'express'
import { strToInt } from '../public/javascripts/misc'


//var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
  res.send('respond with a resource');
});

router.get('/all', (req, res) => {
  getQuizList(req.session.userID)
  .then((list) => {
    console.log("LISTA QUIzÓW: ", list)
    res.render('quizList', {list: list, redirect: res.redirect})
  })
  .catch((err) => {
      res.status(500)
      res.send(err)
  })
  
});

router.get('/start/:id', (req, res) => {
  askForQuiz( parseInt(req.params.id) , req.session.userID)
  .then((quiz) => {
    req.session.quiz = quiz
    res.redirect('/quizzes/solve')
  })
  .catch((err) => {
      res.status(500)
      res.send(err)
  })
});

router.get('/solve', (req, res) => {
  if(req.session.quiz === undefined) {
    res.status(403)
  } else
  if(req.session.quiz.user_id !== req.session.userID) {
    res.status(403)
  } else {
    console.log("STAN QUIZU", req.session.quiz)
    res.render('quiz', {quiz: req.session.quiz, bad_answer: false})
  }
});

router.post('/solve/answer', (req, res) => {
  if(req.session.quiz === undefined) {
    res.status(403)
  } else
  if(req.session.quiz.user_id !== req.session.userID) {
    res.status(403)
  } else {
    const answer = strToInt(req.body.answer)
    if(answer === undefined && req.body.answer !== '') {
      res.render('quiz', {quiz: req.session.quiz, bad_answer: true})
    } else {
      switchQuestion(req.session.quiz, answer, 
        (req.session.quiz.current_question + (req.body.next ? 1 : (req.body.prev ? -1 : 0))))
      
      if(req.body.submit) {
        if(req.session.quiz.questions_left !== 0) {
          res.render('quiz', {quiz: req.session.quiz, bad_answer: true})
        }
        else {
          submitAnswers(req.session.quiz, req.session.userID)
          .then(() => {
            const quiz_id: number = req.session.quiz.id
            req.session.quiz = undefined
            res.redirect(`/quizzes/results/${quiz_id}`)
          })
          .catch((err) => {
            console.log("coś sie cossie popsuło sie :c", err)
            res.send(err)
          })
        }
      }
      else
        res.render('quiz', {quiz: req.session.quiz, bad_answer: false})
    } 
  }
})

router.get('/results/:id', (req, res) => {
  getResults(parseInt(req.params.id), req.session.userID)
  .then((result) => {
    res.render('results', {result: result})
  })
  .catch((err) => {
    // blab labla
    res.render('index', {message: err})
  })
  
});

module.exports = router;
