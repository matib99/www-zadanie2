import { login } from "../public/javascripts/login"
import * as express from 'express'

//var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
  res.send('respond with a resource');
});

router.get('/login', (req, res) => {
  res.render('login', {logged: (req.session.userID !== undefined), login: true})
});

router.get('/logout', (req, res) => {
  req.session.userID = undefined
  res.status(200)
  res.redirect("../")

});

router.post('/login', (req, res) => {
    login(req.body.login, req.body.password)
    .then((userID) => {
      if(userID === undefined) {
        res.status(403)
        res.send("Wrong login or password")
      } else {
        req.session.userID = userID
        res.status(200)
        res.redirect('../quizzes/all')
      }
    })
    .catch((err) => {
      res.status(500);
    })
});

module.exports = router;
