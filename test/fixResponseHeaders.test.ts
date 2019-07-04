import fixResponseHeaders from '../src/fixResponseHeaders';

describe('fixResponseHeaders', () => {
  describe('content-encoding header', () => {
    it('is removed when the value is "chunked"', () => {
      const fixed = fixResponseHeaders({
        "transfer-encoding": "chunked",
      })
      expect(fixed.headers['transfer-encoding']).toBeUndefined();
    })
    it('is not removed when the value is not "chunked"', () => {
      const fixed = fixResponseHeaders({
        "transfer-encoding": "not-chunked",
      })
      expect(fixed.headers['transfer-encoding']).toEqual('not-chunked');
    })
  });

  describe('array header values', () => {
    it('returns multiple headers with different case', () => {
      const fixed = fixResponseHeaders({
        "set-cookie": ["a", "b", "c"],
      })
      expect(fixed.multiValueHeaders).toEqual({
        "set-cookie": ["a", "b", "c"],
      });
    })
  });

  it('by default it copies the value', () => {
    const fixed = fixResponseHeaders({
      "content-length": "100",
    })
    expect(fixed.headers['content-length']).toEqual('100');
  })

})
