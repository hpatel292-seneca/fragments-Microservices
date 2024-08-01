// tests/unit/get.test.js

const request = require('supertest');
const hash = require('../../src/hash');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');
const markdownit = require('markdown-it');
const fs = require('fs');
const path = require('path');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  // fetching correct fragments
  test('fetching correct fragments', async () => {
    const ownerId = hash('user1@email.com');
    const id = 'rdmId';
    const fragMetadata1 = new Fragment({ id: id, ownerId: ownerId, type: 'text/plain' });
    const body = 'This is a fragment';
    fragMetadata1.setData(body);
    fragMetadata1.save();

    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.body.fragments[0]).toBe(id);
  });
});

describe('/v1/fragments?expand=1', () => {
  // fetching correct fragments with passed expand=1 as query parameter
  test('fetching correct fragments when passed expand=1', async () => {
    const ownerId = hash('user1@email.com');
    const id = 'rdmId';
    const type = 'text/plain';
    const fragMetadata1 = new Fragment({ id: id, ownerId: ownerId, type: type });
    const body = 'This is a fragment';
    fragMetadata1.setData(body);
    fragMetadata1.save();

    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1');
    expect(res.body.fragments[0].id).toBe(id);
    expect(res.body.fragments[0].ownerId).toBe(hash('user1@email.com'));
    expect(res.body.fragments[0].type).toBe(type);
  });
});

describe('GET /v1/fragments/:id/info', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/123/info').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/123/info')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  // Using a valid username/password pair should return fragment info
  test('authenticated users get fragment info', async () => {
    // First create a fragment to have an ID to query
    const ownerId = hash('user1@email.com');
    const body = 'This is a fragment';
    const contentType = 'text/plain';
    const id = 'rmdID';
    const fragMetadata = new Fragment({ id: id, ownerId: ownerId, type: contentType });
    fragMetadata.setData(body);
    fragMetadata.save();

    // Then query the fragment info
    const res = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toBeDefined();
    expect(res.body.fragment.id).toBe(id);
    expect(res.body.fragment.ownerId).toBe(ownerId);
    expect(res.body.fragment.type).toBe(contentType);
  });

  // Requesting info for a non-existent fragment should return 404
  test('requesting info for non-existent fragment returns 404', async () => {
    const res = await request(app)
      .get('/v1/fragments/nonexistent-id/info')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('No fragment with ID nonexistent-id found');
  });

  // Simulate an internal server error to return 500
  test('server error returns 500', async () => {
    // Temporarily mock the Fragment.byId method to throw an error
    const id = '123';
    const originalById = require('../../src/model/fragment').Fragment.byId;
    require('../../src/model/fragment').Fragment.byId = jest
      .fn()
      .mockRejectedValue(new Error('Internal Server Error'));

    const res = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe(`No fragment with ID ${id} found`);

    // Restore the original method
    require('../../src/model/fragment').Fragment.byId = originalById;
  });
});

// Get specific fragments
describe('GET /v1/fragments/:id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/ecdca9b2-b841-47e5-be4d-7f880d3c8c59').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/ecdca9b2-b841-47e5-be4d-7f880d3c8c59')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  // throw when no fragment for given ID
  test('should return 404 If fragment not found', async () => {
    const res = await request(app).get('/v1/fragments/1234').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });

  // return specific fragment data without post request.
  test('return specific fragment data without post request', async () => {
    const ownerId = hash('user1@email.com');
    const id = 'rdmId';
    const fragMetadata1 = new Fragment({ id: id, ownerId: ownerId, type: 'text/plain' });
    const body = 'This is a fragment';
    fragMetadata1.setData(body);
    fragMetadata1.save();

    const res = await request(app).get(`/v1/fragments/${id}`).auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe(body);
  });

  // return specific fragment data
  test('return specific fragment data', async () => {
    const ownerId = hash('user1@email.com');
    const id = 'rdmId';
    const fragMetadata1 = new Fragment({ id: id, ownerId: ownerId, type: 'text/plain' });
    const body = 'This is a fragment';
    fragMetadata1.setData(body);
    fragMetadata1.save();

    const res = await request(app).get(`/v1/fragments/${id}`).auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe(body);
  });
});

describe('GET /v1/fragments/:id.ext', () => {
  // should return fragment data successfully with extension
  test('should return fragment data with extension', async () => {
    // post a fragment
    const ownerId = hash('user1@email.com');
    const id = 'rdmId';
    const fragMetadata1 = new Fragment({ id: id, ownerId: ownerId, type: 'text/plain' });
    const body = 'This is a fragment';
    fragMetadata1.setData(body);
    fragMetadata1.save();

    const res = await request(app)
      .get(`/v1/fragments/${id}.txt`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe(body);
  });

  // should return markdown fragments to html.
  test('should return markdown fragments to html', async () => {
    const body = '# Heading level 1';
    const ownerId = hash('user1@email.com');
    const id = 'rdmId';
    const type = 'text/markdown';
    const fragMetadata1 = new Fragment({ id: id, ownerId: ownerId, type: type });
    fragMetadata1.setData(body);
    fragMetadata1.save();
    const md = markdownit();
    const result = md.render(body);

    const res = await request(app)
      .get(`/v1/fragments/${id}.html`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe(result);
  });
  // should return 415 if unsupported extension is requested
  test('should return 415 if unsupported extension is requested', async () => {
    // post a fragment
    const ownerId = hash('user1@email.com');
    const id = 'rdmId';
    const fragMetadata1 = new Fragment({ id: id, ownerId: ownerId, type: 'text/plain' });
    const body = 'This is a fragment';
    fragMetadata1.setData(body);
    fragMetadata1.save();

    const res = await request(app)
      .get(`/v1/fragments/${id}.png`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(415);
    expect(res.body).toEqual({
      status: 'error',
      error: {
        code: 415,
        message: 'The fragment cannot be converted into the extension specified!',
      },
    });
  });

  describe('Original Fragments should be fetched successfully', () => {
    test('Text fragments data is returned in if text fragment ID is passed', async () => {
      // post a fragment
      const filePath = path.join(__dirname, '..', 'files', 'file.txt');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const ownerId = hash('user1@email.com');
      const id = 'rdmId10';
      const fragMetadata1 = new Fragment({ id: id, ownerId: ownerId, type: 'text/plain' });
      fragMetadata1.setData(fileContent);
      fragMetadata1.save();

      const res = await request(app)
        .get(`/v1/fragments/${id}`)
        .auth('user1@email.com', 'password1');
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe(fileContent);
    });

    test('Text fragments data is returned in if fragment ID.txt is passed', async () => {
      // post a fragment
      const filePath = path.join(__dirname, '..', 'files', 'file.txt');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const ownerId = hash('user1@email.com');
      const id = 'rdmId10';
      const fragMetadata1 = new Fragment({ id: id, ownerId: ownerId, type: 'text/plain' });
      fragMetadata1.setData(fileContent);
      fragMetadata1.save();

      const res = await request(app)
        .get(`/v1/fragments/${id}.txt`)
        .auth('user1@email.com', 'password1');
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe(fileContent);
    });
  });
});
