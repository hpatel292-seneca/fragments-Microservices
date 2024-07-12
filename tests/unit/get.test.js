// tests/unit/get.test.js

const request = require('supertest');
const hash = require('../../src/hash');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

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
    const type = 'text/plain';
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', type)
      .send('This is a fragment');
    const id = res.body.fragment.id;

    const res_2 = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1');
    // [1] because post request has been made in above test.
    expect(res_2.body.fragments[1].id).toBe(id);
    expect(res_2.body.fragments[1].ownerId).toBe(hash('user1@email.com'));
    expect(res_2.body.fragments[1].type).toBe(type);
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
