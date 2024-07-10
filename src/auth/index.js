// src/auth/index.js
const logger = require('../logger');

if (process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID) {
  /* istanbul ignore next */
  module.exports = require('./cognito');
} else if (process.env.HTPASSWD_FILE && process.NODE_ENV !== 'production') {
  logger.debug('Using Basic Authentication');
  module.exports = require('./basic-auth');
} else {
  /* istanbul ignore next */
  throw new Error('missing env vars: no authorization configuration found');
}
