/**
 * @file generate.spec.js
 * @author clark-t (clarktanglei@163.com)
 */

/* globals describe, it */

// var chai = require('chai')
// var expect = chai.expect
var generateFull = require('../../lib/generate')
var generateLite = require('../../lib/generate-lite')
var keywords = require('../../lib/keywords')
// var esprima = require('esprima')
var acorn = require('acorn-dynamic-import').default
var estraverse = require('estraverse')
var escodegen = require('../../deps/escodegen')

function format (a) {
  // return escodegen.generate(esprima.parseModule(a))
  var ast = acorn.parse(a, {
    ecmaVersion: 8,
    sourceType: 'module',
    locations: true,
    plugins: {
      dynamicImport: true
    }
  })

  estraverse.traverse(ast, {
    enter: function (node) {
      if (node.type === 'Import') {
        node.type = 'Identifier'
        node.name = 'import'
        node.isIgnore = true
      }
    }
  })

  return escodegen.generate(ast)
}

var gen = {
  'generate': generateFull,
  'generate-lite': generateLite
}

describe('generate', function () {
  Object.keys(gen).forEach(function (name) {
    var generate = gen[name]

    describe('#' + name, function () {
      it('#this', function () {
        var code = `
          var a = this
          this()
          this.setTimeout()
          // var b = {this}
          var b = {this: this}
          this['setTimeout']()
          var c = {
            [this]: this[this][this.setTimeout()]
          }
        `
        var expected = `
          var a = window.MIP.sandbox.this(this)
          window.MIP.sandbox.this(this)()
          window.MIP.sandbox.this(this).setTimeout()
          var b = {this: window.MIP.sandbox.this(this)}
          window.MIP.sandbox.this(this)['setTimeout']()
          var c = {
            [window.MIP.sandbox.this(this)]: window.MIP.sandbox.this(this)[window.MIP.sandbox.this(this)][window.MIP.sandbox.this(this).setTimeout()]
          }
        `

        expect(generate(code, keywords.WHITELIST_RESERVED)).to.be.equal(format(expected))
      })

      it('#string', function () {
        /* eslint-disable */
        var code = '`abcd${this[this].this}efg${b[c].d}`'
        var expected = '`abcd${window.MIP.sandbox.this(this)[window.MIP.sandbox.this(this)].this}efg${window.MIP.sandbox.b[window.MIP.sandbox.c].d}`'
        /* eslint-enable */
        expect(generate(code, keywords.WHITELIST_RESERVED)).to.be.equal(format(expected))
      })

      it('#object', function () {
        var code = `
          var a = {b}
          var c = {c}
          var d = {setTimeout}
        `

        var expected = `
          var a = {b: window.MIP.sandbox.b}
          var c = {c}
          var d = {setTimeout}
        `

        expect(generate(code, keywords.WHITELIST_RESERVED)).to.be.equal(format(expected))
      })

      it('#unsafe', function () {
        var code = `
          import a from 'xxx'
          import {b as bb} from 'xxx'
          import * as c from 'xxx'
          const d = require('xxx')
          swan.webView.navigateTo({url: 'abc'})

          function e({f, g: h = i}) {
            console.log(a)
            console.log(b)
            console.log(bb)
            console.log(c)
            console.log(d)
            console.log(e)
            console.log(f)
            console.log(g)
            console.log(h)
            console.log(i)
            console.log(l)
            console.log(m)

            j = new Promise(resolve => resolve())
            var [k, ...l] = []
            eval(k)
          }

          const l = '123'
          class m extends n {
            o() {}
          }

          var p = function q() {}
          ;(r => r()).call(undefined)
          ;(function s() {})()

          console.log(q)
          console.log(s)
          var t = {u}
          var v = {v}
        `

        var expected = `
          import a from 'xxx'
          import {b as bb} from 'xxx'
          import * as c from 'xxx'
          const d = require('xxx')
          swan.webView.navigateTo({url: 'abc'})

          function e({f, g: h = window.MIP.sandbox.i}) {
            console.log(a)
            console.log(window.MIP.sandbox.b)
            console.log(bb)
            console.log(c)
            console.log(d)
            console.log(e)
            console.log(f)
            console.log(window.MIP.sandbox.g)
            console.log(h)
            console.log(window.MIP.sandbox.i)
            console.log(l)
            console.log(m)

            window.MIP.sandbox.j = new Promise(resolve => resolve())
            var [k, ...l] = []
            window.MIP.sandbox.eval(k)
          }

          const l = '123'
          class m extends window.MIP.sandbox.n {
            o() {}
          }

          var p = function q() {}
          ;(r => r()).call(undefined)
          ;(function s() {})()

          console.log(window.MIP.sandbox.q)
          console.log(window.MIP.sandbox.s)
          var t = {u: window.MIP.sandbox.u}
          var v = {v}
        `

        expect(generate(code, keywords.WHITELIST_RESERVED)).to.be.equal(format(expected))
      })

      it('#CatchClause', function () {
        var code = `
          try {}
          catch (e) {
            console.log(e)
          }

          console.log(e)

          try {}
          catch ({message, code}) {
            console.log(code)
            console.log(message)
          }

          console.log(message)
          console.log(code)
        `

        var expected = `
          try {}
          catch (e) {
            console.log(e)
          }

          console.log(window.MIP.sandbox.e)

          try {}
          catch ({message, code}) {
            console.log(code)
            console.log(message)
          }

          console.log(window.MIP.sandbox.message)
          console.log(window.MIP.sandbox.code)
        `

        expect(generate(code, keywords.WHITELIST_RESERVED)).to.be.equal(format(expected))
      })

      it('#strict', function () {
        var code = `
          var a = location.href
          var b = document.createElement('div')
        `

        var expected = `
          var a = location.href
          var b = window.MIP.sandbox.document.createElement('div')
        `

        var expectedInStrict = `
          var a = window.MIP.sandbox.strict.location.href
          var b = window.MIP.sandbox.strict.document.createElement('div')
        `

        expect(generate(code, keywords.WHITELIST_RESERVED)).to.be.equal(format(expected))
        expect(generate(
          code,
          keywords.WHITELIST_STRICT_RESERVED,
          {prefix: 'window.MIP.sandbox.strict'}
        )).to.be.equal(format(expectedInStrict))
      })

      it('#dynamic import', function () {
        var code = `
          var dynamicA = import('path/to/a')
          export default {
            async mounted () {
              var a = await dynamicA
              var b = await import('path/to/b')
              console.log(a)
              console.log(c)
            }
          }
        `

        var expected = `
          var dynamicA = import('path/to/a')
          export default {
            async mounted () {
              var a = await dynamicA
              var b = await import('path/to/b')
              console.log(a)
              console.log(window.MIP.sandbox.c)
            }
          }
        `

        expect(generate(code, keywords.WHITELIST_RESERVED)).to.be.equal(format(expected))
      })

      it('export', function () {
        var code = `
          export {haha as hehe} from 'path/to/haha'
          export {lala} from 'path/to/lala'
          export function a() {}
          var b = 123
          export {b, a as c}
          export default b
        `

        var expected = `
          export {haha as hehe} from 'path/to/haha'
          export {lala} from 'path/to/lala'
          export function a() {}
          var b = 123
          export {b, a as c}
          export default b
        `

        expect(generate(code, keywords.WHITELIST_RESERVED)).to.be.equal(format(expected))
      })

      it('BMap', function () {
        var code = `
          window.BMap.console()
          window.BMap = {}
          BMap = 'hehe'
          BMap = function () {}
        `

        var expected = `
          window.MIP.sandbox.window.BMap.console()
          window.MIP.sandbox.window.BMap = {}
          BMap = 'hehe'
          BMap = function () {}
        `

        expect(generate(code, keywords.WHITELIST_RESERVED)).to.be.equal(format(expected))
      })
    })
  })

  it('#sourcemap', function () {
    var code = 'var a = 0'
    var output = generateFull(code, keywords.WHITELIST_RESERVED, {
      escodegen: {
        sourceMap: 'hehe',
        sourceMapWithCode: true
      }
    })

    var mapString = output.map.toString()
    var map = JSON.parse(mapString)

    expect(Object.keys(output)).to.have.members(['code', 'map'])
    expect(typeof mapString).to.be.equal('string')
    expect(map.mappings.indexOf(',')).to.above(0)
  })
})
