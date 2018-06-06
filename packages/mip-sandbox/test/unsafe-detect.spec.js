/**
 * @file unsafe-detect.spec.js
 * @author clark-t (clarktanglei@163.com)
 */

var chai = require('chai')
var detect = require('../lib/unsafe-detect')
var expect = chai.expect

function printNames(nodes) {
  return nodes.map(function (node) {
    return node.name
  })
  .join('-')
}

describe('unsafe-detect', function () {
  it('#import', function () {
    var code = `
      import a from 'path/to/a'
      import {b as bb, b2} from 'path/to/b'
      import * as c from 'path/to/c'

      console.log(a)
      console.log(b)
      console.log(bb)
      console.log(b2)
      console.log(c)
    `

    var list = detect(code)
    expect(list.map(item => item.name).join('-')).to.be.equal('b')
  })

  it('#commonjs', function () {
    var code = `
      const a = require('path/to/a')
      module.exports = a
    `

    var list = detect(code)
    expect(list).to.be.undefined
  })

  it('#amd', function () {
    var code = `
      define(function (require) {
        var b = require('path/to/b')
      })
    `

    var list = detect(code)
    expect(list).to.be.undefined
  })

  describe('#scope', function () {
    it('block statement', function () {
      var code = `
        ;(function () {
          console.log(a)
          console.log(b)
          console.log(c)
          console.log(d)
          console.log(e)
          console.log(f)

          if (true) {
            var d = 2
            let e = 3
            function f() {}
          }
        })()

        var a = 1
        function b() {}
        let c = 2
      `

      var list = detect(code)
      expect(printNames(list)).to.be.equal('e')
    })

    it('for statement', function () {
      var code = `
        for (var a = 0; a < 5; a++) {
          var b = 1
        }

        for (let c = 0; c < 5; c++) {
          let d = 2
          const e = 1
          function f() {}
        }

        console.log(a)
        console.log(b)
        console.log(c)
        console.log(d)
        console.log(e)
        console.log(f)
      `

      var list = detect(code)
      expect(printNames(list)).to.be.equal('c-d-e')
    })

    it('pattern', function () {
      var code = `
        for (var {a: {b: c}} = {a: {b: {c: 0}}}; c < 5; c++) {
          let {d: {e: [f, g = 1, ...h]}} = {}
          console.log(a)
          console.log(b)
          console.log(c)
          console.log(d)
          console.log(e)
          console.log(f)
          console.log(g)
          console.log(h)
        }

        for (let {i} = {i: 0}; i < 5; i++) {

        }

        console.log(a)
        console.log(b)
        console.log(c)
        console.log(d)
        console.log(e)
        console.log(f)
        console.log(g)
        console.log(h)
        console.log(i)
      `

      var list = detect(code)
      expect(printNames(list)).to.be.equal('a-b-d-e-a-b-d-e-f-g-h-i')
    })

    it('function', function () {
      var code = `
        function a(b) {

        }
      `
    })
  })
})
