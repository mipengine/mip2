/**
 * @file utils.spec.js
 * @author clark-t (clarktanglei@163.com)
 */
/* globals describe, it */

var chai = require('chai')
var expect = chai.expect

var is = require('../../lib/utils/is')
var keys = require('../../lib/utils/keys')

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

describe('utils/keys', function () {
  it('should be equal', function () {
    var list = [
      'a',
      'b',
      'c',
      {name: 'd'}
    ]
    expect(keys(list)).to.be.deep.equal(['a', 'b', 'c', 'd'])
  })
})
