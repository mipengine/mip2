/**
 * @file util hash spec file
 * @author sekiyika(pengxing@baidu.com)
 */

/* global describe, it, expect */

import {camelize, hyphenate, toArray} from 'src/vue-custom-element/utils/helpers'

describe('vue-cuctom-element helpers', () => {
  it('camelize', () => {
    expect(camelize('a')).to.be.equal('a')
    expect(camelize('a-b')).to.be.equal('aB')
    expect(camelize('-b')).to.be.equal('B')
    expect(camelize('a-b-cd')).to.be.equal('aBCd')
    expect(camelize('a--cd')).to.be.equal('aCd')
  })

  it('hyphenate', () => {
    expect(hyphenate('aBcdEf')).to.be.equal('a-bcd-ef')
    expect(hyphenate('aBEf')).to.be.equal('a-b-ef')
    expect(hyphenate('a')).to.be.equal('a')
    expect(hyphenate('ABC')).to.be.equal('a-b-c')
  })

  it('toArray', () => {
    expect(toArray([1, 2, 3, 4])).to.deep.equal([1, 2, 3, 4])
    expect(toArray([1, 2, 3, 4], 2)).to.deep.equal([3, 4])
    expect(toArray([1, 2, 3, 4], -1)).to.deep.equal([undefined, 1, 2, 3, 4])
  })
})
