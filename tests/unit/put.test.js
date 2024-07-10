const request = require('supertest');
const app = require('../../src/app');
const hash = require('../../src/hash');
const { Fragment } = require('../../src/model/fragment');

describe('PUT /v1/fragments/:id', () => {
  // Should update specified fragment for given id with given new fragment
  test('Should update specified fragment for given id with given new fragment', async () => {
    const ownerId = hash('user1@email.com');
    const id = 'rdmId';
    const fragMetadata = new Fragment({ id: id, ownerId: ownerId, type: 'text/plain' });
    const body = 'This is a fragment';
    const updated_body = 'This is updated fragment';
    fragMetadata.setData(body);
    fragMetadata.save();

    const res = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(updated_body);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.id).toBe(id);

    // fetch updated body.
    const newData = await fragMetadata.getData();
    expect(newData.toString('utf-8')).toBe(updated_body);
  });

  // Should throw if fragment didn't exist
  test("Should throw if fragment didn't exist", async () => {
    const ownerId = hash('user1@email.com');
    const id = 'rdmId';
    const fragMetadata = new Fragment({ id: id, ownerId: ownerId, type: 'text/plain' });
    const body = 'This is a fragment';
    fragMetadata.setData(body);
    fragMetadata.save();

    const res = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/abc')
      .send(body);
    expect(res.statusCode).toBe(415);
    expect(res.body.error.message).toBe('Unsupported fragment type requested by the client!');
  });
});
