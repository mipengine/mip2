/**
 * @file event-argument.spec.js
 * @author clark-t (clarktanglei@163.com)
 */
import * as lexer from '../../../../src/util/event-action/grammar/event-argument'
import {run} from '../../../../src/util/parser/lexer'
import Walker from '../../../../src/util/parser/walker'

const createFn = (lex) => {
  return (str) => {
    let walker = str instanceof Walker ? str : new Walker(str)
    return run(walker, lex)
  }
}

describe('MIP Argument', () => {
  describe('MIP Argument', () => {
    let fn = createFn(lexer.$mipActionArguments)

    it('New Argument Expression', () => {
      let str = `abc=1,
        def= null,
        someStr = \"this is a string with \\\" and '' \",
        useEvent = event.a
        `
      let ast = fn(str)
      expect(ast.arguments[0].properties.length).to.be.equal(4)
      expect(ast.arguments[0].properties[3].value.type).to.be.equal('Member')
      expect(ast.arguments[0].properties[2].value.value).to.be.equal('this is a string with \" and \'\' ')
    })

    it('Old Argument Expression', () => {
      let str = `123,
        null,
        "this is a string with \\\" and '' ",
        true,
        event,
        event.a,
        DOM.dataset.hello,

        `
      let ast = fn(str)
      expect(ast.arguments.length).to.be.equal(8)
      expect(ast.arguments[5].type).to.be.equal('Member')
    })

    it('No allow to use ID selector expression', () => {
      let str = `123,
        true,
        thisIsAnId.someProperty
        `
      let walker = new Walker(str)
      let ast = fn(walker)
      expect(walker.end()).to.be.equal(false)
    })

    it('use illegal global variable', function () {
      let str = `first=123,abc=eventDom.action,other=123`
      let walker = new Walker(str)
      let ast = fn(walker)
      expect(walker.end()).to.be.equal(false)
    })

    it('use legal global variable', function () {
      let str = `first=123,abc=DOM.eventDom.action,other=123`
      let walker = new Walker(str)
      let ast = fn(walker)
      expect(walker.end()).to.be.equal(true)
    })

    it('empty arguments', function () {
      let str = ''
      let walker = new Walker(str)
      let ast = fn(walker)
      expect(ast.arguments.length).to.be.equal(0)
    })
  })
})


