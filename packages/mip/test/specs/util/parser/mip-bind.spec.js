/**
 * @file mip-bind.spec.js
 * @author clark-t (clarktanglei@163.com)
 */

import parser from '../../../../src/util/parser/syntax/mip-bind/parser'

describe.only('mip-bind', () => {
  describe('parser', () => {
    it('Array Call Expression', () => {
      const str = '[2+3, 4 + 5].join("")'
      let ast = parser.parse(str)
      expect(ast).to.not.be.equal(undefined)
      let fn = parser.generate(ast)
      expect(fn()).to.be.equal('59')
    })

    it.only('event', function () {
      const str = `{a: event.a - (4 - 9), b: event.b.toString()}`
      let fn = parser.transform(str)
      let result = fn({event: {a: 1, b: 2}})
      expect(result.a).to.be.equal(6)
      expect(typeof result.b).to.be.equal('string')
      expect(result.b).to.be.equal('2')
    })
  })
})

