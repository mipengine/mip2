/**
 * @file event.spec.js
 * @author clark-t (clarktanglei@163.com)
 */


import parser from '../../../../src/util/event-action/parser'

describe('mip-event-handler', () => {
  describe('grammar spec', () => {
    describe('MIPEventHandlers', () => {
      it('With paired bracket', () => {
        const str = `tap:MIP.setData(ab
            c(de(fg)hi(jk))l

        '('
        mn)`
        let ast = parser.parse(str, 'MIPEventHandlers')
        expect(ast.type).to.be.equal('MIPEventHandler')
        expect(ast.actions[0].type).to.be.equal('MIPAction')
        // console.log(JSON.stringify(ast, null, 2))
      })

      it('Normal MIP.setData()', () => {
        const str = `
        tap:
          MIP.setData({
            a: 1,
            b: NaN,
            c: {
              d: (1 + 2 * (4 * event.data))
            }
          })
        `
        let ast = parser.parse(str, 'MIPEventHandlers')
        expect(ast.event.name).to.be.equal('tap')
        expect(ast.actions.length).to.be.equal(1)
      })

      it('New Event Handlers', () => {
        const str = `
        tap:
          MIP.setData({}),
          this-is-id.doSomething((haha) + some other text)
        `
        let ast = parser.parse(str, 'MIPEventHandlers')
        expect(ast.actions.length).to.be.equal(2)
        expect(ast.actions[1].object).to.be.equal('this-is-id')
      })
    })
  })
  // need change before reopen it
  describe.skip('EventHandler', () => {
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
  describe.skip('MIPComponentAction', () => {
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


    })
  })

})

