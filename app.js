import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import dotenv from 'dotenv';
//import bodyParser from 'body-parser'
const __dirname = path.resolve();
dotenv.config()
import MongoHelper from './Helper/MongoHelper.js';
import Login from "./routes/Login.js"
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json({ extended: true, limit: "16mb" }));
app.use(express.urlencoded({ extended: true, limit: "16mb" }))
app.use(cookieParser());
app.use((express.static(path.join(__dirname, 'public'))));

MongoHelper();

//route
app.use('/', Login);

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
});

export default app;