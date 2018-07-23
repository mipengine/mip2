/**
 * @file mip-shell/util spec file
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {convertPatternToRegexp} from 'src/components/mip-shell/util'

/* eslint-disable no-unused-expressions */
/* globals describe, it, expect */

describe('mip-shell.util', function () {
  it('.convertPatternToRegexp', function () {
    let reg = convertPatternToRegexp('*')

    expect(reg instanceof RegExp).to.be.true
    expect(reg.toString()).to.be.equal('/.*/')
    expect(reg.test('/hello/every/one')).to.be.true

    reg = convertPatternToRegexp('chapter-\\d')

    expect(reg instanceof RegExp).to.be.true
    expect(reg.toString()).to.be.equal('/chapter-\\d/')
    expect(reg.test('/chapter-1')).to.be.true
    expect(reg.test('/chapter-2')).to.be.true
    expect(reg.test('/chapter')).to.be.false
    expect(reg.test('/hello/every/one')).to.be.false
  })
})
