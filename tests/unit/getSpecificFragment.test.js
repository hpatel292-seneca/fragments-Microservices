const request = require('supertest');
const app = require('../../src/app');

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

  // return specific fragment data
  test('return specific fragment data', async () => {
    const body = 'This is a fragment';
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(body);
    const id = res.body.fragment.id;

    const res_2 = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');
    expect(res_2.statusCode).toBe(200);
    expect(res_2.text).toBe(body);
  });
});

// throw when no fragment for given ID
test('should return 404 If fragment not found', async () => {
  const res = await request(app).get('/v1/fragments/1234').auth('user1@email.com', 'password1');
  expect(res.statusCode).toBe(404);
});

// should return fragment data successfully with extension
test('should return fragment data with extension', async () => {
  // post a fragment
  const body = 'This is a fragment';
  const res = await request(app)
    .post('/v1/fragments')
    .auth('user1@email.com', 'password1')
    .set('Content-Type', 'text/plain')
    .send(body);
  const id = res.body.fragment.id;

  const res_2 = await request(app)
    .get(`/v1/fragments/${id}.txt`)
    .auth('user1@email.com', 'password1');
  expect(res_2.statusCode).toBe(200);
  expect(res_2.text).toBe(body);
});

// should return 415 if unsupported extension is requested
test('should return 415 if unsupported extension is requested', async () => {
  // post a fragment
  const body = 'This is a fragment';
  const res = await request(app)
    .post('/v1/fragments')
    .auth('user1@email.com', 'password1')
    .set('Content-Type', 'text/plain')
    .send(body);
  const id = res.body.fragment.id;

  const res_2 = await request(app)
    .get(`/v1/fragments/${id}.png`)
    .auth('user1@email.com', 'password1');
  expect(res_2.statusCode).toBe(415);
  expect(res_2.body).toEqual({
    status: 'error',
    error: {
      code: 415,
      message: 'The fragment cannot be converted into the extension specified!',
    },
  });
});