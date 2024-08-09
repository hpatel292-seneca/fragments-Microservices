const request = require('supertest');
const app = require('../../src/app');
const hash = require('../../src/hash');
const { Fragment } = require('../../src/model/fragment');

describe('DELETE /v1/fragments/:id', () => {
  // Should delete specified fragment for given id
  test('Should delete specified fragment for given id', async () => {
    const ownerId = hash('user1@email.com');
    const id = 'rdmId';
    const fragMetadata = new Fragment({ id: id, ownerId: ownerId, type: 'text/plain' });
    const body = 'This is a fragment';
    fragMetadata.setData(body);
    fragMetadata.save();

    const res = await request(app)
      .delete(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    // Again try to get same fragment
    const res2 = await request(app).get(`/v1/fragments/${id}`).auth('user1@email.com', 'password1');
    expect(res2.statusCode).toBe(404);
  });

  // Should throw if fragment didn't exist
  test("Should throw if fragment didn't exist", async () => {
    const id = 'rdmId';

    const res = await request(app)
      .delete(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });
});
