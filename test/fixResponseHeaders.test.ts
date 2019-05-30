import fixResponseHeaders from '../src/fixResponseHeaders';

describe('fixResponseHeaders', () => {
  describe('content-encoding header', () => {
    it('is removed when the value is "chunked"', () => {
      const headers = fixResponseHeaders({
        "transfer-encoding": "chunked",
      })
      expect(headers['transfer-encoding']).toBeUndefined();
    })
    it('is not removed when the value is not "chunked"', () => {
      const headers = fixResponseHeaders({
        "transfer-encoding": "not-chunked",
      })
      expect(headers['transfer-encoding']).toEqual('not-chunked');
    })
  });

  describe('array header values', () => {
    describe('set-cookie', () => {
      it('returns multiple headers with different case', () => {
        const headers = fixResponseHeaders({
          "set-cookie": ["a", "b", "c"],
        })
        expect(headers).toEqual({
           "set-cookie": "a",
           "Set-cookie": "b",
           "sEt-cookie": "c",
        });
      })
    });
    it("returns combined value", () => {
      const headers = fixResponseHeaders({
        "x-array-value": ["a", "b", "c"],
      })
      expect(headers['x-array-value']).toEqual('a,b,c');
    })
  });

  it('by default it copies the value', () => {
    const headers = fixResponseHeaders({
      "content-length": "100",
    })
    expect(headers['content-length']).toEqual('100');
  })

})
