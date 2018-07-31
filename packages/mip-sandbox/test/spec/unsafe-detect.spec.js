/**
 * @file unsafe-detect.spec.js
 * @author clark-t (clarktanglei@163.com)
 */

/* globals describe, it */
// var chai = require('chai')
var detect = require('../../lib/unsafe-detect')
var keywords = require('../../lib/keywords')
// var expect = chai.expect

function printNames (nodes) {
  return nodes.map(function (node) {
    return node.name
  }).join('-')
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

    var list = detect(code, keywords.WHITELIST)
    expect(list.map(item => item.name).join('-')).to.be.equal('b')
  })

  it('#commonjs', function () {
    var code = `
      const a = require('path/to/a')
      module.exports = a
    `

    var list = detect(code, keywords.WHITELIST)
    expect(list).to.be.an('array').that.is.empty
  })

  it('#amd', function () {
    var code = `
      define(function (require) {
        var b = require('path/to/b')
      })
    `

    var list = detect(code, keywords.WHITELIST)
    expect(list).to.be.an('array').that.is.empty
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
          console.log(g)
          console.log(h)
          console.log(i)
          console.log(j)
          console.log(k)
          console.log(l)
          console.log(m)
          console.log(n)


          if (true) {
            var a = 1
            let b = 1
            function c(d) {
              e = 1
              var f = 1

              console.log(a)
              console.log(b)
              console.log(c)
              console.log(d)
              console.log(e)
              console.log(f)
              console.log(g)
              console.log(h)
              console.log(i)
              console.log(j)
              console.log(k)
              console.log(l)
              console.log(m)
              console.log(n)
            }
          }
        })()

        var g = 1
        function h() {}
        let i = 1
        class j extends k.l.m {

        }

        n = 1

        console.log(a)
        console.log(b)
        console.log(c)
        console.log(d)
        console.log(e)
        console.log(f)
        console.log(g)
        console.log(h)
        console.log(i)
        console.log(j)
        console.log(k)
        console.log(l)
        console.log(m)
        console.log(n)
      `

      var list = detect(code, keywords.WHITELIST)
      expect(printNames(list)).to.be.equal('b-d-e-f-k-l-m-n-e-e-k-l-m-n-k-n-a-b-c-d-e-f-k-l-m-n')
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

      var list = detect(code, keywords.WHITELIST)
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

      var list = detect(code, keywords.WHITELIST)
      expect(printNames(list)).to.be.equal('a-b-d-e-a-b-d-e-f-g-h-i')
    })

    it('function', function () {
      var code = `
        function a(b, {c: d}, ...e) {
          console.log(a)
          console.log(b)
          console.log(c)
          console.log(d)
          console.log(e)
          console.log(f)
          console.log(g)
          console.log(n)
          console.log(o)

          function f(g) {}
        }

        const h = i => i.j()
        var k = {
          l(m) {
            console.log(a)
            console.log(b)
            console.log(c)
            console.log(d)
            console.log(e)
            console.log(f)
            console.log(g)
            console.log(h)
            console.log(i)
            console.log(j)
            console.log(k)
            console.log(l)
            console.log(m)
            console.log(n)
            console.log(o)
          }
        }

        var n = function o() {}

        console.log(n)
        console.log(o)
      `

      var list = detect(code, keywords.WHITELIST)
      expect(printNames(list)).to.be.equal('c-g-o-b-c-d-e-f-g-i-j-l-o-o')
    })

    it('class', function () {
      var code = `
        class a extends b {
          c({d}, [e, f, ...g], ...h) {
            console.log(a)
            console.log(b)
            console.log(c)
            console.log(d)
            console.log(e)
            console.log(f)
            console.log(g)
            console.log(h)
            console.log(i)
            console.log(j)
            console.log(k)
            console.log(l)
          }

          i({j = 1, k: {l = 1}}) {
            console.log(a)
            console.log(b)
            console.log(c)
            console.log(d)
            console.log(e)
            console.log(f)
            console.log(g)
            console.log(h)
            console.log(i)
            console.log(j)
            console.log(k)
            console.log(l)
          }
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
        console.log(j)
        console.log(k)
        console.log(l)
      `

      var list = detect(code, keywords.WHITELIST)
      expect(printNames(list)).to.be.equal('b-b-c-i-j-k-l-b-c-d-e-f-g-h-i-k-b-c-d-e-f-g-h-i-j-k-l')
    })
  })

  it('#computed', function () {
    var code = `
      var a = b[c][d.e[f]].g[h()]
      var i = {
        [j[k].l()]: function j() {}
      }
    `
    var list = detect(code, keywords.WHITELIST)
    expect(printNames(list)).to.be.equal('b-c-d-f-h-j-k')
  })

  it('#template string', function () {
    /* eslint-disable */
    var code = 'var a = `bcdef${g}hijk${l.m[n.o][p].q["r"]}`'
    /* eslint-enable */
    var list = detect(code, keywords.WHITELIST)
    expect(printNames(list)).to.be.equal('g-l-n-p')
  })

  it('#object', function () {
    var code = `
      var a = {b}
      var c = {c}
    `
    var list = detect(code, keywords.WHITELIST)
    expect(printNames(list)).to.be.equal('b')
  })
})
