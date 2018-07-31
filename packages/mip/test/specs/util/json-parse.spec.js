/**
 * @file util hash spec file
 * @author sekiyika(pengxing@baidu.com)
 */

/* global describe, it, expect */

import jsonParse from 'src/util/json-parse'

describe('jsonParse objects', () => {
  it('parses empty objects', () => {
    expect(jsonParse('{}')).to.deep.equal({})
  })

  it('parses double string property names', () => {
    expect(jsonParse('{"a":1}')).to.deep.equal({a: 1})
  })

  it('parses single string property names', () => {
    expect(jsonParse("{'a':1}")).to.deep.equal({a: 1})
  })

  it('parses unquoted property names', () => {
    expect(jsonParse('{a:1}')).to.deep.equal({a: 1})
  })

  it('parses special character property names', () => {
    expect(jsonParse('{$_:1,_$:2}')).to.deep.equal({$_: 1, _$: 2})
  })

  it('parses unicode property names', () => {
    expect(jsonParse('{你好:9}')).to.deep.equal({'你好': 9})
  })

  it('parses multiple properties', () => {
    expect(jsonParse('{abc:1,def:2}')).to.deep.equal({abc: 1, def: 2})
  })

  it('parses nested objects', () => {
    expect(jsonParse('{a:{b:2}}')).to.deep.equal({a: {b: 2}})
  })
})

describe('jsonParse arrays', () => {
  it('parses empty arrays', () => {
    expect(jsonParse('[]')).to.deep.equal([])
  })

  it('parses array values', () => {
    expect(jsonParse('[1]')).to.deep.equal([1])
  })

  it('parses multiple array values', () => {
    expect(jsonParse('[1,2]')).to.deep.equal([1, 2])
  })

  it('parses nested arrays', () => {
    expect(jsonParse('[1,[2,3]]')).to.deep.equal([1, [2, 3]])
  })
})

describe('jsonParse null & boolean', () => {
  it('parses nulls', () => {
    expect(jsonParse('null')).to.be.equal(null)
  })

  it('parses true', () => {
    expect(jsonParse('true')).to.be.equal(true)
  })

  it('parses false', () => {
    expect(jsonParse('false')).to.be.equal(false)
  })
})

describe('jsonParse numbers', () => {
  it('parses leading zeroes', () => {
    expect(jsonParse('[0,0.,0e0]')).to.deep.equal([0, 0, 0])
  })

  it('parses integers', () => {
    expect(jsonParse('[1,23,456,7890]')).to.deep.equal([1, 23, 456, 7890])
  })

  it('parses signed numbers', () => {
    expect(jsonParse('[-1,+2,-.1,-0]')).to.deep.equal([-1, +2, -0.1, -0])
  })

  it('parses leading decimal points', () => {
    expect(jsonParse('[.1,.23]')).to.deep.equal([0.1, 0.23])
  })

  it('parses fractional numbers', () => {
    expect(jsonParse('[1.0,1.23]')).to.deep.equal([1, 1.23])
  })

  it('parses exponents', () => {
    expect(jsonParse('[1e0,1e1,1e01,1.e0,1.1e0,1e-1,1e+1]')).to.deep.equal([1, 10, 10, 1, 1.1, 0.1, 10])
  })

  it('parses hexadecimal numbers', () => {
    expect(jsonParse('[0x1,0x10,0xff,0xFF]')).to.deep.equal([1, 16, 255, 255])
  })

  it('parses signed and unsiged Infinity', () => {
    expect(jsonParse('[Infinity,-Infinity]')).to.deep.equal([Infinity, -Infinity])
  })
})

describe('jsonParse strings', () => {
  it('parses double quoted strings', () => {
    expect(jsonParse('"abc"')).to.be.equal('abc')
  })

  it('parses single quoted strings', () => {
    expect(jsonParse("'abc'")).to.be.equal('abc')
  })

  it('parses nested quotes strings', () => {
    expect(jsonParse(`['"',"'"]`)).to.deep.equal(['"', "'"])
  })
})

describe('jsonParse comments', () => {
  it('parses single-line comments', () => {
    expect(jsonParse('{//comment\n}')).to.deep.equal({})
    expect(jsonParse('["/*comment*/"]')).to.deep.equal(['/*comment*/'])
  })

  it('parses single-line comments at end of input', () => {
    expect(jsonParse('{}//comment')).to.deep.equal({})
  })

  it('parses multi-line comments', () => {
    expect(jsonParse('{/*comment** */}')).to.deep.equal({})
  })
})

describe('jsonParse error', () => {
  it('throw an error', () => {
    expect(() => jsonParse('{a,b}')).to.throw('Content should be a valid JSON string!')
  })
})
