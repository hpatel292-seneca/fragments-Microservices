// src/routes/api/index.js
/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');
const { getFragments, getFragmentByID, getFragmentInfo } = require('./get');
const { updateFragment } = require('./put');
const { deleteFragmentById } = require('./delete');

const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      // See if we can parse this content type. If we can, `req.body` will be
      // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
      // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
      const { type } = contentType.parse(req);
      return Fragment.isSupportedType(type);
    },
  });

// Create a router on which to mount our API endpoints
const router = express.Router();

// Define our first route, which will be: GET /v1/fragments
router.get('/fragments', getFragments);
// Get /v1/fragments/:id
router.get('/fragments/:id', getFragmentByID);
// Put /v1/fragments/:id
router.put('/fragments/:id', rawBody(), updateFragment);
// Post /v1/fragment
router.post('/fragments', rawBody(), require('./post'));
// get /v1/fragments/:id/info
//router.get('/fragments/:id/info', getFragmentInfo);
// Delete /v1/fragments/:id
router.delete('/fragments/:id', deleteFragmentById);

module.exports = router;
