const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');
const logger = require('../../logger');

// Importing utility functions which are helpful in creating the response.
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Add a new fragments for the current user
 */
module.exports = async (req, res) => {
  // Getting the type of data.
  const { type } = contentType.parse(req);

  logger.debug('Adding fragments of type ' + type);

  // get raw fragments data
  const rawFragmentData = req.body;

  if (!Buffer.isBuffer(rawFragmentData)) {
    logger.warn({ type }, 'Trying to store unsupported fragment type!');
    res
      .status(415)
      .json(createErrorResponse(415, 'Unsupported fragment type requested by the client!'));
    return;
  }

  logger.debug({ contentType: type }, 'Content-Type accepted');

  let fragment;

  try {
    // Creating a fragment metadata!
    logger.debug(`User: ${req.user}`);
    fragment = new Fragment({ ownerId: req.user, type: type });
    // Saving the fragment metadata!
    await fragment.save();
    // Storing the fragment data!
    await fragment.setData(rawFragmentData);
  } catch (error) {
    logger.error(`Error while storing the fragment. Error: ${error}`);
    res.status(500).json(createErrorResponse(500, 'Internal Server Error!'));
    return;
  }

  // fragment url
  const location = (process.env.API_URL || req.headers.host) + `/v1/fragments/${fragment.id}`;

  // make sure location is properly created
  if (!location) {
    logger.error({ location }, 'Error creating fragment location');
    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }

  res
    .status(201)
    .location(location)
    .json(
      createSuccessResponse({
        fragment: {
          id: fragment.id,
          ownerId: fragment.ownerId,
          created: fragment.created,
          updated: fragment.updated,
          type: fragment.type,
          size: fragment.size,
        },
      })
    );
};
