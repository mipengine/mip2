/**
 * @file page.util.query spec file
 * @author panyuqi(panyuqi@baidu.com)
 */

import {stringifyQuery, resolveQuery} from 'src/page/util/query'

/* eslint-disable no-unused-expressions */
/* globals describe, it, expect */

describe('query', function () {
  it('.resolveQuery', function () {
    // empty query obj
    expect(resolveQuery()).to.deep.equal({})

    // empty value in query obj
    expect(resolveQuery('?a&b')).to.deep.equal({a: null, b: null})

    // throw an error when decode
    expect(resolveQuery('?a=%E0%A4%A')).to.deep.equal({})

    // normal key value pairs in query obj
    expect(resolveQuery('?a=1&b=2')).to.deep.equal({a: '1', b: '2'})

    // array in query obj
    expect(resolveQuery('?a=1&a=2&a=3')).to.deep.equal({a: ['1', '2', '3']})
  })

  it('.stringifyQuery', function () {
    // ignore empty input & undefined
    expect(stringifyQuery()).to.be.equal('')
    expect(stringifyQuery({a: undefined})).to.be.equal('')

    // keep null value
    expect(stringifyQuery({a: null})).to.be.equal('?a')

    expect(stringifyQuery({a: 1, b: 2})).to.be.equal('?a=1&b=2')

    expect(stringifyQuery({a: [1, 2, 3]})).to.be.equal('?a=1&a=2&a=3')

    expect(stringifyQuery({a: [null, 2, 3]})).to.be.equal('?a&a=2&a=3')

    // ignore undefined value in array
    expect(stringifyQuery({a: [undefined, 2, 3]})).to.be.equal('?a=2&a=3')

    // encode unsafe chars
    expect(stringifyQuery({a: '!!'})).to.be.equal('?a=%21%21')
  })
})
