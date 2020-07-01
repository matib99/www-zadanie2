var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session)

var login = require('./public/javascripts/login');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var quizzesRouter = require('./routes/quizzes');

var app = express();

app.use(session( { 
      store: new SQLiteStore,
      secret: 'supertajnysekret',
      resave: true,
      cookie: { maxAge: 1000 * 60 * 60 },
      saveUninitialized: false 
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  if(req.session.userID !== undefined) {
    login.checkSession(req.session.userID, req.session.lastChange)
    .then((ret) => {
      if(ret) {
        next()
      } else {
        req.session.userID = undefined;
        next()
      }
    })
  } else {
    next()
  }
})

app.use(function (req, res, next) {
  if(req.session.userID === undefined && req.url !== '/users/login') {
    console.log("URL: ", req.url)
    res.redirect('/users/login')
  }
  else
    next()
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/quizzes', quizzesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
