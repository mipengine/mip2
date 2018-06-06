/**
 * @file unsafe-detect.spec.js
 * @author clark-t (clarktanglei@163.com)
 */

var chai = require('chai')
var unsafeDetect = require('../lib/unsafe-detect')

var code = `
import a from 'xxx'
import {b as c} from 'xxx'

;(function (d) {
  console.log(a)
  console.log(b)
  console.log(c)
  console.log(d)
  console.log(e)
  console.log(f)
  w = this
})(undefined)

function e() {}
`

var list = unsafeDetect(code)

console.log(list)
