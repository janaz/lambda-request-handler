import fixResponseHeaders from "../src/fixResponseHeaders"

describe("fixResponseHeaders - multi", () => {
  describe("transfer-encoding header", () => {
    it('is removed when the value is "chunked"', () => {
      const fixed = fixResponseHeaders(
        {
          "transfer-encoding": "chunked",
        },
        true,
        false
      )
      expect(fixed.multiValueHeaders!["transfer-encoding"]).toBeUndefined()
    })
    it('is not removed when the value is not "chunked"', () => {
      const fixed = fixResponseHeaders(
        {
          "transfer-encoding": ["not-chunked", "chunked"],
        },
        true,
        false
      )
      expect(fixed.multiValueHeaders!["transfer-encoding"]).toEqual([
        "not-chunked",
      ])
    })
  })

  describe("array header values", () => {
    it("returns multiple headers with different case", () => {
      const fixed = fixResponseHeaders(
        {
          "set-cookie": ["a", "b", "c"],
        },
        true,
        false
      )
      expect(fixed.multiValueHeaders!).toEqual({
        "set-cookie": ["a", "b", "c"],
      })
    })
  })

  it("by default it copies the value", () => {
    const fixed = fixResponseHeaders(
      {
        "content-length": "100",
      },
      true,
      false
    )
    expect(fixed.multiValueHeaders!["content-length"]).toEqual(["100"])
  })
})

describe("fixResponseHeaders - single", () => {
  describe("transfer-encoding header", () => {
    it('is removed when the value is "chunked"', () => {
      const fixed = fixResponseHeaders(
        {
          "transfer-encoding": "chunked",
        },
        false,
        false
      )
      expect(fixed.headers!["transfer-encoding"]).toBeUndefined()
    })
    it('is not removed when the value is not "chunked"', () => {
      const fixed = fixResponseHeaders(
        {
          "transfer-encoding": "not-chunked",
        },
        false,
        false
      )
      expect(fixed.headers!["transfer-encoding"]).toEqual("not-chunked")
    })
  })

  describe("array header values", () => {
    it("sets set-cookie header using different character case", () => {
      const fixed = fixResponseHeaders(
        {
          "set-cookie": ["a", "b", "c"],
        },
        false,
        false
      )
      expect(fixed.headers).toEqual({
        "set-cookie": "a",
        "Set-cookie": "b",
        "sEt-cookie": "c",
      })
    })

    it("joins the values with commas for not set-cookie headers", () => {
      const fixed = fixResponseHeaders(
        {
          "x-header": ["a", "b", "c"],
        },
        false,
        false
      )
      expect(fixed.headers).toEqual({
        "x-header": "a,b,c",
      })
    })
  })

  it("by default it copies the value", () => {
    const fixed = fixResponseHeaders(
      {
        "content-length": "100",
      },
      false,
      false
    )
    expect(fixed.headers!["content-length"]).toEqual("100")
  })
})
