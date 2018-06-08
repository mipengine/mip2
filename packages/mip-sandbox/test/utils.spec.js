/**
 * @file utils.spec.js
 * @author clark-t (clarktanglei@163.com)
 */
/* globals describe, it */

var chai = require('chai')
var expect = chai.expect

var defUtils = require('../lib/utils/def')
var is = require('../lib/utils/is')

describe('utils/def', function () {
  describe('#defs', function () {
    var defs = defUtils.defs

    it('define class', function () {
      var obj = {}
      // mocha 环境没有 window 需要传入 global
      defs(obj, ['Date', 'Promise', 'NaN', 'Infinity'], {host: global})

      expect(obj.Date).to.be.equal(Date)
      expect(obj.Promise).to.be.equal(Promise)
      expect(obj.NaN).to.not.be.equal(NaN)
      expect(obj.Infinity).to.be.equal(1 / 0)
    })

    it('define function', function () {
      var obj = {}
      defs(obj, ['setTimeout', 'isNaN'], {host: global})

      expect(obj.setTimeout).to.not.be.equal(setTimeout)
      expect(obj.isNaN(NaN)).to.be.equal(true)
    })

    it('define property', function () {
      var obj = {}
      // 别个 什么 location 在 当前测试环境下都没有诶
      defs(obj, ['undefined'], {host: global})
      expect(obj.undefined).to.be.equal(undefined)
      // writable = false
      obj.undefined = 1
      expect(obj.undefined).to.be.equal(undefined)
    })
  })

  describe('#def', function () {
    it('object', function () {
      var def = defUtils.def
      var obj = {}
      var sandbox = {}
      def(obj, 'sandbox', sandbox)
      expect(obj.sandbox).to.be.equal(sandbox)
    })
  })
})

describe('utils/is', function () {
  it('#string type', function () {
    expect(is({type: 'Identifier'}, 'Identifier')).to.be.equal(true)
  })

  it('#regexp type', function () {
    expect(is({type: 'ArrowFunctionExpression'}, /Function/)).to.be.equal(true)
    expect(is({type: 'FunctionExpression'}, /Function/)).to.be.equal(true)
    expect(is({type: 'FunctionDeclaration'}, /Function/)).to.be.equal(true)
  })

  it('#params', function () {
    expect(is({type: 'Identifier'}, 'Identifier', {name: 'a'})).to.be.equal(false)
    expect(is({type: 'Identifier', name: 'a'}, 'Identifier', {name: 'a'})).to.be.equal(true)
  })

  it('#array params', function () {
    var prop1 = {
      type: 'Property'
    }
    var prop2 = {
      type: 'Property'
    }

    expect(
      is(
        {
          type: 'ObjectExpression',
          properties: [prop1, prop2]
        },
        'ObjectExpression',
        {properties: [prop1, prop2]}
      )
    ).to.be.equal(true)

    expect(
      is(
        {
          type: 'ObjectExpression',
          properties: [prop1, prop2]
        },
        'ObjectExpression',
        {properties: [prop2]}
      )
    ).to.be.equal(true)

    expect(
      is(
        {
          type: 'ObjectExpression',
          properties: [prop1, prop2]
        },
        'ObjectExpression',
        {properties: []}
      )
    ).to.be.equal(true)

    expect(
      is(
        {
          type: 'ObjectExpression',
          properties: [prop1]
        },
        'ObjectExpression',
        {properties: [prop1, prop2]}
      )
    ).to.be.equal(false)

    expect(
      is(
        {
          type: 'ObjectExpression',
          properties: [prop1]
        },
        'Identifier',
        {properties: [prop2]}
      )
    ).to.be.equal(false)
  })
})
