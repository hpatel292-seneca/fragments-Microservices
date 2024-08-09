const logger = require('../logger');
const sharp = require('sharp');
const yaml = require('js-yaml');

// Checks to see whether the fragment Data and the fragment Type match
module.exports.validateFragment = async (fragmentData, fragmentType) => {
  switch (fragmentType) {
    case 'application/json':
      // Throw an error if the program is unable to parse the JSON
      validateJson(fragmentData);
      break;

    case 'application/yml':
    case 'application/yaml':
      // Throw an error if the program is unable to parse the YAML
      validateYaml(fragmentData);
      break;

    case 'text/plain':
      // Ensure the data is a valid text
      validateText(fragmentData);
      break;

    case 'image/jpeg':
    case 'image/png':
    case 'image/webp':
    case 'image/avif':
    case 'image/gif': {
      // Throw an Error if the program is unable to parse the image
      await validateImage(fragmentData, fragmentType);
      break;
    }
  }
};

const validateJson = (fragmentData) => {
  try {
    JSON.parse(fragmentData);
  } catch (error) {
    logger.error(`Invalid JSON data, ${error.message}`);
    throw new Error(`Invalid JSON data, ${error.message}`);
  }
};

const validateYaml = (fragmentData) => {
  try {
    yaml.load(fragmentData.toString());
  } catch (error) {
    logger.error(`Invalid YAML data, ${error.message}`);
    throw new Error(`Invalid YAML data, ${error.message}`);
  }
};

const validateText = (fragmentData) => {
  console.log('Entered text block');
  if (typeof fragmentData !== 'string' && !Buffer.isBuffer(fragmentData)) {
    logger.error('Invalid text data, must be a string or buffer');
    throw new Error('Invalid text data, must be a string or buffer');
  }
};

const validateImage = async (fragmentData, fragmentType) => {
  try {
    // Use sharp to get metadata about the image
    const metadata = await sharp(fragmentData).metadata();

    const expectedFormat = fragmentType.split('/')[1];
    let actualFormat = metadata.format;

    // Handle the AVIF format being reported as HEIF by sharp
    if (expectedFormat === 'avif' && actualFormat === 'heif') {
      actualFormat = 'avif';
    }

    if (actualFormat !== expectedFormat) {
      logger.error(
        `Invalid image data, expected ${expectedFormat} but ${actualFormat} was passed instead`
      );
      throw new Error(
        `Invalid image data, expected ${expectedFormat} but ${actualFormat} was passed instead`
      );
    }
  } catch (error) {
    logger.error(`Invalid image data, ${error.message}`);
    throw new Error(`Invalid image data, ${error.message}`);
  }
};
