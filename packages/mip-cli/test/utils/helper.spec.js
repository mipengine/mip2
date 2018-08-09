/**
 * @file helper.spec.js
 * @author clark-t (clarktanglei@163.com)
 */

const path = require('path')
const {expect} = require('chai')
const helper = require('../../lib/utils/helper')

describe('test helper', function () {
  it('objectSubset', function () {
    let origin = {
      a: 1,
      b: 2
    }

    let result = helper.objectSubset(origin, ['a', 'c'])
    expect(result).to.deep.equal({a: 1})
    expect(result).to.not.equal(origin)
  })

  it('pathFormat', function () {
    let pathname = '\\a\\b\\c.js'
    expect(helper.pathFormat(pathname)).to.be.equal('/a/b/c')
    expect(helper.pathFormat(pathname, false)).to.be.equal('/a/b/c.js')
  })

  it('resolveModule', function () {
    let chaiPathname = helper.resolveModule('chai')
    let chaiLib = helper.resolveModule('chai', 'lib/chai.js')
    expect(chaiPathname).to.be.equal(path.resolve(__dirname, '../../node_modules/chai'))
    expect(chaiLib).to.be.equal(path.resolve(__dirname, '../../node_modules/chai/lib/chai.js'))
  })

  it('removeExt', function () {
    expect(helper.removeExt('a/b/c/d.js')).to.be.equal('a/b/c/d')
  })

  it('someAsync', async function () {
    await helper.someAsync([
      Promise.reject(),
      Promise.resolve()
    ])

    expect(true).to.be.ok

    try {
      await helper.someAsync([
        Promise.reject(),
        Promise.reject()
      ])

      expect(true).to.not.be.ok
    } catch (e) {
      expect(false).to.not.be.ok
    }
  })

  it('pify', async function () {
    let result = await helper.pify(function (a, callback) {
      callback(null, a)
    })(1)

    expect(result).to.be.equal(1)
  })
})
