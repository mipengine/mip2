/**
 * @file mip-bind.spec.js
 * @author clark-t (clarktanglei@163.com)
 */
import lexer from '../../../../src/util/parser/grammar/index'
import Walker from '../../../../src/util/parser/core/walker'

describe.only('Test Grammar', function () {
  describe('Test String', function () {
    let fn = lexer.use('String')

    it('should be equal', function () {
      let str = '""'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.raw).to.be.equal(str)
      expect(walker.end()).to.be.true
    })
    it('should be equal', function () {
      let str = '"asdf"'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(!!result).to.be.true
      expect(result.raw).to.be.equal(str)
      expect(walker.end()).to.be.true
    })

    it('should be equal', function () {
      let str = '"sdfgsdfgsdee&^&%&\n\tccc"'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(!!result).to.be.true
      expect(result.raw).to.be.equal(str)
      expect(walker.end()).to.be.true
    })
    it('should be equal', function () {
      let str = '"asdf\\"sdad\t"'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(!!result).to.be.true
      expect(result.raw).to.be.equal(str)
      expect(walker.end()).to.be.true
    })


    it('should be equal', function () {
      let str = "'asdf\\'sdasd\\\"sss'"
      let walker = new Walker(str)
      let result = fn(walker)
      expect(!!result).to.be.true
      expect(result.raw).to.be.equal(str)
      expect(walker.end()).to.be.true
    })

  })

  describe('Test Boolean', function () {
    let fn = lexer.use('Boolean')

    it('should be true', function () {
      let walker = new Walker('true')
      let result = fn(walker)
      expect(!!result).to.be.true
      expect(result.raw).to.be.equal('true')
      expect(walker.end()).to.be.true
    })

    it('should be true with rest', function () {
      let walker = new Walker('true)')
      let result = fn(walker)
      expect(!!result).to.be.true
      expect(result.raw).to.be.equal('true')
      expect(walker.end()).to.be.false
      expect(walker.str.slice(walker.index)).to.be.equal(')')
    })

    it('should not be true', function () {
      let walker = new Walker('atrue')
      let result = fn(walker)
      expect(!!result).to.be.false
      // expect(result.raw).to.be.equal('true')
      expect(walker.end()).to.be.false
      expect(walker.str.slice(walker.index)).to.be.equal('atrue')

    })

    it('should be false', function () {
      let walker = new Walker('false')
      let result = fn(walker)
      expect(!!result).to.be.true
      expect(result.raw).to.be.equal('false')
      expect(walker.end()).to.be.true
    })

    it('should be false with rest', function () {
      let walker = new Walker('false()')
      let result = fn(walker)
      expect(!!result).to.be.true
      expect(result.raw).to.be.equal('false')
      expect(walker.end()).to.be.false
      expect(walker.str.slice(walker.index)).to.be.equal('()')
    })

    it('should not be false', function () {
      let walker = new Walker('afalse')
      let result = fn(walker)
      expect(!!result).to.be.false
      expect(walker.end()).to.be.false
      expect(walker.str.slice(walker.index)).to.be.equal('afalse')
    })
  })

  describe('Test Literal', function () {
    let fn = lexer.use('Literal')

    it('should be equal', function () {
      let str = 'nullfalseundefinedtrue3.1415926"hehehou\\"lalal"'
      let walker = new Walker(str)
      expect(fn(walker).raw).to.be.equal('null')
      expect(fn(walker).raw).to.be.equal('false')
      expect(fn(walker).raw).to.be.equal('undefined')
      expect(fn(walker).raw).to.be.equal('true')
      expect(fn(walker).raw).to.be.equal('3.1415926')
      expect(fn(walker).raw).to.be.equal('"hehehou\\"lalal"')
    })
  })

  describe('Test ArrayExpression', function () {
    let fn = lexer.use('ArrayExpression')

    it('should be equal', function () {
      let str = '[1, 1 + 2,]'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.elements.length).to.be.equal(3)
      expect(result.elements[0].type).to.be.equal('Literal')
      expect(result.elements[1].type).to.be.equal('BinaryExpression')
      expect(result.elements[2]).to.be.equal(undefined)
    })
  })

  describe('Test Property', function () {
    let fn = lexer.use('Property')
    it('should be equal', function () {
      let str = '"a": 1 + 2'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.name.raw).to.be.equal('"a"')
      expect(result.name.type).to.be.equal('String')
    })
    it('should be equal', function () {
      let str = '"asdf": 1 + 2'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.name.raw).to.be.equal('"asdf"')
      expect(result.value.type).to.be.equal('BinaryExpression')
    })
    it('should be equal', function () {
      let str = 'a: 1 + 2'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.name.name).to.be.equal('a')
      expect(result.value.type).to.be.equal('BinaryExpression')
    })
    it('should be equal', function () {
      let str = '_0123: 1 + 2'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.name.name).to.be.equal('_0123')
      expect(result.value.type).to.be.equal('BinaryExpression')
    })

  })

  describe('Test Object', function () {
    let fn = lexer.use('ObjectExpression')

    it('should be equal', function () {
      let str = `{
        a: 1,
        '$asdf'   : 1 + (2 - 3) * 4
      }`
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.properties.length).to.be.equal(2)
      expect(result.properties[0].value.value).to.be.equal(1)
      expect(result.properties[1].name.value).to.be.equal('$asdf')
    })

    it('should be equal', function () {
      let str = `{}`
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.properties).to.be.deep.equal([])
    })
  })

  describe('Test MemberExpression', function () {
    let fn = lexer.use('MemberExpression')
    it('simple Member Expression', function () {
      let str = 'aa.bb.cc.dd'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.type).to.be.equal('MemberExpression')
      expect(result.object.object.object.name).to.be.equal('aa')
    })

    it('computed Member Expression', function () {
      let str = 'aa[1+3 - (4 *5)].bb["a\\"c"]'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.property.value).to.be.equal('a"c')
      expect(result.object.object.property.right.operator).to.be.equal('*')
    })

    it('fallback to Literal Expression', function () {
      let str = 'aa'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.type).to.be.equal('Identifier')
      expect(result.name).to.be.equal('aa')
    })
  })


  describe('Test MultiplicativeExpression', function () {
    let fn = lexer.use('MultiplicativeExpression')
    it('should be equal', function () {
      let str = '1 * abc * 3'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.left.right.name).to.be.equal('abc')
    })
  })

  describe('Test CallExpression', function () {
    let fn = lexer.use('CallExpression')
    it('Continual CallExpression', function () {
      let str = 'a()()()'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.type).to.be.equal('CallExpression')
      expect(result.callee.callee.callee.name).to.be.equal('a')
    })

    it('With arguments', function () {
      // let str = 'abc.def[1 * (2 - 3)](4 + 5, (6*7)).hij()'
      let str = 'a(     1        , 3 * (4   - 5),    )'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.arguments.length).to.be.equal(3)
      expect(result.arguments[1].operator).to.be.equal('*')
    })

    it('Combine MemberExpression and CallExpression', function () {
      let str = 'abc.def[1 * (2 - 3)](4 + 5, (((   6*7 )))).hij()'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(walker.end()).to.be.true
      expect(result.callee.object.callee.object.property.name).to.be.equal('def')
      expect(result.callee.object.callee.property.right.right.value).to.be.equal(3)
      expect(result.callee.object.arguments[1].operator).to.be.equal('*')
      // console.log(JSON.stringify(result, null, 1))
    })

    it('With illegal arguments', function () {
      let str = 'a(1+2,,3+4)'
      let walker = new Walker(str)
      let result = fn(walker)
      // console.log(result)
      expect(result.type).to.be.equal('Identifier')
      expect(walker.end()).to.be.equal(false)
    })
  })

  describe.only('Test ArrowFunctionExpression', function () {
    let fn = lexer.use('ArrowFunctionExpression')
    it('Without Params', function () {
      let str = '(   )  =>   "3" > 1 ? 2 + 1: false'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.type).to.be.equal('ArrowFunctionExpression')
      expect(result.params.length).to.be.equal(0)
      expect(result.body.type).to.be.equal('ConditionalExpression')
      // console.log(JSON.stringify(result))
    })

    it('With 1 param and no bracket', function () {
      let str = 'asdf=>event.a.b.c()().d'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(walker.end()).to.be.equal(true)
      expect(result.params.length).to.be.equal(1)
      expect(result.body.type).to.be.equal('MemberExpression')
      // console.log(JSON.stringify(result))
    })

    it('With {}', function () {
      let str = 'asdf => {a: 1, b: 2}'
      let walker = new Walker(str)
      let result = fn(walker)
      // console.log(result)
      expect(walker.end()).to.be.equal(false)
      expect(walker.index).to.be.equal(0)
      // console.log(walker.rest())
    })

    it.only('With ({})', function () {
      let str = 'asdf => ({a: 1, b: 2})'
      let walker = new Walker(str)
      let result = fn(walker)
      console.log(result)
      // expect(walker.end()).to.be.equal(false)
      // expect(walker.index).to.be.equal(0)
      // console.log(walker.rest())
    })

  })

  describe('Test Arguments', function () {
    let fn = lexer.use('Arguments')

    it('no arguments', function () {
      let str = '( )'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.arguments.length).to.be.equal(0)
      // console.log(JSON.stringify(result, null, 2))
    })

    it('arguments', function () {
      let str = '(1,2+3 *(4-5),3)'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.arguments.length).to.be.equal(3)
      expect(result.arguments[1].right.right.operator).to.be.equal('-')
      // console.log(JSON.stringify(result, null, 2))
    })

    it('missing trailing arguments', function () {
      let str = '(1,2,    )'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.arguments.length).to.be.equal(3)
      expect(result.arguments[2]).to.be.equal(undefined)
    })
  })
})

