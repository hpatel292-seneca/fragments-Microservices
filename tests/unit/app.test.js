const request = require('supertest');

const app = require('../../src/app');

describe('users trying to access undefined route', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('users trying to access undefined route', () =>
    request(app).get('/unknown_route').expect(404));
});
