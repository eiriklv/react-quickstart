'use strict';

var path        = require('path');
var url         = require('url');
var express     = require('express');
var browserify  = require('connect-browserify');
var ReactAsync  = require('react-async');
var nodejsx     = require('node-jsx').install();
var App         = require('./client').App;
var SecondApp   = require('./client').SecondApp;

var development = process.env.NODE_ENV !== 'production';

function renderApp(req, res, next) {
  var path = url.parse(req.url).pathname;
  var app = App({path: path});

  console.log('rendering user app - ' + 'path: ' + path);

  ReactAsync.renderComponentToStringWithAsyncState(app, function(err, markup) {
    if (err) {
      return next(err);
    }
    res.send('<!doctype html>\n' + markup);
  });
}

function renderSecondApp(req, res, next) {
  var path = url.parse(req.url).pathname;
  var app = SecondApp({path: path});

  console.log('rendering admin app - ' + 'path: ' + path);

  ReactAsync.renderComponentToStringWithAsyncState(app, function(err, markup) {
    if (err) {
      return next(err);
    }
    res.send('<!doctype html>\n' + markup);
  });
}

var api = express()
  .get('/users/:username', function(req, res) {
    console.log('accessing api..');
    var username = req.params.username;
    res.send({
      username: username,
      name: username.charAt(0).toUpperCase() + username.slice(1)
    });
  });

var app = express();

if (development) {
  app.get('/assets/bundle.js',
    browserify('./client', {
      debug: true,
      watch: true
    }));
}

app
  .use('/assets', express.static(path.join(__dirname, 'assets')))
  .use('/api', api)
  .use('/app', renderApp)
  .use('/admin', renderSecondApp)
  .listen(3000, function() {
    console.log('Point your browser at http://localhost:3000');
  });
