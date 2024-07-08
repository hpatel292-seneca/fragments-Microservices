const request = require('supertest');
const hash = require('../../src/hash');
const app = require('../../src/app');

describe('Post /v1/fragments', () => {
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result for post request
  test('authenticated users can create a plain text fragment and location must returned in header', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('This is a fragment');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.headers['location']).toMatch(/\/v1\/fragments\/[a-f0-9-]+$/);
  });

  // Authenticated user can create text/markdown fragments
  test('authenticated user can create text/markdown fragments and location must returned in header', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/html')
      .send('<p>This is a simple line of text in HTML format.</p>');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.headers['location']).toMatch(/\/v1\/fragments\/[a-f0-9-]+$/);
  });

  // // Authenticated user can create text/html fragments
  // test('authenticated user can create text/markdown fragments and location must returned in header', async () => {
  //   const res = await request(app)
  //     .post('/v1/fragments')
  //     .auth('user1@email.com', 'password1')
  //     .set('Content-Type', 'text/plain')
  //     .send('# Heading level 1');
  //   expect(res.statusCode).toBe(201);
  //   expect(res.body.status).toBe('ok');
  //   expect(res.headers['location']).toMatch(/\/v1\/fragments\/[a-f0-9-]+$/);
  // });

  // // Authenticated user can create text/markdown fragments
  // test('authenticated user can create text/markdown fragments and location must returned in header', async () => {
  //   const res = await request(app)
  //     .post('/v1/fragments')
  //     .auth('user1@email.com', 'password1')
  //     .set('Content-Type', 'text/plain')
  //     .send('# Heading level 1');
  //   expect(res.statusCode).toBe(201);
  //   expect(res.body.status).toBe('ok');
  //   expect(res.headers['location']).toMatch(/\/v1\/fragments\/[a-f0-9-]+$/);
  // });

  // // Authenticated user can create text/markdown fragments
  // test('authenticated user can create text/markdown fragments and location must returned in header', async () => {
  //   const res = await request(app)
  //     .post('/v1/fragments')
  //     .auth('user1@email.com', 'password1')
  //     .set('Content-Type', 'text/plain')
  //     .send('# Heading level 1');
  //   expect(res.statusCode).toBe(201);
  //   expect(res.body.status).toBe('ok');
  //   expect(res.headers['location']).toMatch(/\/v1\/fragments\/[a-f0-9-]+$/);
  // });

  // response include all necessary and expected properties
  test('post return fragment with all necessary properties', async () => {
    const data = 'This is a fragment';
    const size = Buffer.byteLength(data);
    const user = 'user1@email.com';
    const hashID = hash(user);
    const type = 'text/plain';
    const res = await request(app)
      .post('/v1/fragments')
      .auth(user, 'password1')
      .set('Content-Type', type)
      .send(data);
    expect(res.statusCode).toBe(201);
    // verify all properties of the fragment object
    const fragment = res.body.fragment;
    expect(fragment).toHaveProperty('id');
    expect(fragment).toHaveProperty('created');
    expect(fragment).toHaveProperty('updated');
    expect(fragment).toHaveProperty('ownerId');
    expect(fragment).toHaveProperty('type');
    expect(fragment).toHaveProperty('size');

    // verify return value with expected properties
    expect(fragment.ownerId).toBe(hashID);
    expect(fragment.type).toBe(type);
    expect(fragment.size).toBe(size);
  });

  // post fragment with unsupported type
  test('post fragment with unsupported', async () => {
    const type = 'image/png'; // not supported type
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', type)
      .send('This is a fragment');

    expect(res.statusCode).toBe(415);
    expect(res.body.error.message).toBe('Unsupported fragment type requested by the client!');
  });
});
