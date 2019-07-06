/**
 * @file event-object.spec.js
 * @author clark-t (clarktanglei@163.com)
 */

import parser from '../../../../src/util/event-action/parser'

describe('MIP event object', () => {
  describe('grammar spec', () => {
    describe('MIP Event', () => {

      it('MIPEvent', () => {
        const str = 'event.asdf.bds$a'
        let ast = parser.parse(str, 'MIPEvent')
        expect(ast.property.name).to.be.equal('bds$a')
        expect(ast.object.property.name).to.be.equal('asdf')
        expect(ast.object.object.name).to.be.equal('event')
      })

    })

    describe('MIP DOM', () => {
      it('MIP DOM', () => {
        const str = `DOM.dataset.asdfg`
        let ast = parser.parse(str, 'MIPDOM')
        expect(ast.property.name).to.be.equal('asdfg')
        expect(ast.object.object.name).to.be.equal('DOM')
        expect(ast.object.object.role).to.be.equal('DOM')
      })
    })
  })
})

