var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var PORT = 5000;
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users.route');
var http = require('http');
var bodyParser = require('body-parser')
const mongoose = require("mongoose");

var app = express();
var server = http.createServer(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.json());



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


app.use('/', indexRouter);
app.use('/user', usersRouter);

//configuration of database
mongoose.set('useCreateIndex', true);
mongoose.Promise = global.Promise;

//connecting to database
mongoose.connect('mongodb://127.0.0.1:27017/test', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



server.listen(PORT, '0.0.0.0', function () {
  console.log("Express http server listening on *:" + PORT);
});
module.exports = app;
