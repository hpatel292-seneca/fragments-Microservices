// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const logger = require('../logger');
const markdownit = require('markdown-it');
const csv = require('csvtojson');
const sharp = require('sharp');
const yaml = require('js-yaml'); // Import js-yaml for JSON to YAML conversion
const md = markdownit();

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');
//const { write } = require('fs');

const validTypes = [
  `text/plain`,
  `text/markdown`,
  `text/html`,
  `text/csv`,
  `application/json`,
  `application/yaml`,
  `image/png`,
  `image/jpeg`,
  `image/webp`,
  `image/gif`, // confirm we are excepting this as well.
  `image/avif`,
];

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (ownerId === undefined || type === undefined) {
      throw new Error('OwnerId and type must be defined');
    }
    if (typeof size !== 'number' || size < 0) {
      throw new Error('Size must be a positive number');
    }
    let arr = type.split(';');
    if (!validTypes.includes(arr[0].trim())) {
      throw new Error('type must be a supported type and got ' + arr[0].trim());
    }
    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.type = type;
    this.size = size;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    const result = await listFragments(ownerId, expand);
    return result;
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    if (!ownerId || !id) {
      throw new Error('OwnerId and id must be defined');
    }
    const result = await readFragment(ownerId, id);
    if (result === undefined) {
      throw new Error('Fragment not found');
    }
    return result;
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static async delete(ownerId, id) {
    return await deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  async save() {
    this.updated = new Date().toISOString();
    await writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  async getData() {
    return await readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (data === undefined) {
      throw new Error('data must be specified');
    }
    this.size = Buffer.byteLength(data);
    this.updated = new Date().toISOString();
    writeFragment(this);
    return await writeFragmentData(this.ownerId, this.id, data);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    const { type } = contentType.parse(this.type);
    return type.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    const validConversions = {
      'text/plain': ['text/plain'],
      'text/markdown': ['text/markdown', 'text/html', 'text/plain'],
      'text/html': ['text/html', 'text/plain'],
      'text/csv': ['text/csv', 'text/plain', 'application/json'],
      'application/json': ['application/json', 'application/yaml', 'text/plain'],
      'application/yaml': ['application/yaml', 'text/plain'],
      'image/png': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
      'image/jpeg': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
      'image/webp': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
      'image/avif': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
      'image/gif': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
    };
    return validConversions[this.mimeType] || false;
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    logger.debug(`isSupportedType with value: ${value}`);
    let arr = value.split(';');
    return validTypes.includes(arr[0].trim());
  }

  async getConvertedInto(type) {
    const fragmentData = await this.getData();
    const fragmentType = this.type;

    const conversions = {
      'text/plain': {
        '.txt': () => fragmentData,
      },
      'text/markdown': {
        '.md': () => fragmentData,
        '.html': () => md.render(fragmentData.toString('utf8')),
        '.txt': () => fragmentData.toString('utf8'),
      },
      'text/html': {
        '.html': () => fragmentData,
        '.txt': () => fragmentData.toString('utf8'),
      },
      'text/csv': {
        '.csv': () => fragmentData,
        '.txt': () => fragmentData.toString('utf8'),
        '.json': () =>
          csv()
            .fromString(fragmentData.toString('utf8'))
            .then((jsonObj) => {
              return jsonObj;
            }),
      },
      'application/json': {
        '.json': () => fragmentData,
        '.yaml': () => yaml.dump(JSON.parse(fragmentData.toString('utf8'))),
        '.yml': () => yaml.dump(JSON.parse(fragmentData.toString('utf8'))),
        '.txt': () => fragmentData.toString('utf8'),
      },
      'application/yaml': {
        '.yaml': () => fragmentData,
        '.txt': () => fragmentData.toString('utf8'),
      },
      'image/png': {
        '.png': () => fragmentData,
        '.jpg': async () => await sharp(fragmentData).jpeg().toBuffer(),
        '.webp': async () => await sharp(fragmentData).webp().toBuffer(),
        '.gif': async () => await sharp(fragmentData).gif().toBuffer(),
        '.avif': async () => await sharp(fragmentData).avif().toBuffer(),
      },
      'image/jpeg': {
        '.png': async () => await sharp(fragmentData).png().toBuffer(),
        '.jpg': () => fragmentData,
        '.webp': async () => await sharp(fragmentData).webp().toBuffer(),
        '.gif': async () => await sharp(fragmentData).gif().toBuffer(),
        '.avif': async () => await sharp(fragmentData).avif().toBuffer(),
      },
      'image/webp': {
        '.webp': () => fragmentData,
        '.png': async () => await sharp(fragmentData).png().toBuffer(),
        '.jpg': async () => await sharp(fragmentData).jpeg().toBuffer(),
        '.gif': async () => await sharp(fragmentData).gif().toBuffer(),
        '.avif': async () => await sharp(fragmentData).avif().toBuffer(),
      },
      'image/avif': {
        '.avif': () => fragmentData,
        '.png': async () => await sharp(fragmentData).png().toBuffer(),
        '.jpg': async () => await sharp(fragmentData).jpeg().toBuffer(),
        '.webp': async () => await sharp(fragmentData).webp().toBuffer(),
        '.gif': async () => await sharp(fragmentData).gif().toBuffer(),
      },
      'image/gif': {
        '.gif': () => fragmentData,
        '.png': async () => await sharp(fragmentData).png().toBuffer(),
        '.jpg': async () => await sharp(fragmentData).jpeg().toBuffer(),
        '.webp': async () => await sharp(fragmentData).webp().toBuffer(),
        '.avif': async () => await sharp(fragmentData).avif().toBuffer(),
      },
    };

    if (conversions[fragmentType] && conversions[fragmentType][type]) {
      return await conversions[fragmentType][type]();
      // return await sharp(fragmentData).jpeg().toBuffer();
    }

    throw new Error(`Unsupported conversion from ${fragmentType} to ${type}`);
  }
  // Convert fragment data into the received type.
}

module.exports.Fragment = Fragment;
