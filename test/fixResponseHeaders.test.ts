import fixResponseHeaders from '../src/fixResponseHeaders';

describe('fixResponseHeaders - multi', () => {
  describe('transfer-encoding header', () => {
    it('is removed when the value is "chunked"', () => {
      const fixed = fixResponseHeaders({
        "transfer-encoding": "chunked",
      }, true)
      expect(fixed.multiValueHeaders!['transfer-encoding']).toBeUndefined();
    })
    it('is not removed when the value is not "chunked"', () => {
      const fixed = fixResponseHeaders({
        "transfer-encoding": ["not-chunked", "chunked"]
      }, true)
      expect(fixed.multiValueHeaders!['transfer-encoding']).toEqual(['not-chunked']);
    })
  });

  describe('array header values', () => {
    it('returns multiple headers with different case', () => {
      const fixed = fixResponseHeaders({
        "set-cookie": ["a", "b", "c"],
      }, true)
      expect(fixed.multiValueHeaders!).toEqual({
        "set-cookie": ["a", "b", "c"],
      });
    })
  });

  it('by default it copies the value', () => {
    const fixed = fixResponseHeaders({
      "content-length": "100",
    }, true)
    expect(fixed.multiValueHeaders!['content-length']).toEqual(['100']);
  })
})

describe('fixResponseHeaders - single', () => {
  describe('transfer-encoding header', () => {
    it('is removed when the value is "chunked"', () => {
      const fixed = fixResponseHeaders({
        "transfer-encoding": "chunked",
      }, false)
      expect(fixed.headers!['transfer-encoding']).toBeUndefined();
    })
    it('is not removed when the value is not "chunked"', () => {
      const fixed = fixResponseHeaders({
        "transfer-encoding": "not-chunked"
      }, false)
      expect(fixed.headers!['transfer-encoding']).toEqual('not-chunked');
    })
  });

  describe('array header values', () => {
    it('returns single header with the last value', () => {
      const fixed = fixResponseHeaders({
        "set-cookie": ["a", "b", "c"],
      }, false)
      expect(fixed.headers!).toEqual({
        "set-cookie": "c",
      });
    })
  });

  it('by default it copies the value', () => {
    const fixed = fixResponseHeaders({
      "content-length": "100",
    }, false)
    expect(fixed.headers!['content-length']).toEqual('100');
  })

})
