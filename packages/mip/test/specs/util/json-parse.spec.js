/**
 * @file util hash spec file
 * @author sekiyika(pengxing@baidu.com)
 */

/* global describe, it, expect */

import jsonParse from 'src/util/json-parse'

describe('jsonParse', function () {
  it('double quotes', function () {
    let obj = jsonParse('{"a": 1}')
    expect(obj).to.be.a('object')
    expect(obj.a).to.equal(1)
  })

  it('single quotes', function () {
    let obj = jsonParse('{\'a\': 1}')
    expect(obj).to.be.a('object')
    expect(obj.a).to.equal(1)
  })

  it('no quotes', function () {
    let obj = jsonParse('{a: 1}')
    expect(obj).to.be.a('object')
    expect(obj.a).to.equal(1)
  })

  // TODO:(by zoumiaojiang) 补充其他 case
})
