import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import SocketConnection from './Controllers/SocketConnection.js'
import RedisConnection from './Helpers/RedisConnection.js'
import Debug from 'debug';
const debug = Debug('Learning-English-API:server')
import MongoHelper from './Helpers/MongoHelper.js';
import events from 'events'
//import bodyParser from 'body-parser'
const __dirname = path.resolve();
dotenv.config()

var app = express();

//import router
import User from "./routes/User.js"
import Frame from "./routes/Frame.js"
import Group from "./routes/Group.js"
import PrivateMessage from "./routes/PrivateMessage.js"
import PublicMessage from "./routes/PublicMessage.js"
import Course from "./routes/Course.js"
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cors())
app.use(logger('dev'));
app.use(express.json({ extended: true, limit: "16mb" }));
app.use(express.urlencoded({extended: true, limit: "16mb"}))
app.use(cookieParser());
//app.use(fileUpload());
app.use(express.static(path.join(__dirname, "upload")));
app.use((express.static(path.join(__dirname, 'public'))));
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader("Access-Control-Allow-Headers", "userid, authorization, Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

//Connect database
MongoHelper.Initialise();
events.defaultMaxListeners = 50;
//route
app.get('/', async (req, res) => {
    res.send('Welcome to Learn English Project')
})
app.use('/', User);
app.use('/privateMessage', PrivateMessage);
app.use('/frames', Frame);
app.use('/groups', Group);
app.use('/courses', Course);
app.use('/publicMessage', PublicMessage);
app.get('/websocket',  (req, res) => {
   res.render('room')   
})
let roomId = '12345'
app.get('/call',  (req, res) => {
    res.render('video', {roomId : roomId})   
 })

let server = createServer(app);

RedisConnection.Initialise();
SocketConnection.Initialise(server);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    
    // render the error page
    res.status(err.status || 500);
});
var port = normalizePort(process.env.PORT || '3001');

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Express listening on port '+ addr.port)
    debug('Listening on ' + bind);
}

export default app;