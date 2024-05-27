const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');
const authenticate = require('./auth');
const logger = require('./logger');
const pino = require('pino-http')({ logger });
const { createErrorResponse } = require('./response');
// Create a express app instance
const app = express();

// use pino logging middleware for logging http request and response
app.use(pino);

// Use helmetjs security middleware
app.use(helmet());

// Use CORS middleware so we can make requests across origins
app.use(cors());

// Use gzip/deflate compression middleware
app.use(compression());

// Set up our passport authentication middleware
passport.use(authenticate.strategy());
app.use(passport.initialize());

// Define our routes
app.use('/', require('./routes'));

// 404 middleware to handle any requests for resources that can't be found.
app.use((req, res) => {
  res.status(404).json(
    createErrorResponse(404, 'Not Found')
    //   {
    //   status: 'error',
    //   error: {
    //     message: 'not found',
    //     code: 404,
    //   },
    // }
  );
});

// error-handling middleware to deal with anything else
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  // if this is a server error, log something.
  if (status > 499) {
    logger.error({ err }, `Error processing request`);
  }

  res.status(status).json(
    createErrorResponse(status, message)
    //   {
    //   status: 'error',
    //   error: {
    //     message,
    //     code: status,
    //   },
    // }
  );
});

// Export our `app`
module.exports = app;
