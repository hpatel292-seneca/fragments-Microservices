// src/routes/api/get.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');

/**
 * Get a list of fragments for the current user
 */
const getFragments = async (req, res) => {
  logger.debug(`Get all fragment for user ${req.user}`);
  try {
    const expand = req.query.expand || 0;
    const fragments = await Fragment.byUser(req.user, expand);

    res.status(200).json(createSuccessResponse({ fragments }));
  } catch (error) {
    logger.error(`Failed to get fragment for user ${req.user}, Error: ${error}`);
    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
};

const splitExtension = (id) => {
  const arr = id.split('.');
  const extension = arr[1] ? '.' + arr[1] : null;
  // return extension and ID
  return { fragmentId: arr[0], extension: extension };
};
const mimeType = {
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.html': 'text/html',
  '.csv': 'text/csv',
  '.json': 'application/json',
  '.yaml': 'application/yaml',
  '.yml': 'application/yaml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
};
// Get fragment with passed fragmentID
const getFragmentByID = async (req, res) => {
  // Get fragment ID send by user
  const { id } = req.params;
  logger.debug(`get fragment by ID ${id}`);
  let { fragmentId, extension } = splitExtension(id);
  const ownerId = req.user;

  let fragment, fragmentMetadata;
  try {
    fragmentMetadata = await Fragment.byId(ownerId, fragmentId);

    logger.debug({ fragmentMetadata }, 'Fragment Metadata');

    fragment = new Fragment(fragmentMetadata);

    if (extension) {
      if (fragment.formats.includes(extension)) {
        logger.debug(`Return fragment in type ${extension}`);
        try {
          const fragmentData = await fragment.getConvertedInto(extension);
          res.status(200).type(mimeType[extension]).send(fragmentData);
          return;
        } catch (err) {
          logger.error({ err }, 'Error converting fragment');
          res.status(415).json(createErrorResponse(415, err.message));
          return;
        }
      } else {
        logger.error({ extension }, 'Unsupport extension demanded!');
        res
          .status(415)
          .json(
            createErrorResponse(
              415,
              'The fragment cannot be converted into the extension specified!'
            )
          );
        return;
      }
    }

    const fragmentData = await fragment.getData();

    res.status(200).type(fragment.mimeType).send(fragmentData);
  } catch (error) {
    logger.error(`No fragment with ID ${fragmentId} found. Error: ${error}`);
    res.status(404).json(createErrorResponse(404, `No fragment with ID ${fragmentId} found`));
    return;
  }
};

const getFragmentInfo = async (req, res) => {
  const { id } = req.params;

  let fragmentMetadata;

  try {
    fragmentMetadata = await Fragment.byId(req.user, id);

    logger.debug({ fragmentMetadata }, 'fragment metadata');
  } catch (error) {
    logger.error(`No fragment with ID ${id} found. Error: ${error}`);
    res.status(404).json(createErrorResponse(404, `No fragment with ID ${id} found`));
    return;
  }

  res.status(200).json(createSuccessResponse({ fragment: fragmentMetadata }));
};
module.exports = {
  getFragments,
  getFragmentByID,
  getFragmentInfo,
};
