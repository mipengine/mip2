/**
 * @file mip-bind.spec.js
 * @author clark-t (clarktanglei@163.com)
 */
import * as lexer from '../../../../src/util/event-action/grammar/basic'
// import lexer from '../../../../src/util/event-action/grammar/index'
import {run} from '../../../../src/util/parser/lexer'
import Walker from '../../../../src/util/parser/walker'

describe('Test Grammar', function () {
  describe('Test Identifier', function () {
    let fn = (walker) => run(walker, lexer.$conditional)
    it('Should match as boolean and Variable', function () {
      let str = `{
        a: true,
        b: false,
        'c': trueOrFalse,
        defg: null
      }`
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.properties[0].value.value).to.be.equal(true)
      expect(result.properties[2].value.type).to.be.equal('Variable')
      expect(result.properties[3].value.value).to.be.equal(null)
    })

    it('Shoud match as Variable', function () {
      let str = `trueOrFalse`
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.type).to.be.equal('Variable')
      expect(result.name).to.be.equal('trueOrFalse')
    })

    it('Should match as Boolean', function () {
      let str = `true`
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.type).to.be.equal('Literal')
      expect(result.value).to.be.equal(true)
    })
  })

  describe('Test String', function () {
    let fn = (walker) => run(walker, lexer.$string)
    it('empty string', function () {
      let str = '""'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.value).to.be.equal('')
      expect(walker.end()).to.be.true
    })
    it('simple string', function () {
      let str = '"asdf"'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(!!result).to.be.true
      expect(result.value).to.be.equal(JSON.parse(str))
      expect(walker.end()).to.be.true
    })

    it('string with special string and escape string', function () {
      let str = '"sdfgsdfgsdee&^&%&\n\tccc"'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(!!result).to.be.true
      expect(result.raw).to.be.equal(str)
      expect(walker.end()).to.be.true
    })
    it('string with full escape', function () {
      let str = '"asdf\\"sd\\/a\\b\\f\\n\\rd\\t"'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.raw).to.be.equal(str)
      expect(walker.end()).to.be.true
    })

    it('string with single quote and double quote', function () {
      let str = "'asdf\\'sdasd\\\"sss'"
      let walker = new Walker(str)
      let result = fn(walker)
      expect(!!result).to.be.true
      expect(result.raw).to.be.equal(str)
      expect(walker.end()).to.be.true
    })

  })

  describe('Test Boolean', function () {
    let fn = (walker) => run(walker, lexer.$boolean)

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
    let fn = (walker) => run(walker, lexer.$literal)

    it('should be equal', function () {
      let str = 'nullfalsetrue3.1415926"hehehou\\"lalal"'
      let walker = new Walker(str)
      expect(fn(walker).raw).to.be.equal('null')
      expect(fn(walker).raw).to.be.equal('false')
      // undefined is Identifier but not Literal
      // expect(fn(walker).raw).to.be.equal('undefined')
      expect(fn(walker).raw).to.be.equal('true')
      expect(fn(walker).raw).to.be.equal('3.1415926')
      expect(fn(walker).raw).to.be.equal('"hehehou\\"lalal"')
    })
  })

  describe('Test ArrayExpression', function () {
    let fn = (walker) => run(walker, lexer.$array)

    it('should be equal', function () {
      let str = '[1, 1 + 2,]'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.elements.length).to.be.equal(2)
      expect(result.elements[0].type).to.be.equal('Literal')
      expect(result.elements[1].type).to.be.equal('Binary')
      expect(result.elements[2]).to.be.equal(undefined)
    })
  })

  describe('Test Property', function () {
    let fn = (walker) => run(walker, lexer.$property)
    it('should be equal', function () {
      let str = '"a": 1 + 2'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.key.raw).to.be.equal('"a"')
      expect(result.key.type).to.be.equal('Literal')
    })
    it('should be equal', function () {
      let str = '"asdf": 1 + 2'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.key.raw).to.be.equal('"asdf"')
      expect(result.value.type).to.be.equal('Binary')
    })
    it('should be equal', function () {
      let str = 'a: 1 + 2'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.key.name).to.be.equal('a')
      expect(result.value.type).to.be.equal('Binary')
    })
    it('should be equal', function () {
      let str = '_0123: 1 + 2'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.key.name).to.be.equal('_0123')
      expect(result.value.type).to.be.equal('Binary')
    })

  })

  describe('Test Object', function () {
    let fn = (walker) => run(walker, lexer.$object)

    it('Computed Value', function () {
      let str = `{
        a: 1,
        '$asdf'   : 1 + (2 - 3) * 4
      }`
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.properties.length).to.be.equal(2)
      expect(result.properties[0].value.value).to.be.equal(1)
      expect(result.properties[1].key.value).to.be.equal('$asdf')
    })

    it('Empty Value', function () {
      let str = `{}`
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.properties).to.be.deep.equal([])
    })

    it('Computed Key', function () {
      let str = `{
        abc: 123,
        ['a' + 'cd']: true ? 2 : 3,
        [3 -2]: 12345
      }`
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.properties.length).to.be.equal(3)
      expect(result.properties[1].key.type).to.be.equal('Binary')
      expect(result.properties[2].key.type).to.be.equal('Binary')
    })
  })

  describe('Test MemberExpression', function () {
    let fn = (walker) => run(walker, lexer.$member)
    it('simple Member Expression', function () {
      let str = 'aa.bb.cc.dd'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.type).to.be.equal('Member')
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
      expect(result.type).to.be.equal('Variable')
      expect(result.name).to.be.equal('aa')
    })
  })


  describe('Test BinaryExpression', function () {
    let fn = (walker) => run(walker, lexer.$binary)
    it('Multiplicative', function () {
      let str = '1 * abc * 3'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.left.right.name).to.be.equal('abc')
    })
    it('Additive', function () {
      let str = '1 + abc + 3'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.left.right.name).to.be.equal('abc')
    })
    it('With Grouping', function () {
      let str = '1 * (abc * 3) + def'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.left.right.left.name).to.be.equal('abc')
    })
    it('With Logical', function () {
      let str = '1 * abc > 3/4* abc || a.b.c === 3 -123&&666'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.operator).to.be.equal('||')
      expect(result.left.operator).to.be.equal('>')
      expect(result.right.operator).to.be.equal('&&')
      expect(result.right.left.operator).to.be.equal('===')
    })

  })

  describe('Test Unary', function () {
    let fn = (walker) => run(walker, lexer.$unary)
    it('Grouping', function () {
      let str = `( 10086  )`
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.type).to.be.equal('Literal')
    })
    it('Minus', function () {
      let str = `-3.1415926`
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.type).to.be.equal('Unary')
      expect(result.operator).to.be.equal('-')
      expect(result.argument.value).to.be.equal(3.1415926)
    })
    it('Multi Unary', function () {
      let str = `~   ( 1 + (2-3)  )`
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.type).to.be.equal('Unary')
      expect(result.operator).to.be.equal('~')
      expect(result.argument.type).to.be.equal('Binary')
      expect(result.argument.right.operator).to.be.equal('-')
    })

  })

  describe('Test Arguments', function () {
    let fn = (walker) => run(walker, lexer.$arguments)
    it('Empty Arguments', function () {
      let str = `(        )`
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.type).to.be.equal('Call')
      expect(result.arguments.length).to.be.equal(0)
    })
    it('One Arguments', function () {
      let str = `(   (1 + (2 * asdf))    )`
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.type).to.be.equal('Call')
      expect(result.arguments.length).to.be.equal(1)
    })
    it('Multi Arguments', function () {
      let str = `( (11) * asda , a.b[2+4], (a()() + 7),  )`
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.type).to.be.equal('Call')
      expect(result.arguments.length).to.be.equal(4)
    })
    it('Empty Arguments', function () {
      let str = `(        )`
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.type).to.be.equal('Call')
      expect(result.arguments.length).to.be.equal(0)
    })

  })

  describe('Test CallExpression', function () {
    // let fn = lexer.use('CallExpression')
    let fn = (walker) => run(walker, lexer.$call)
    it('Continual CallExpression', function () {
      let str = 'a()()()'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.type).to.be.equal('Call')
      expect(result.callee.callee.callee.name).to.be.equal('a')
    })

    it('With arguments', function () {
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
    })

    it('With illegal arguments', function () {
      let str = 'a(1+2,,3+4)'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.type).to.be.equal('Variable')
      expect(walker.end()).to.be.equal(false)
    })
  })

  describe('Test Arguments', function () {
    let fn = (walker) => run(walker, lexer.$params)
    it ('Zero Params', function () {
      let str = `(        )`
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.type).to.be.equal('Params')
      expect(result.params.length).to.be.equal(0)
    })
    it ('One Params', function () {
      let str = `(    asdfg    )`
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.type).to.be.equal('Params')
      expect(result.params.length).to.be.equal(1)
    })
    it('One Params Without paren', function () {
      let str = `asdf`
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.type).to.be.equal('Params')
      expect(result.params.length).to.be.equal(1)
    })

    it('Standard Multi Params', function () {
      let str = `( $_abc,def,ghi,   kj  )`
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.type).to.be.equal('Params')
      expect(result.params.length).to.be.equal(4)
    })

    it ('Multi Params With tail comma', function () {
      let str = `(  abc, def, ghi,      )`
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.type).to.be.equal('Params')
      expect(result.params.length).to.be.equal(3)
    })

  })

  describe('Test ArrowFunctionExpression', function () {
    let fn = (walker) => run(walker, lexer.$arrowFunction)
    it('Without Params', function () {
      let str = '(   )  =>   "3" > 1 ? 2 + 1: false'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.type).to.be.equal('ArrowFunction')
      expect(result.params.length).to.be.equal(0)
      expect(result.body.type).to.be.equal('Conditional')
    })

    it('With 1 param and no bracket', function () {
      let str = 'asdf=>event.a.b.c()().d'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(walker.end()).to.be.equal(true)
      expect(result.params.length).to.be.equal(1)
      expect(result.body.type).to.be.equal('Member')
    })

    it('With {}', function () {
      let str = 'asdf => {a: 1, b: 2}'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(walker.end()).to.be.equal(false)
      expect(walker.index).to.be.equal(0)
    })

    it('With ({})', function () {
      let str = 'asdf => ({a: 1, b: 2})'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(walker.end()).to.be.equal(true)
      expect(result.type).to.be.equal('ArrowFunction')
      expect(result.body.type).to.be.equal('ObjectLiteral')
    })

  })

  describe('Test Arguments', function () {
    let fn = (walker) => run(walker, lexer.$arguments)

    it('no arguments', function () {
      let str = '( )'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.arguments.length).to.be.equal(0)
    })

    it('arguments', function () {
      let str = '(1,2+3 *(4-5),3)'
      let walker = new Walker(str)
      let result = fn(walker)
      expect(result.arguments.length).to.be.equal(3)
      expect(result.arguments[1].right.right.operator).to.be.equal('-')
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

