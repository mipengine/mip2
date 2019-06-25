/**
 * @file event.spec.js
 * @author clark-t (clarktanglei@163.com)
 */


import parser from '../../../../src/util/parser/index'

describe.only('mip-event', () => {
  describe.only('grammar spec', () => {
    // it('MIPStateExpression', () => {
    //   const str = 'asdf-dbsf.setTimeout.helloWorld'
    //   let ast = parser.parse(str, 'MIPStateExpression')
    //   expect(ast.object.object.name).to.be.equal('asdf-dbsf')
    //   expect(ast.object.property.name).to.be.equal('setTimeout')
    // })

    describe('MIPActionAssignmentExpression', () => {
      it('Identifier', () => {
        const str = 'abc = 3.1415926'
        let ast = parser.parse(str, 'MIPActionAssignmentExpression')
        expect(ast.key.name).to.be.equal('abc')
        expect(ast.value.value).to.be.equal(3.1415926)
      })

      // it('MIPStateExpression', () => {
      //   const str = 'asdf$09iq=my-state.asdf.vdassd.dsss'
      //   let ast = parser.parse(str, 'MIPActionAssignmentExpression')
      //   expect(ast.key.name).to.be.equal('asdf$09iq')
      //   expect(ast.value.type).to.be.equal('MIPStateExpression')
      //   expect(ast.value.object.object.object.name).to.be.equal('my-state')
      // })

    })

    it('MIPEvent', () => {
      const str = 'event.asdf.bds$a'
      let ast = parser.parse(str, 'MIPEvent')
      console.log(JSON.stringify(ast, null, 2))

    })
  })

  // describe('parser', () => {
  //   it('Array Call Expression', () => {
  //     const str = '[2+3, 4 + 5].join("")'
  //     let ast = parser.parse(str)
  //     expect(ast).to.not.be.equal(undefined)
  //     let fn = parser.generate(ast)
  //     expect(fn()).to.be.equal('59')
  //   })

  //   it.only('event', function () {
  //     const str = `{a: event.a - (4 - 9), b: event.b.toString()}`
  //     let fn = parser.transform(str)
  //     let result = fn({event: {a: 1, b: 2}})
  //     expect(result.a).to.be.equal(6)
  //     expect(typeof result.b).to.be.equal('string')
  //     expect(result.b).to.be.equal('2')
  //   })
  // })
})

