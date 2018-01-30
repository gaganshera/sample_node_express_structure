/**
 * Created by Gaganjot on 20/01/18.
 */
 
var Config = require('./config/constants');
global.C = new Config();

// Log uncaught exception as well
process.on('uncaughtException', function (exception) {
  console.log('########## SERVER CRASHED WITH UNCAUGHT EXCEPTION ##########');
  var err = exception;
  if (typeof err === 'object') {
            if (err.message) {
                console.log('\nMessage: ' + err.message)
            }
            if (err.stack) {
                console.log('\nStacktrace:')
                console.log('====================')
                console.log(err.stack);
            }
        } else {
            console.log('dumpError :: argument is not an object');
        }
});

Object.defineProperty(global, '__stack', {
    get: function() {
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_, stack) {
            return stack;
        };
        var err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

Object.defineProperty(global, '__line', {
get: function() {
        return __stack[1].getLineNumber();
    }
});

Object.defineProperty(global, '__function', {
get: function() {
        return __stack[1].getFunctionName();
    }
});

Object.defineProperty(global, '__file', {
get: function() {
        return __stack[1].getFileName();
    }
});

global.cl = function(data, line, func, file) {
    console.log(data);
    var str = '^';
    if(typeof func != 'undefined')
        str += ` Function ${func}`;
    if(typeof line != 'undefined')
        str += ` On line ${line}`;
    if(typeof file != 'undefined')
        str += ` In file ${file}`;
    if(str != '^')
        console.log(str);
}

global.ul = function(data, line, func, file) {
    var util = require('util');
    if(process.env.NODE_ENV !== 'production')
        console.log(util.inspect(data, false, null));
    var str = '^';
    if(typeof func != 'undefined')
        str += ` Function ${func}`;
    if(typeof line != 'undefined')
        str += ` On line ${line}`;
    if(typeof file != 'undefined')
        str += ` In file ${file}`;
    if(str != '^')
        console.log(str);
}

//process.on('warning', function (warning) {
//  console.log('########## SERVER CRASHED WITH WARNING ##########');
//  console.log(warning);
//});

// require('./config/winston-config.js');
// var winston = require('winston');

//------------Mongo Connection ------------//
var mongoose = require('mongoose');
var mongooseOptions = {
    server:{
        auto_reconnect: true,
        socketOptions:{
            connectTimeoutMS:3600000,
            keepAlive:3600000,
            socketTimeoutMS:3600000
        }
    }
};
// use createConnection instead of calling mongoose.connect so we can use
// multiple connections
mongoose.connection.on('open', function (ref) {
  cl('Connected to mongo server.');
});
mongoose.connection.on('error', function (err) {
  cl('Could not connect to mongo server!');
});

var mongoDisconnectionsCount = 0;
//https://stackoverflow.com/questions/16226472/mongoose-autoreconnect-option
mongoose.connection.on('reconnected', function () {
    mongoDisconnectionsCount = 0;
    console.log('MongoDB reconnected!');
});
mongoose.connection.on('disconnected', function() {
    console.log('MongoDB disconnected!');
    ++mongoDisconnectionsCount;
    if(mongoDisconnectionsCount === 1 && process.env.NODE_ENV === 'production') {
        //send mail
        let from = 'gaganjot.singh@girnarsoft.com';
        let to = ['gaganjot.singh@girnarsoft.com', 'saurabh.gupta@girnarsoft.com', 'sanjay.singh@girnarsoft.com'];
        let subject = 'Mongo Restarted on ' + process.env.NODE_ENV;
        let body = `Mongo Restarted at ` + new Date();
        mailer(to, subject, body, from, [], []);
    }
    // mongoose.connect(C.mongodbConnection, mongooseOptions);
});

mongoose.connect(C.mongodbConnection, mongooseOptions, function(error, db) {
});

mongoose.Promise = global.Promise;//TODO - Ref:- https://github.com/Automattic/mongoose/issues/4291
//------------Mongo Connection ------------//

// Importing other modules
var express = require('express');
bodyParser = require('body-parser'),
path = require('path'),
http = require('http'),
request = require('request');
var app = express()
methodOverride = require('method-override'),
router = express.Router();
moment = require('moment-timezone');
moment.tz.setDefault("Asia/Calcutta");

global._ = require('underscore');
app.set('port', process.env.PORT || C.defaultPort);
app.set('hostname', C.hostname);
app.set('view engine', 'ejs');
app.enable('trust proxy');

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ type: 'text/plain', limit: '50mb' }));
app.use(bodyParser.json({ type: 'application/json', limit: '50mb' }));
app.use(methodOverride());

/*
 *  To ignore third party server ssl certificate authentication
 */
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

// If in dev mode, don't cache static resources
var staticContentMaxAge = 0;
if (process.env.NODE_ENV === 'production') {
  staticContentMaxAge = 1000 * 60 * 60 * 24;
}
// static directory
app.use(express.static(path.join(__dirname, 'public'), {maxAge: staticContentMaxAge }));

////////////// Cors ////////////
var cors = require('cors');
// use it before all route definitions
app.use(cors({origin: '*','exposedHeaders' : ['X-Total-Count','Content-Type'], credentials: true}));
////////////// Cors ////////////

var apiRoute = require('./routes/api-route') (app, router);
//var apiRoute = require('./routes/restify-route') (app, router);

var server = http.createServer(app);

server.listen(app.get('port'), function(){
  cl('Express server listening on port ' + app.get('port'));
});
module.exports = server;