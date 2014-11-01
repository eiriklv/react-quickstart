/**
 * @jsx React.DOM
 */
'use strict';


var React       = require('react');
var ReactAsync  = require('react-async');
var ReactRouter = require('react-router-component');
var superagent  = require('superagent');

var Pages       = ReactRouter.Pages;
var Page        = ReactRouter.Page;
var NotFound    = ReactRouter.NotFound;
var Link        = ReactRouter.Link;

ReactMount.allowFullPageRender = true;

var SecondMainPage = React.createClass({

  render: function() {
    return (
      <div className="MainPage">
        <h1>Welcome to the Admin interface!</h1>
        <p><Link href="/admin/users/doe">Login</Link></p>
      </div>
    );
  }
});

var SecondUserPage = React.createClass({
  mixins: [ReactAsync.Mixin],

  statics: {
    getUserInfo: function(username, cb) {
      superagent.get(
        'http://localhost:3000/api/users/' + username,
        function(err, res) {
          cb(err, res ? res.body : null);
        });
    }
  },
  
  getInitialStateAsync: function(cb) {
    this.type.getUserInfo(this.props.username, cb);
  },

  componentWillReceiveProps: function(nextProps) {
    if (this.props.username !== nextProps.username) {
      this.type.getUserInfo(nextProps.username, function(err, info) {
        if (err) {
          throw err;
        }
        this.setState(info);
      }.bind(this));
    }
  },

  render: function() {
    var otherUser = this.props.username === 'doe' ? 'ivan' : 'doe';
    return (
      <div className="UserPage">
        <h1>Hello, {this.state.name}!</h1>
        <p>
          Go to <Link href={"/admin/users/" + otherUser}>/app/users/{otherUser}</Link>
        </p>
        <p><Link href="/admin">Logout</Link></p>
      </div>
    );
  }
});

var MainPage = React.createClass({

  render: function() {
    return (
      <div className="MainPage">
        <h1>Welcome to the User interface!</h1>
        <p><Link href="/app/users/doe">Login</Link></p>
      </div>
    );
  }
});

var UserPage = React.createClass({
  mixins: [ReactAsync.Mixin],

  statics: {
    getUserInfo: function(username, cb) {
      /*
       * The use of localhost URLs work as long as the browser is running on the same machine as the server,
       * a typical development setup.
       * As soon as you want to run this code on public facing machines, each server will need to know it's 
       * own hostname and port (which is ugly).
       * Relative paths cannot work for serverside rendering, as that has no page context.
       * More discussion of this issue, and solutions, can be found at:
       *   https://github.com/andreypopp/react-async/issues/34
       *   http://stackoverflow.com/questions/26463924/getting-rid-of-localhost3000-urls-for-reactasync
       */
      superagent.get(
        'http://localhost:3000/api/users/' + username,
        function(err, res) {
          cb(err, res ? res.body : null);
        });
    }
  },
  
  getInitialStateAsync: function(cb) {
    this.type.getUserInfo(this.props.username, cb);
  },

  componentWillReceiveProps: function(nextProps) {
    if (this.props.username !== nextProps.username) {
      this.type.getUserInfo(nextProps.username, function(err, info) {
        if (err) {
          throw err;
        }
        this.setState(info);
      }.bind(this));
    }
  },

  render: function() {
    var otherUser = this.props.username === 'doe' ? 'ivan' : 'doe';
    return (
      <div className="UserPage">
        <h1>Hello, {this.state.name}!</h1>
        <p>
          Go to <Link href={"/app/users/" + otherUser}>/app/users/{otherUser}</Link>
        </p>
        <p><Link href="/app">Logout</Link></p>
      </div>
    );
  }
});

var NotFoundHandler = React.createClass({

  render: function() {
    return (
      <p>Page not found</p>
    );
  }
});

var App = React.createClass({

  render: function() {
    return (
      <html>
        <head>
          <link rel="stylesheet" href="/assets/style.css" />
          <script src="/assets/bundle.js" />
        </head>
        <Pages className="App" path={this.props.path}>
          <Page path="/" handler={MainPage} />
          <Page path="/users/:username" handler={UserPage} />
          <NotFound handler={NotFoundHandler} />
        </Pages>
      </html>
    );
  }
});

var SecondApp = React.createClass({

  render: function() {
    return (
      <html>
        <head>
          <link rel="stylesheet" href="/assets/style.css" />
          <script src="/assets/bundle.js" />
        </head>
        <Pages className="App" path={this.props.path}>
          <Page path="/" handler={SecondMainPage} />
          <Page path="/users/:username" handler={SecondUserPage} />
          <NotFound handler={NotFoundHandler} />
        </Pages>
      </html>
    );
  }
});

module.exports = {
  App: App,
  SecondApp: SecondApp
};

if (typeof window !== 'undefined') {
  window.onload = function() {
    React.renderComponent(App(), document);
  }
}
