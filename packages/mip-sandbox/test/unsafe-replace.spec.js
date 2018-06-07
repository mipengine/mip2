/**
 * @file unsafe-replace.spec.js
 * @author clark-t (clarktanglei@163.com)
 */

/* globals describe, it */

var chai = require('chai')
var expect = chai.expect
var replace = require('../lib/unsafe-replace')
var esprima = require('esprima')
var escodegen = require('escodegen')

function format (a) {
  return escodegen.generate(esprima.parseModule(a))
}

describe('unsafe-replace', function () {
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
      var a = MIP.sandbox.this(this)
      MIP.sandbox.this(this)()
      MIP.sandbox.this(this).setTimeout()
      var b = {this: MIP.sandbox.this(this)}
      MIP.sandbox.this(this)['setTimeout']()
      var c = {
        [MIP.sandbox.this(this)]: MIP.sandbox.this(this)[MIP.sandbox.this(this)][MIP.sandbox.this(this).setTimeout()]
      }
    `

    expect(replace(code)).to.be.equal(format(expected))
  })

  it('#string', function () {
    /* eslint-disable */
    var code = '`abcd${this[this].this}efg${b[c].d}`'
    var expected = '`abcd${MIP.sandbox.this(this)[MIP.sandbox.this(this)].this}efg${MIP.sandbox.b[MIP.sandbox.c].d}`'
    /* eslint-enable */
    expect(replace(code)).to.be.equal(format(expected))
  })

  it('#object', function () {
    var code = `
      var a = {b}
      var c = {c}
      var d = {setTimeout}
    `

    var expected = `
      var a = {b: MIP.sandbox.b}
      var c = {c}
      var d = {setTimeout}
    `

    expect(replace(code)).to.be.equal(format(expected))
  })

  it('#unsafe', function () {
    var code = `
      import a from 'xxx'
      import {b as bb} from 'xxx'
      import * as c from 'xxx'
      const d = require('xxx')

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

      function e({f, g: h = MIP.sandbox.i}) {
        console.log(a)
        console.log(MIP.sandbox.b)
        console.log(bb)
        console.log(c)
        console.log(d)
        console.log(e)
        console.log(f)
        console.log(MIP.sandbox.g)
        console.log(h)
        console.log(MIP.sandbox.i)
        console.log(l)
        console.log(m)

        MIP.sandbox.j = new Promise(resolve => resolve())
        var [k, ...l] = []
        MIP.sandbox.eval(k)
      }

      const l = '123'
      class m extends MIP.sandbox.n {
        o() {}
      }

      var p = function q() {}
      ;(r => r()).call(undefined)
      ;(function s() {})()

      console.log(MIP.sandbox.q)
      console.log(MIP.sandbox.s)
      var t = {u: MIP.sandbox.u}
      var v = {v}
    `

    expect(replace(code)).to.be.equal(format(expected))
  })
})
