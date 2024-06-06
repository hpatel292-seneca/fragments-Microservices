// get memory
const Memory = require('../../src/model/data/memory/index');

describe('Memory', () => {
  const fragment = {
    id: '30a84843-0cd4-4975-95ba-b96112aea189',
    ownerId: '11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    type: 'text/plain',
    size: 256,
  };

  test('readFragment return nothing when DB has no Metadata', async () => {
    const result = await Memory.readFragment('a', 'b');
    expect(result).toBe(undefined);
  });

  test('readFragment throw error when ID or OwnerID is not string', async () => {
    // expect(() => Memory.readFragment(1, 'b')).toThrow();
    expect(async () => await Memory.readFragment()).rejects.toThrow();
    expect(async () => await Memory.readFragment(1)).rejects.toThrow();
    expect(async () => await Memory.readFragment(1, 1)).rejects.toThrow();
  });

  test('WriteFragment throw error when ID or OwnerID in fragment object is not string', async () => {
    // expect(() => Memory.readFragment(1, 'b')).toThrow();
    expect(async () => await Memory.writeFragment({})).rejects.toThrow();
    expect(async () => await Memory.writeFragment({ ownerId: 1 })).rejects.toThrow();
    expect(async () => await Memory.writeFragment({ ownerId: 1, id: 1 })).rejects.toThrow();
  });

  test('readFragment returns what we write to the fragment', async () => {
    await Memory.writeFragment(fragment);
    const result = await Memory.readFragment(fragment.ownerId, fragment.id);
    expect(result).toEqual(fragment);
  });

  test('readFragment with incorrect ID returns nothing', async () => {
    await Memory.writeFragment(fragment);
    let fragment_copy = Object.assign({}, fragment);
    fragment_copy.id = 'abcd';
    const result = await Memory.readFragment(fragment_copy.ownerId, fragment_copy.id);
    expect(result).toEqual(undefined);
  });

  test('readFragmentData return nothing when DB has no data', async () => {
    const result = await Memory.readFragmentData('a', 'b');
    expect(result).toBe(undefined);
  });

  test('readFragmentData throw error when Id or OwnerID is not string', async () => {
    // expect(() => Memory.readFragment(1, 'b')).toThrow();
    expect(async () => await Memory.readFragmentData()).rejects.toThrow();
    expect(async () => await Memory.readFragmentData(1)).rejects.toThrow();
    expect(async () => await Memory.readFragmentData(1, 1)).rejects.toThrow();
  });

  test('WriteFragmentData throw error when ID or OwnerID in fragment object is not string', async () => {
    // expect(() => Memory.readFragment(1, 'b')).toThrow();
    expect(async () => await Memory.writeFragmentData()).rejects.toThrow();
    expect(async () => await Memory.writeFragmentData(1)).rejects.toThrow();
    expect(async () => await Memory.writeFragmentData(1, 1)).rejects.toThrow();
  });

  test('readFragmentData returns what we write to the fragment using writeFragmentData', async () => {
    const data = Buffer.from([1, 2, 3]);
    await Memory.writeFragmentData(fragment.ownerId, fragment.id, data);
    const result = await Memory.readFragmentData(fragment.ownerId, fragment.id);
    expect(result).toEqual(data);
  });

  test('readFragmentData with incorrect ID returns nothing', async () => {
    const data = Buffer.from([1, 2, 3]);
    await Memory.writeFragmentData(fragment.ownerId, fragment.id, data);
    const result = await Memory.readFragment(fragment.ownerId, 'abcd');
    expect(result).toEqual(undefined);
  });
});
