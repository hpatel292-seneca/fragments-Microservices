const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

// Importing utility functions which are helpful in creating the response.
const { createSuccessResponse, createErrorResponse } = require('../../response');

const deleteFragmentById = async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user;
  try {
    logger.debug(`Delete fragment with ID ${id}`);
    await Fragment.delete(ownerId, id);
  } catch (error) {
    logger.error(`No fragment with ID ${id} found. Error: ${error}`);
    res.status(404).json(createErrorResponse(404, `No fragment with ID ${id} found`));
    return;
  }
  res.status(200).json(createSuccessResponse(200, {}));
};
module.exports = { deleteFragmentById };
