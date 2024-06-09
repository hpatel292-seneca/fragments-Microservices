// src/auth/basic-auth.js
const auth = require('http-auth');
//const passport = require('passport');
const authPassport = require('http-auth-passport');

// We'll use our authorize middle module
const authorize = require('./auth-middleware');

if (!process.env.HTPASSWD_FILE) {
  throw new Error('missing expected env var: HTPASSWD_FILE');
}

module.exports.strategy = () =>
  authPassport(
    auth.basic({
      file: process.env.HTPASSWD_FILE,
    })
  );

module.exports.authenticate = () => authorize('http');
