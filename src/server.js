// src/server.js

// gracefully shutdown our server
const stoppable = require('stoppable');

// get logger
const logger = require('./logger');

// Get our Express app instance
const app = require('./app');

// Get the desired port from the process environment. Defaults to `8080`.
const port = parseInt(process.env.PORT || '8080', 10);

// Start a server listening on this port
const server = stoppable(
  app.listen(port, () => {
    // Log a message that the server has started, and which port it's using.
    logger.info(`Server started on port ${port}`);
  })
);

// Export our server instance so other parts of our code can access it if necessary.
module.exports = server;
