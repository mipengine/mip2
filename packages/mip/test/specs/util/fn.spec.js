/**
 * @file util fn spec file
 * @author sekiyika(pengxing@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* global describe, it, expect */

import util from 'src/util'

const fn = util.fn

describe('fn', function () {
  it('extend', function () {
    let target = {
      test: 1
    }
    fn.extend(target, {
      test: 2
    })

    let source = {
      testProperty: {
        value: 'source'
      },
      arr: [1, 2]
    }

    fn.extend(true, target, source)
    target.testProperty.value = 'target'
    target.arr.push(3)

    expect(target.test).to.equal(2)
    expect(source.testProperty.value).to.equal('source')
    expect(source.arr).to.eql([1, 2])
  })

  it('values', function () {
    expect(fn.values({a: 1, b: 2})).to.eql([1, 2])
  })

  it('throttle', function (done) {
    let count = 0
    let exec = function () {
      count++
    }
    let throttledExec = fn.throttle(exec, 20)
    let interval = setInterval(throttledExec, 1)
    setTimeout(function () {
      clearInterval(interval)
      done(count > 5 ? 'throttle error' : null)
    }, 100)
  })

  it('isPlainObject', function () {
    expect(fn.isPlainObject({})).to.be.true
    expect(fn.isPlainObject({a: 1})).to.be.true
    expect(fn.isPlainObject(Object.create({}))).to.be.false
    expect(fn.isPlainObject(1)).to.be.false
    expect(fn.isPlainObject(0)).to.be.false
    expect(fn.isPlainObject('')).to.be.false
    expect(fn.isPlainObject('Hello world')).to.be.false
    expect(fn.isPlainObject(false)).to.be.false
    expect(fn.isPlainObject(true)).to.be.false
    expect(fn.isPlainObject(null)).to.be.false
    expect(fn.isPlainObject(undefined)).to.be.false
    expect(fn.isPlainObject(NaN)).to.be.false
    expect(fn.isPlainObject(Infinity)).to.be.false
  })

  it('pick', function () {
    let obj = {
      a: '1',
      b: '2',
      c: '3',
      d: '4'
    }

    expect(fn.pick(obj, ['a', 'c'])).to.eql({
      a: '1',
      c: '3'
    })
    expect(fn.pick(obj, 'b', 'd')).to.eql({
      b: '2',
      d: '4'
    })
  })

  it('isString', function () {
    expect(fn.isString()).to.be.false
    expect(fn.isString('test')).to.be.true
  })

  it('del', function () {
    expect(fn.del(null, 'key')).to.be.equal(undefined)
    let obj = {
      a: 1,
      b: 2
    }
    fn.del(obj, 'a')
    expect(obj.a).to.be.equal(undefined)
    try {
      fn.del(Object, 'prototype')
    } catch (e) {}
  })

  describe('.getRootName', function () {
    it('.getRootName in root page', function () {
      expect(fn.getRootName('iframe-shell-vhn7s9y6hu9')).to.be.equal('iframe-shell-vhn7s9y6hu9')
    })

    it('.getRootName in sub page', function () {
      expect(fn.getRootName('{"standalone":false,"isRootPage":false,"isCrossOrigin":false, "rootName":"iframe-shell-vhn7s9y6hu9"}'))
        .to.be.equal('iframe-shell-vhn7s9y6hu9')
    })

    it('.getRootName with undefined params', function () {
      expect(fn.getRootName()).to.be.equal('')
    })

    it('.getRootName in other cases', function () {
      expect(fn.getRootName('some other name'))
        .to.be.equal('some other name')
    })
  })
})
/* eslint-enable no-unused-expressions */
