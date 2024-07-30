const request = require('supertest');
const hash = require('../../src/hash');
const app = require('../../src/app');

describe('Post /v1/fragments', () => {
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result for post request for plain text
  test('authenticated users can create a plain text fragment and location must returned in header', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
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
      .set('Content-Type', 'text/markdown')
      .send('# Heading level 1');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.headers['location']).toMatch(/\/v1\/fragments\/[a-f0-9-]+$/);
  });

  // Authenticated user can create text/html fragments
  test('authenticated user can create text/html fragments and location must returned in header', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/html')
      .send('<p>This is a simple line of text in HTML format.</p>');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.headers['location']).toMatch(/\/v1\/fragments\/[a-f0-9-]+$/);
  });

  // Authenticated user can create text/csv fragments
  test('authenticated user can create text/csv fragments and location must returned in header', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/csv')
      .send('Harshil, Patel');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.headers['location']).toMatch(/\/v1\/fragments\/[a-f0-9-]+$/);
  });

  // Authenticated user can create application/json fragments
  test('authenticated user can create application/json fragments and location must returned in header', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')
      .send({ name: 'Harshil' });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.headers['location']).toMatch(/\/v1\/fragments\/[a-f0-9-]+$/);
  });

  // Authenticated user can create application/yaml fragments
  test('authenticated user can create application/yaml fragments and location must returned in header', async () => {
    const fileContent = 'This is a test file content';
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/yaml')
      .send(Buffer.from(fileContent));
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.headers['location']).toMatch(/\/v1\/fragments\/[a-f0-9-]+$/);
  });

  // Authenticated user can create image/png fragments
  test('authenticated user can create image/png fragments and location must returned in header', async () => {
    const fileContent = 'This is a test file content';
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/png')
      .send(Buffer.from(fileContent));
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.headers['location']).toMatch(/\/v1\/fragments\/[a-f0-9-]+$/);
  });

  // Authenticated user can create image/jpeg fragments
  test('authenticated user can create image/jpeg fragments and location must returned in header', async () => {
    const fileContent = 'This is a test file content';
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/jpeg')
      .send(Buffer.from(fileContent));
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.headers['location']).toMatch(/\/v1\/fragments\/[a-f0-9-]+$/);
  });

  // Authenticated user can create image/webp fragments
  test('authenticated user can create image/webp fragments and location must returned in header', async () => {
    const fileContent = 'This is a test file content';
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/webp')
      .send(Buffer.from(fileContent));
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.headers['location']).toMatch(/\/v1\/fragments\/[a-f0-9-]+$/);
  });

  // Authenticated user can create image/avif fragments
  test('authenticated user can create image/avif fragments and location must returned in header', async () => {
    const fileContent = 'This is a test file content';
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/avif')
      .send(Buffer.from(fileContent));
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.headers['location']).toMatch(/\/v1\/fragments\/[a-f0-9-]+$/);
  });

  // Authenticated user can create image/gif fragments
  test('authenticated user can create image/gif fragments and location must returned in header', async () => {
    const fileContent = 'This is a test file content';
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/gif')
      .send(Buffer.from(fileContent));
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.headers['location']).toMatch(/\/v1\/fragments\/[a-f0-9-]+$/);
  });

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
    const type = 'image/abc'; // not supported type
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', type)
      .send('This is a fragment');

    expect(res.statusCode).toBe(415);
    expect(res.body.error.message).toBe('Unsupported fragment type requested by the client!');
  });
});
