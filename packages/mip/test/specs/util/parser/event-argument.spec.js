/**
 * @file event.spec.js
 * @author clark-t (clarktanglei@163.com)
 */
import parser from '../../../../src/util/event-action/parser'

describe.only('MIP Argument', () => {
  describe('MIP Argument', () => {
    it('New Argument Expression', () => {
      let str = `abc=1,
        def= undefined,
        someStr = \"this is a string with \\\" and '' \",
        useEvent = event.a
        `
      let ast = parser.parse(str, 'MIPActionArguments')
      expect(ast.arguments[0].properties.length).to.be.equal(4)
      expect(ast.arguments[0].properties[3].value.type).to.be.equal('MemberExpression')
      expect(ast.arguments[0].properties[2].value.value).to.be.equal('this is a string with \" and \'\' ')
    })

    it('Old Argument Expression', () => {
      let str = `123,
        null,
        "this is a string with \\\" and '' ",
        true,
        event.a,

        `
      let ast = parser.parse(str, 'MIPActionArguments')
      expect(ast.arguments.length).to.be.equal(6)
      expect(ast.arguments[4].type).to.be.equal('MemberExpression')
    })

    // it('No allow to use DOM expression in Component/Global Arguments', () => {
    //   let str = `123,
    //     true,
    //     DOM.dataset
    //     `
    //   let ast = parser.parse(str, 'MIPActionArguments')
    //   expect(ast).to.be.equal(undefined)
    // })

    it('No allow to use ID selector expression', () => {
      let str = `123,
        true,
        thisIsAnId.someProperty
        `
      let ast = parser.parse(str, 'MIPActionArguments')
      expect(ast).to.be.equal(undefined)
    })
  })

  // describe.only('MIP Component Argument Text', () => {
  //   it('With event expression', () => {
  //     let str = `a=1, b={a: 1, b: "lalala"} , c=event.hahaha,`
  //     let ast = parser.parse(str, 'MIPComponentArgumentsText')
  //     console.log(JSON.stringify(ast, null , 2))
  //   })
  // })

  describe('parser', () => {
    describe('Function Expression', () => {
      it('Array map', () => {
        const str = '[2+3, 4 + 5].map(num => num + "%")'
        let ast = parser.parse(str, 'ConditionalExpression')
        expect(ast).to.not.be.equal(undefined)
        let fn = parser.generate(ast)
        let result = fn()
        expect(result).to.be.deep.equal(['5%', '9%'])
      })


      it('Array filter', () => {
        const str = `'this is a simple string'
          .split(' ')
          .filter(str => str !== 'a')
          .map(str => str[0].toUpperCase() + str.slice(1))
          .join(' ')`
        let ast = parser.parse(str, 'ConditionalExpression')
        let fn = parser.generate(ast)
        let result = fn()
        expect(result).to.be.equal('This Is Simple String')
      })

      it('With global function', () => {
        const str = `(
          ({a: 1, b: -3 -4, c: [3,1,4,1 - 7,5,9] })
            .c
            .sort((a, b) => b - a)
            .indexOf(-6)
          / 2
        ).toFixed()`

        let fn = parser.transform(str, 'ConditionalExpression')
        let result = fn()
        expect(result).to.be.equal('3')
        // console.log(result)
      })
    })

    describe('MIPSetData', () => {
      it('event', function () {
        const str = `{a: event.a - (4 - 9), b: event.b.toString()}`
        let fn = parser.transform(str, 'ObjectExpression')
        let result = fn({event: {a: 1, b: 2}})
        expect(result.a).to.be.equal(6)
        expect(typeof result.b).to.be.equal('string')
        expect(result.b).to.be.equal('2')
      })

      it.skip('DOM', function () {
        const str = `{
          a: event,
          b: DOM.b,
          c: [5, 2, 1, 4].sort()
        }`
        let fn = parser.transform(str, 'ObjectExpression')
        let result = fn({
          event: 10086,
          target: {
            b: "this is VOA special English reports"
          }
        })
        expect(result.a).to.be.equal(10086)
        expect(result.b).to.be.equal('this is VOA special English reports')
        expect(result.c).to.be.deep.equal([1, 2, 4, 5])
      })
    })

    describe('MIPAction', () => {
      it('new style', () => {
        const str = `a = -12345.6,b = event.data,c = DOM.dataset.value`
        let fn = parser.transform(str, 'MIPActionArguments')
        let result = fn({
          event: {
            data: '\'"'
          },
          target: {
            dataset: {
              value: -3456.7
            }
          }
        })
        // console.log(result)
        expect(result[0].a).to.be.equal(-12345.6)
        expect(result[0].b).to.be.equal('\'"')
        expect(result[0].c).to.be.equal(-3456.7)
      })

      it('old style', () => {

        const str = `-123.4, event.a.b, DOM.value`
        let fn = parser.transform(str, 'MIPActionArguments')
        let result = fn({
          event: {
            a: {
              b: true
            }
          },
          target: {
            value: null
          }
        })
        expect(result[0]).to.be.equal(-123.4)
        expect(result[1]).to.be.equal(true)
        expect(result[2]).to.be.equal(null)
        // console.log(result)
      })

      it('illegal arguments', () => {
        const str = `a=event,b={},c=''`
        let err = false
        try {
          let fn = parser.transform(str, 'MIPActionArguments')

        } catch (e) {
          err = true
        }

        expect(err).to.be.equal(true)
      })
    })
    // it('MIPEventHandlers with no args', () => {
    //   let result = 1
    //   let ele = document.createElement('div')
    //   ele.setAttribute('id', 'no-args')
    //   ele.doSomething = function () {
    //     result = 2
    //   }
    //   document.body.appendChild(ele)
    //   const str = `tap:no-args.doSomething`
    //   let ast = parser.parse(str)
    //   // console.log(ast)
    //   let fn = parser.transform(str)
    //   fn({eventName: 'tap'})
    //   document.body.removeChild(ele)
    //   expect(result).to.be.equal(2)
    // })

    // it('MIPEventHandlers with new args', () => {
    //   let result

    //   let ele = document.createElement('div')
    //   ele.setAttribute('id', 'new-args')
    //   ele.doSomething = function (obj) {
    //     result = obj.b
    //   }
    //   document.body.appendChild(ele)

    //   const str = `tap:
    //     new-args.doSomething(
    //       a=10086,
    //       b='hahaha'
    //     )
    //   `
    //   let ast = parser.parse(str)
    //   let fn = parser.transform(str)
    //   fn({eventName: 'tap'})
    //   document.body.removeChild(ele)
    //   expect(result).to.be.equal('hahaha')
    // })


    // it('MIPEventHandlers with old args', () => {
    //   let result

    //   let ele = document.createElement('div')
    //   ele.setAttribute('id', 'old-args')
    //   ele.doSomething = function (a, b) {
    //     result = b
    //   }
    //   document.body.appendChild(ele)

    //   const str = `tap:
    //     old-args.doSomething(
    //       10086,
    //       'hahaha'
    //     )
    //   `
    //   let ast = parser.parse(str)
    //   // console.log(ast)
    //   let fn = parser.transform(str)
    //   fn({eventName: 'tap'})
    //   document.body.removeChild(ele)
    //   expect(result).to.be.equal('hahaha')
    // })

    // it('MIPEventHandlers', () => {
    //   let result = 1
    //   let ele = document.createElement('div')
    //   ele.setAttribute('id', 'hehehou')
    //   ele.doSomething = function () {
    //     result = 2
    //   }
    //   document.body.appendChild(ele)
    //   const str = `tap:hehehou.doSomething`
    //   let ast = parser.parse(str)
    //   // console.log(ast)
    //   let fn = parser.transform(str)
    //   fn({eventName: 'tap'})
    //   document.body.removeChild(ele)
    //   expect(result).to.be.equal(2)
    // })

  })
})


