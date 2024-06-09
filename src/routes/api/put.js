const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');
const logger = require('../../logger');

// Importing utility functions which are helpful in creating the response.
const { createSuccessResponse, createErrorResponse } = require('../../response');

const updateFragment = async (req, res) => {
  // Get fragment ID send by user
  const { id } = req.params;
  const { type } = contentType.parse(req);
  const fragmentData = req.body;
  const ownerId = req.user;
  logger.debug(`get fragment by ID ${id}`);

  if (!Buffer.isBuffer(fragmentData)) {
    logger.warn({ type }, 'Trying to store unsupported fragment type!');
    res
      .status(415)
      .json(createErrorResponse(415, 'Unsupported fragment type requested by the client!'));
    return;
  }

  let fragment, fragmentMetadata;
  try {
    fragmentMetadata = await Fragment.byId(ownerId, id);

    fragment = new Fragment(fragmentMetadata);
  } catch (error) {
    logger.error(`No fragment with ID ${id} found. Error: ${error}`);
    res.status(404).json(createErrorResponse(404, `No fragment with ID ${id} found`));
    return;
  }

  if (type != fragmentMetadata.type) {
    logger.error(`New content type is passed`);
    res
      .status(400)
      .json(createErrorResponse(400, `Cannot change type of the fragment to ${type}!`));
    return;
  }

  try {
    await fragment.setData(fragmentData);

    res.status(200).json(
      createSuccessResponse({
        fragment: await Fragment.byId(ownerId, id),
      })
    );
  } catch (error) {
    res.status(500).json(createErrorResponse(500, `Internal server error, ${error}`));
  }
};

module.exports = { updateFragment };
