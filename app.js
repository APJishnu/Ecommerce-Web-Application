var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const exphbs=require('express-handlebars');
const { db }= require('./config/connection');
const session = require('express-session');
require('dotenv').config();

const MongoStore = require('connect-mongo');

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',exphbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layouts/',partialsDir:__dirname+'/views/partial/',runtimeOptions: {
  allowProtoPropertiesByDefault: true,
},  helpers: {
  inc: function (index) {
    return index + 1;
  },
},}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: "shoppingCart1234567",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 600000 },
    store: new MongoStore({ 
      mongoUrl: process.env.MONGODB_SESSION_URI,
      ttl: 14 * 24 * 60 * 60, // 2 weeks in seconds
    }),
  })
);




db.on('error', (err) => {
  console.log('Connection error:', err);
});

db.once('open', () => {
  console.log('Database connected');
});


app.use('/', userRouter);
app.use('/admin', adminRouter);

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
