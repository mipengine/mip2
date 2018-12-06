/**
 * @file utils.spec.js
 * @author clark-t (clarktanglei@163.com)
 */
/* globals describe, it */

// var chai = require('chai')
// var expect = chai.expect

var is = require('../../lib/utils/is')
var keys = require('../../lib/utils/keys')
var def = require('../../lib/utils/def')

describe('utils/def', function () {
  describe('#def', function () {
    // var def = defUtils.def

    it('define class', function () {
      var obj = {}

      def(obj, 'Date', 'Date')
      def(obj, 'Promise', 'Promise')
      def(obj, 'NaN', 'NaN')
      def(obj, 'Infinity', 'Infinity')

      expect(obj.Date).to.be.equal(Date)
      expect(obj.Promise).to.be.equal(Promise)
      expect(isNaN(obj.NaN)).to.be.equal(true)
      expect(obj.Infinity).to.be.equal(Infinity)
    })

    it('define function', function (done) {
      var obj = {}
      def(obj, 'setTimeout', 'setTimeout', true)
      def(obj, 'isNaN', 'isNaN', true)

      expect(obj.setTimeout).to.not.be.equal(setTimeout)
      expect(obj.isNaN(NaN)).to.be.equal(true)

      obj.setTimeout(function () {
        done()
      }, 100)
    })

    it('define property', function () {
      var obj = {}

      def(obj, 'undefined', 'undefined', undefined, undefined)
      def(obj, 'innerWidth', 'innerWidth', undefined, undefined)

      expect(obj.undefined).to.be.equal(undefined)
      expect(typeof obj.innerWidth).to.be.equal('number')

      var innerWidth = obj.innerWidth

      obj.undefined = 1
      obj.innerWidth = 100
      expect(obj.undefined).to.be.equal(undefined)
      expect(obj.innerWidth).to.be.equal(innerWidth)
    })

    it('define getter', function () {
      var obj = {}
      var list = ['a', 'b', 'c']
      def(obj, 'list', function () {
        return list
      })
      expect(obj.list).to.be.equal(list)
    })
  })

  describe('#def traverse', function () {
    var node = {}

    window.hehe = {
      a: 1,
      b: 2
    }

    var sandbox = {
      name: 'aroot',
      // type: false,
      // mode: false,
      access: false,
      origin: function () {
        return window
      },
      properties: [
        {
          type: false,
          mode: false,
          access: false,
          props: [
            'Date',
            'NaN',
            {
              name: 'location',
              properties: [
                {
                  type: false,
                  mode: true,
                  access: false,
                  props: [
                    'href',
                    'protocol'
                  ]
                },
                {
                  type: false,
                  mode: true,
                  access: true,
                  props: [
                    'hash'
                  ]
                }
              ]
            },
            {
              name: 'window',
              getter: function () {
                return node.aroot
              }
            }
          ]
        },
        {
          type: true,
          mode: false,
          access: false,
          props: [
            'setTimeout'
          ]
        },
        {
          type: false,
          mode: true,
          access: false,
          props: [
            'innerWidth'
          ]
        },
        {
          type: false,
          mode: false,
          access: true,
          props: [
            {
              name: 'hehe',
              properties: [
                {
                  type: false,
                  mode: true,
                  access: true,
                  props: [
                    'a',
                    'b'
                  ]
                }
              ]
            }
          ]
        }
      ]
    }

    def(node, sandbox.name, sandbox)
    var obj = node.aroot

    it('enumerable', function () {
      expect(Object.keys(obj)).to.be.deep.equal([
        'Date',
        'NaN',
        'location',
        'window',
        'setTimeout',
        'innerWidth',
        'hehe'
      ])
      expect(Object.keys(obj.location)).to.be.deep.equal(['href', 'protocol', 'hash'])
    })

    it('child node', function () {
      expect(obj.location.href).to.have.string(obj.location.protocol)
    })

    it('window', function () {
      expect(obj.window).to.be.equal(obj)
    })

    it('setTimeout', function (done) {
      obj.setTimeout(function () {
        done()
      }, 500)
    })

    it('location', function () {
      obj.location.href = 'https://www.baidu.com'
      expect(obj.location.href).to.not.be.equal('https://www.baidu.com')
      location.hash = 'haha'
      expect(obj.location.hash).to.be.equal('#haha')
      obj.location.hash = 'hehe'
      expect(location.hash).to.be.equal('#hehe')
      expect(obj.location.hash).to.be.equal('#hehe')
    })

    it('innerWidth', function () {
      expect(typeof obj.innerWidth).to.be.equal('number')
    })

    it('readwrite', function () {
      expect(obj.hehe.a).to.be.equal(window.hehe.a)
      obj.hehe.a = 10086
      expect(obj.hehe.a).to.be.equal(window.hehe.a)
      expect(obj.hehe.a).to.be.equal(10086)
      var newObj = {
        c: 1,
        d: 2
      }
      obj.hehe = newObj

      expect(obj.hehe.a).to.be.equal(undefined)
      expect(obj.hehe.c).to.be.equal(undefined)
      expect(window.hehe.c).to.be.equal(1)
      expect(obj.hehe).to.not.be.equal(newObj)
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

describe('utils/keys', function () {
  it('should be equal', function () {
    var list = [
      'a',
      'b',
      'c',
      {name: 'd'}
    ]
    expect(keys(list)).to.be.deep.equal(['a', 'b', 'c', 'd'])
    expect(keys(list, true)).to.be.deep.equal(['a', 'b', 'c'])
  })
})
