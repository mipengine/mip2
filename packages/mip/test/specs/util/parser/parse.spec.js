// import parser from '../'

import parser from '../../../../src/util/event-action/parser'

describe('parser', () => {
  describe('Basic caculation', function () {
    it('Conditional Expression', function () {
      const str = `1 + (2 > 3 ? 1 : 10086)`
      let fn = parser.transform(str, 'Conditional')
      let result = fn()
      expect(result).to.be.equal(10087)
    })

    it('Number Caculation', function () {
      const str = `~1 +
        4 * (5 +(-7)) / 1 +
        (1 > 0 ? 10 : 20) -
        (-1 >= -1 ? 100 : 200) +
        (123 <= 467 ?1000:2000) +
        (true==1?10000:20000)+
        ((false!=-1) && 100000)+
        !true+200000+
        3%(5 - 2)`
      let fn = parser.transform(str, 'Conditional')
      let result = fn()
      expect(result).to.be.equal(310900)
    })

    it('Boolean Caculation', function () {
      const str = `0 || true === (+'1' < (1-2))`
      let fn = parser.transform(str, 'Conditional')
      let result = fn()
      expect(result).to.be.equal(false)
    })

    it('Sort Array', function () {
      const str = `[3,1,4,1,5].sort()`
      let fn = parser.transform(str, 'Conditional')
      let result = fn()
      expect(result).to.be.deep.equal([1, 1, 3, 4, 5])
    })

    it('Empty Array', function () {
      const str = `[       ].sort()`
      let fn = parser.transform(str, 'Conditional')
      let result = fn()
      expect(result).to.be.deep.equal([])
    })

    it('Hole Array', function () {
      const str = `[,,1,3+4,]`
      let fn = parser.transform(str, 'Conditional')
      let result = fn()
      console.log(JSON.stringify(result))
      expect(result).to.be.deep.equal([,,1,3+4,])
    })

    it('Splice Array', function () {
      const str = `m.array.splice(1,3)`
      let fn = parser.transform(str, 'Conditional')
      let source = {data: {
        array: [1, 2, 3, 4, 5]
      }}
      let result = fn(source)
      expect(result).to.be.deep.equal([1, 5])
      expect(source.data.array.length).to.be.equal(5)
    })

    it('Use illegal prototype Function', function () {
      const str = `({a: 1}).valueOf()`
      let fn = parser.transform(str, 'Conditional')
      expect(() => fn()).to.be.throw(`不支持 [object Object].valueOf 方法`)
    })

    it('event and DOM', function () {
      const str = `1 +
        event.a.b -
        (DOM.dataset.score + two.way.binding) + ~undefined`
      let fn = parser.transform(str, 'Conditional')
      let result = fn({
        event: {
          a: {b: 10086}
        },
        target: {
          dataset: {
            score: 10000
          }
        },
        data: {
          two: {
            way: {
              binding: 123
            }
          }
        }
      })
      expect(result).to.be.equal(-37)
    })

    it('Global Variable', function () {
      let str = `Math.abs(-2) +
        Math.PI +
        isNaN(Number.NaN) +
        Object.keys({a: 1, b: {a: 1}}).length +
        Date.parse('2019-07-18 19:18:00') +
        ~Array.isArray(undefined) +
        String.fromCharCode(65) === 'A'`
      let fn = parser.transform(str, 'Conditional')
      let result = fn()
      expect(result).to.be.equal(
        Math.abs(-2) +
        Math.PI +
        isNaN(Number.NaN) +
        Object.keys({a: 1, b: {a: 1}}).length +
        Date.parse('2019-07-18 19:18:00') +
        ~Array.isArray(undefined) +
        String.fromCharCode(65) === 'A'
      )
    })

    it('Arrow Function', function () {
      let str = `num => num + 1 + "%"`
      let fn = parser.transform(str, 'ArrowFunction')
      let result = fn()
      expect(result(2049)).to.be.equal('2050%')
    })
  })

  describe('Function Expression', () => {
    it('Array map', () => {
      const str = '[2+3, 4 + 5].map(num => num + "%")'
      let ast = parser.parse(str, 'Conditional')
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
      let ast = parser.parse(str, 'Conditional')
      let fn = parser.generate(ast)
      let result = fn()
      expect(result).to.be.equal('This Is Simple String')
    })

    it('Nested Function', () => {
      const str = `[[1, 2, 3], [4, 5 + (true + 1),]].reduce(
        (output, arr) => output.concat(
          arr.reduce((output, item) => output + item + ',', '')
        ),
        []
      )
      .join(' ')`
      let fn = parser.transform(str, 'Conditional')
      let result = fn()
      expect(result).to.be.equal('1,2,3, 4,7,')
    })

    it('Nested Function with cross scope arguments', () => {
      const str = `[[1, 2, 3], [4, 5 + (true + 1),]].reduce(
        (output, arr, line) => output.concat(
          arr.reduce((output, item, row) => output + item + '[' + line + ',' + row + '],', '')
        ),
        []
      )
      .join(' ')`
      let fn = parser.transform(str, 'Conditional')
      let result = fn()
      expect(result).to.be.equal('1[0,0],2[0,1],3[0,2], 4[1,0],7[1,1],')
    })


    it('With global function', () => {
      const str = `(
          ({a: 1, b: -3 -4, c: [3,1,4,1 - 7,5,9] })
            .c
            .sort((a, b) => b - a)
            .indexOf(-6)
          / 2
        ).toFixed()`

      let fn = parser.transform(str, 'Conditional')
      let result = fn()
      expect(result).to.be.equal('3')
    })
  })

  describe('MIPSetData', () => {
    it('event', function () {
      const str = `{a: event.a - (4 - 9), b: event.b.toString()}`
      let fn = parser.transform(str, 'ObjectLiteral')
      let result = fn({event: {a: 1, b: 2}})
      expect(result.a).to.be.equal(6)
      expect(typeof result.b).to.be.equal('string')
      expect(result.b).to.be.equal('2')
    })

    it('DOM', function () {
      const str = `{
          a: event,
          b: DOM.b,
          c: [5, 2, 1, 4].sort()
        }`
      let fn = parser.transform(str, 'ObjectLiteral')
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

