/**
 * @file event.spec.js
 * @author clark-t (clarktanglei@163.com)
 */


import parser from '../../../../src/util/parser/index'

describe.only('mip-event', () => {
  describe('grammar spec', () => {
    // it('MIPStateExpression', () => {
    //   const str = 'asdf-dbsf.setTimeout.helloWorld'
    //   let ast = parser.parse(str, 'MIPStateExpression')
    //   expect(ast.object.object.name).to.be.equal('asdf-dbsf')
    //   expect(ast.object.property.name).to.be.equal('setTimeout')
    // })

    describe('MIPActionAssignmentExpression', () => {
      it('Identifier', () => {
        const str = 'abc=3.1415926'
        let ast = parser.parse(str, 'MIPActionAssignmentExpression')
        expect(ast.key.name).to.be.equal('abc')
        expect(ast.value.value).to.be.equal(3.1415926)
      })

      it('MIPEvent', () => {
        const str = 'asdf$09iq=event.asdf.vdassd.dsss'
        let ast = parser.parse(str, 'MIPActionAssignmentExpression')
        expect(ast.key.name).to.be.equal('asdf$09iq')
        expect(ast.value.type).to.be.equal('MemberExpression')
        expect(ast.value.object.object.object.name).to.be.equal('event')
      })

    })

    it('MIPEvent', () => {
      const str = 'event.asdf.bds$a'
      let ast = parser.parse(str, 'MIPEvent')
      // console.log(JSON.stringify(ast, null, 2))
      expect(ast.property.name).to.be.equal('bds$a')
      expect(ast.object.property.name).to.be.equal('asdf')
      expect(ast.object.object.name).to.be.equal('event')
    })

    describe('MIPComponentAction', () => {
      it('without args', () => {
        const str = 'this-is-an-id.doSomething'
        let ast = parser.parse(str, 'MIPComponentAction')
        expect(ast.arguments).to.be.deep.equal([])
        expect(ast.callee.property.name).to.be.equal('doSomething')
        expect(ast.callee.object.type).to.be.equal('Identifier')
      })

      it('with empty args', () => {
        const str = 'this-is-an-id.doSomething(    )'
        let ast = parser.parse(str, 'MIPComponentAction')
        expect(ast.arguments).to.be.deep.equal([])
        expect(ast.callee.property.name).to.be.equal('doSomething')
        expect(ast.callee.object.type).to.be.equal('Identifier')
      })

      it('with old args', () => {
        const str = 'an-id.do(12.36, "zifuchuan", true  )'
        let ast = parser.parse(str, 'MIPComponentAction')
        expect(ast.arguments.length).to.be.equal(3)
      })

      it('with new args', () => {
        const str = 'an-id.do(asd=123, bcsdf$_="hhhh", casd=false )'
        let ast = parser.parse(str, 'MIPComponentAction')
        expect(ast.callee.object.name).to.be.equal('an-id')
        expect(ast.callee.property.name).to.be.equal('do')
        expect(ast.arguments.length).to.be.equal(1)
        expect(
          ast.arguments[0].properties.map(obj => obj.key.name)
        ).to.be.deep.equal(['asd', 'bcsdf$_', 'casd'])
      })

      describe('MIPAction', () => {
        it('MIPBindAction', () => {
          const str = `MIP.setData({
            a: 1,
            b:"asd\\"",
            c:3,d:4
          })`
          let ast = parser.parse(str, 'MIPAction')
          expect(ast.type).to.be.equal('CallExpression')
          expect(ast.arguments[0].properties.length).to.be.equal(4)
          expect(
            ast.arguments[0].properties.map(prop => prop.key.name)
          ).to.be.deep.equal(['a', 'b', 'c', 'd'])
          expect(
            ast.arguments[0].properties[1].value.value
          ).to.be.equal('asd\"')
        })

        it('MIPGlobalAction', () => {
          const str = `MIP.navigateTo(
            url='https://www.baidu.com?#v=1&b=2',
            target="_blank",
            openner=true
          )`
          let ast = parser.parse(str, 'MIPAction')
          expect(ast.type).to.be.equal('CallExpression')
          expect(ast.callee.property.name).to.be.equal('navigateTo')
          expect(ast.arguments.length).to.be.equal(1)
          expect(
            ast.arguments[0].properties.map(obj => obj.key.name)
          ).to.be.deep.equal(['url', 'target', 'openner'])

          expect(
            ast.arguments[0].properties.map(obj => obj.value.value)
          ).to.be.deep.equal(['https://www.baidu.com?#v=1&b=2', '_blank', true])
        })


        describe('EventHandler', () => {
          describe('NewEventHandlers', () => {
            it('Multi', () => {
              const str = `
              success:
                MIP.setData({
                  a:1,
                  b: 3+'4'
                }),
                this-is-id.doSth();
              error:
                MIP.navigateTo(a=1, b=2, c=3),
                a-ele.done;
              what:
                every-thing.worksFine
              `
              let ast = parser.parse(str, 'MIPEventHandlers')
              expect(ast.type).to.be.equal('MIPEventHandlers')
              expect(ast.handlers.length).to.be.equal(3)
              // console.log(JSON.stringify(ast));
            })
          })
          describe('EventHandler', () => {
            it('EventHandler', () => {
              const str = `
              asdf:
                MIP.navigateTo(
                  url='https://www.baidu.com?#v=1&b=2',
                  target="_blank",
                  openner=true
                )
              `
              let ast = parser.parse(str, 'MIPEventHandlers')
              expect(ast.type).to.be.equal('MIPEventHandler')
            })
            it('Actions', () => {
              const str = `
              asdt:
                MIP.do,
                is-a-id.exec(1,3,5),
              `
              let ast = parser.parse(str, 'MIPEventHandlers')
              expect(ast.type).to.be.equal('MIPEventHandler')
              // console.log(JSON.stringify(ast))
            })

          })
          describe('OldEventHandlers', () => {

            it('Multi', () => {
              const str = `
                asdf:this-is-my-id.doSomething(1, 'haha', event.a.b.d)
                tap:other.doElse()
                error:hehe-lala.done
              `
              let ast = parser.parse(str, 'MIPEventHandlers')
              expect(ast.type).to.be.equal('MIPEventHandlers')
              expect(ast.handlers.length).to.be.equal(3)
              expect(ast.handlers[0].actions[0].arguments.length).to.be.equal(3)
              expect(ast.handlers[0].actions[0].arguments[2].type).to.be.equal('MemberExpression')
              expect(ast.handlers[1].actions[0].arguments.length).to.be.equal(0)
            })
          })
        })
      })
    })
  })
  describe('parser', () => {
    it('Array Call Expression', () => {
      const str = '[2+3, 4 + 5].join("")'
      let ast = parser.parse(str, 'ConditionalExpression')
      expect(ast).to.not.be.equal(undefined)
      let fn = parser.generate(ast)
      expect(fn()).to.be.equal('59')
    })

    it('event', function () {
      const str = `{a: event.a - (4 - 9), b: event.b.toString()}`
      // let ast = parser.parse(str, 'ConditionalExpression')
      // console.log(JSON.stringify(ast, null, 2))
      let fn = parser.transform(str, 'ConditionalExpression')
      let result = fn({event: {a: 1, b: 2}})
      expect(result.a).to.be.equal(6)
      expect(typeof result.b).to.be.equal('string')
      expect(result.b).to.be.equal('2')
    })

    it('MIPEventHandlers with no args', () => {
      let result = 1
      let ele = document.createElement('div')
      ele.setAttribute('id', 'no-args')
      ele.doSomething = function () {
        result = 2
      }
      document.body.appendChild(ele)
      const str = `tap:no-args.doSomething`
      let ast = parser.parse(str)
      // console.log(ast)
      let fn = parser.transform(str)
      fn({eventName: 'tap'})
      document.body.removeChild(ele)
      expect(result).to.be.equal(2)
    })

    it('MIPEventHandlers with new args', () => {
      let result

      let ele = document.createElement('div')
      ele.setAttribute('id', 'new-args')
      ele.doSomething = function (obj) {
        result = obj.b
      }
      document.body.appendChild(ele)

      const str = `tap:
        new-args.doSomething(
          a=10086,
          b='hahaha'
        )
      `
      let ast = parser.parse(str)
      let fn = parser.transform(str)
      fn({eventName: 'tap'})
      document.body.removeChild(ele)
      expect(result).to.be.equal('hahaha')
    })


    it('MIPEventHandlers with old args', () => {
      let result

      let ele = document.createElement('div')
      ele.setAttribute('id', 'old-args')
      ele.doSomething = function (a, b) {
        result = b
      }
      document.body.appendChild(ele)

      const str = `tap:
        old-args.doSomething(
          10086,
          'hahaha'
        )
      `
      let ast = parser.parse(str)
      // console.log(ast)
      let fn = parser.transform(str)
      fn({eventName: 'tap'})
      document.body.removeChild(ele)
      expect(result).to.be.equal('hahaha')
    })

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

