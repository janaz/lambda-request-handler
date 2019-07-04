import fixResponseHeaders from '../src/fixResponseHeaders';

describe('fixResponseHeaders', () => {
  describe('transfer-encoding header', () => {
    it('is removed when the value is "chunked"', () => {
      const fixed = fixResponseHeaders({
        "transfer-encoding": "chunked",
      })
      expect(fixed.multiValueHeaders['transfer-encoding']).toBeUndefined();
    })
    it('is not removed when the value is not "chunked"', () => {
      const fixed = fixResponseHeaders({
        "transfer-encoding": ["not-chunked", "chunked"]
      })
      expect(fixed.multiValueHeaders['transfer-encoding']).toEqual(['not-chunked']);
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
    expect(fixed.multiValueHeaders['content-length']).toEqual(['100']);
  })

})
