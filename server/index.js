#!/usr/bin/env nodejs

var express = require('express');
var app = express();
var request = require("request");  // To make HTTP requests at the server side

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


// initialize data fetch timer
setTimeout(sources.fetchDataSources, 2000);

function stripData(data){
  var stripedData = [];
  var pushEventCounter = 0;
  var IssueCommentEventCounter = 0;
  var IssuesEventCounter = 0;
  data.forEach(function(data){
    if(data.type == 'PushEvent'){
      if(pushEventCounter > 3) return;
      if(data.payload.size != 0){
        stripedData.push({
          'id': data.id,
          'type': data.type,
          'user': data.actor.display_login,
          'user_avatar': data.actor.avatar_url + 'v=3&s=64',
          'repo_id': data.repo.id,
          'repo_name': data.repo.name,
          'payload_size': data.payload.size,
          'message': data.payload.commits[0].message,
          'created': data.created_at,
          'url': data.repo.url
        });
        pushEventCounter++;
      }
    }else if(data.type == 'IssueCommentEvent'){
      stripedData.push({
        'id': data.id,
        'type': data.type,
        'user': data.actor.display_login,
        'user_avatar': data.actor.avatar_url + 'v=3&s=64',
        'repo_id': data.repo.id,
        'repo_name': data.repo.name,
        'payload_size': 0,
        'message': data.body,
        'created': data.created_at,
        'url': data.payload.comment.html_url
      });
    }else if(data.type == 'PullRequestEvent'){
      if (data.payload.pull_request.merged) data.payload.action = 'merged';
      stripedData.push({
        'id': data.id,
        'type': data.type,
        'user': data.actor.display_login,
        'user_avatar': data.actor.avatar_url + 'v=3&s=64',
        'repo_id': data.repo.id,
        'repo_name': data.repo.name,
        'action': data.payload.action,  // opened, reopened, closed, merged
        'message': data.payload.pull_request.title,
        'created': data.created_at,
        'url': data.payload.pull_request.html_url
      });
    }else if(data.type == 'IssuesEvent'){
      stripedData.push({
        'id': data.id,
        'type': data.type,
        'user': data.actor.display_login,
        'user_avatar': data.actor.avatar_url + 'v=3&s=64',
        'repo_id': data.repo.id,
        'repo_name': data.repo.name,
        'action': data.payload.action,  // opened, reopened, closed
        'message': data.payload.issue.title,
        'created': data.created_at,
        'url': data.payload.issue.html_url
      });
    }
  });
  return stripedData;
}
