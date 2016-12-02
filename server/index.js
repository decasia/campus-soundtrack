#!/usr/bin/env nodejs

var express = require('express');
var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

var helmet = require('helmet');  // To change response headers

// To temporarily store JSON data from GitHub and also
// the number of connected users
var redis = require("redis"),
    redis_client = redis.createClient();

var path = require('path');

const logger = require('./logger');
const sources = require('./sources');
const argv = require('minimist')(process.argv.slice(2));
const isDev = process.env.NODE_ENV !== 'production';

// Get the intended port number, use port 8000 if not provided
const port = argv.port || process.env.PORT || 8000;
server.listen(port, (err) => {
  if(err){
    return logger.error(err.message);
  }
});
if(isDev)
  logger.appStarted(port, 'http://localhost');
else
  logger.appStarted(port);

// Apply security middlewares
app.use(helmet());

// Remove x-powered-by header
app.disable('x-powered-by');

// server static files
app.use('/static', express.static('app'));

// Load main web page
app.get('/', function (req, res) {
  res.sendFile(path.resolve('app/index.html'));
});

var allClients = [];

redis_client.set('connected_users', 0);

// When a socket connection is created
io.on('connection', function (socket) {
  allClients.push(socket);
  redis_client.incr('connected_users');
  socket.on('disconnect', function() {
     logger.v('Got disconnect!');
     var i = allClients.indexOf(socket);
     allClients.splice(i, 1);
     redis_client.decr('connected_users');
  });
  socket.on('error', function(){
    logger.error('Got errored!');
    redis_client.decr('connected_users');
  })
});


function fetchDataSources() {
  allClients.forEach(function(socket){
    if(socket != null && socket.connected == true){
        redis_client.get('connected_users', function(err, count) {
            if (!err && count != null) {
              socket.volatile.json.emit('campus', {data: sources.sampleData(), connected_users: count});
            } else {
              logger.error(err.message);
            }
        });
    }
  });
  setTimeout(fetchDataSources, 2000);
}

// initialize data fetch timer
setTimeout(fetchDataSources, 2000);
