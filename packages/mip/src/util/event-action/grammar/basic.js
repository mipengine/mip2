// import {$question} from 'src/util/event-action/grammar/token';

/**
 * @file state-grammar.js
 * @author clark-t (clarktanglei@163.com)
 * @description
 *   Inspired By the listing URLs
 *    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
 *    https://github.com/pegjs/pegjs/blob/master/examples/javascript.pegjs
 */

import {
  text,
  regexp,
  seq,
  or,
  any,
  some,
  opt,
  not
} from '../../parser/lexer'

import {
  _,
  $question,
  $colon,
  $comma,
  $dot,
  $leftBrace,
  $rightBrace,
  $leftBracket,
  $rightBracket,
  $leftParen,
  $rightParen,
  $singleQuote,
  $doubleQuote,
  $trueToken,
  $falseToken,
  $nullToken,
  $reservedToken
} from './token'

import lex from './lexer'

function buildBinaryAst ([head, tails]) {
  return tails.reduce((result, args) => {
    return {
      type: 'Binary',
      operator: args[1].raw,
      left: result,
      right: args[3]
    }
  }, head)
}

/**
 * 匹配数字，包括整数、小数、1e2 等十进制数
 *
 * @type {Rule}
 */
export const $number = lex.set({
  type: 'Number',
  rule: [regexp, /^(0|[1-9]\d*)(\.\d+)?(e[+-]?\d+)?/i],
  match (match) {
    match.value = +match.raw
    match.type = 'Literal'
    return match
  }
})

/**
 * 匹配布尔值 true false
 *
 * @type {Rule}
 */
export const $boolean = lex.set({
  type: 'Boolean',
  rule: [or, [
    $trueToken,
    $falseToken
    // [text, 'true'],
    // [text, 'false']
  ]],
  match (args) {
    args.value = args.raw === 'true'
    args.type = 'Literal'
    return args
  }
})

/**
 * 匹配 null
 *
 * @type {Rule}
 */
export const $null = lex.set({
  type: 'Null',
  rule: $nullToken,
  // rule: [
  //   text, 'null'
  // ],
  match (match) {
    match.value = null
    match.type = 'Literal'
    return match
  }
})

/**
 * 匹配字符串中的转义字符，如 \t \n \\ " ' 等等
 *
 * @type {Rule}
 */
export const $escape = lex.set({
  type: 'Escape',
  rule: [
    [text, '\\'],
    [regexp, /^["'\\/bfnrt]/]
  ],
  match (args) {
    let escape = args[0]
    let character = args[1]
    let value

    switch (character.raw) {
      case '"':
      case '\'':
      case '\\':
      case '/':
        value = character.raw
        break
      case 'b':
        value = '\b'
        break
      case 'f':
        value = '\f'
        break
      case 'n':
        value = '\n'
        break
      case 'r':
        value = '\r'
        break
      case 't':
        value = '\t'
    }

    return {
      raw: escape.raw + character.raw,
      value: value
    }
  }
})

/**
 * 匹配字符串，包括双引号和单引号两种
 *
 * @type {Rule}
 */
export const $string = lex.set({
  type: 'String',
  rule: [or, [
    [seq, [
      $doubleQuote,
      [any,
        [or, [
          $escape,
          [regexp, /^[^"]/]
        ]]
      ],
      $doubleQuote
    ]],
    [seq, [
      $singleQuote,
      [any,
        [or, [
          $escape,
          [regexp, /^[^']/]
        ]]
      ],
      $singleQuote
    ]]
  ]],
  match (args) {
    let strs = args[1]
    return {
      type: 'Literal',
      raw: args[0].raw + strs.map(str => str.raw).join('') + args[2].raw,
      value: strs.map(str => str.value == null ? str.raw : str.value).join('')
    }
  }
})

/**
 * 匹配普通字面量，数字、字符串、布尔值、null
 *
 * @type {Rule}
 */
export const $literal = lex.set({
  type: 'Literal',
  rule: [or, [
    $string,
    $number,
    $boolean,
    $null
  ]]
})

/**
 * 匹配圆括号表达式 (1 + 1)
 *
 * @type {Rule}
 */
export const $grouping = lex.set({
  type: 'Grouping',
  rule: () => [
    $leftParen,
    _,
    $conditional,
    _,
    $rightParen
  ],
  match (args) {
    return args[2]
  }
})

/**
 * 匹配标识符
 * 如 abc.def 中的 abc、def
 *
 * @type {Rule}
 */
export const $identifier = lex.set({
  type: 'Identifier',
  rule: [or, [
    // 形如 trueOrFalse 之类的 identifier
    [seq, [
      $reservedToken,
      [regexp, /^[0-9a-z_$]+/i]
    ]],
    // 形如 abcdefg 之类的 identifier
    [seq, [
      [not, $reservedToken],
      [regexp, /^[a-z$_][0-9a-z_$]*/i]
    ]]
  ]],
  match (args) {
    return {
      name: ((args[0] && args[0].raw) || '') + args[1].raw
    }
  }
})

/**
 * 匹配变量
 * 如 abc.def 中的 abc
 *
 * @type {Rule}
 */
export const $variable = lex.set({
  type: 'Variable',
  rule: $identifier,
  match (args) {
    return {
      name: args.name
    }
  }
})

/**
 * 匹配计算属性，
 * 如 abc[1 + 'a'] 种的 [1 + 'a']
 *
 * @type {Rule}
 */
export const $computedProperty = lex.set({
  type: 'ComputedProperty',
  rule: () => [
    $leftBracket,
    _,
    $conditional,
    _,
    $rightBracket
  ],
  match (args) {
    return {
      type: 'Member',
      computed: true,
      property: args[2]
    }
  }
})

/**
 * 匹配 ObjectLiteral 的属性，支持普通属性和计算属性
 * 如:
 *  a: 1
 *  a: 1 + 1
 *  [1 + 'a']: 2
 *
 * @type {Rule}
 */
export const $property = lex.set({
  type: 'Property',
  rule: () => [
    [or, [
      $computedProperty,
      $identifier,
      $string,
      $number
    ]],
    _,
    $colon,
    _,
    $conditional
  ],
  match (args) {
    let key = args[0]
    let result = {
      value: args[4]
    }

    if (key.computed) {
      result.computed = true
      result.key = key.property
    } else {
      result.key = key
    }

    return result
  }
})

/**
 * 匹配字面量 Object 对象，支持普通属性和计算属性
 * 如：
 * { a: 1, b: 1 + 1, [1 + 'a']: 'abc' }
 *
 * @type {Rule}
 */
export const $object = lex.set({
  type: 'ObjectLiteral',
  rule: [
    $leftBrace,
    [any, [
      _,
      $property,
      _,
      $comma
    ]],
    _,
    [opt,
      $property
    ],
    _,
    $rightBrace
  ],
  match (args) {
    let props = args[1].map(arg => arg[1])
    if (args[3]) {
      props.push(args[3])
    }
    return {
      properties: props
    }
  }
})

/**
 * 匹配字面量 Array 对象
 *
 * @type {Rule}
 */
export const $array = lex.set({
  type: 'ArrayLiteral',
  rule: () => [
    $leftBracket,
    [any, [
      _,
      [opt, $conditional],
      _,
      $comma
    ]],
    _,
    [opt, $conditional],
    _,
    $rightBracket
  ],
  match (args) {
    let elements = args[1].map(arg => arg[1])
    if (args[3]) {
      elements.push(args[3])
    }
    return {
      elements
    }
  }
})

/**
 * 匹配基本类型，包括变量、字面量、括号表达式
 *
 * @type {Rule}
 */
export const $primary = lex.set({
  type: 'Primary',
  rule: [or, [
    $variable,
    // $identifier,
    $literal,
    $array,
    $object,
    $grouping
  ]]
})

/**
 * 匹配 MemberExpression 的普通属性
 * 如: abc.cde 中的 .cde
 *
 * @type {Rule}
 */
export const $identifierProperty = lex.set({
  type: 'IdentifierProperty',
  rule: [
    $dot,
    _,
    $identifier
  ],
  match (args) {
    return {
      type: 'Member',
      computed: false,
      property: args[2]
    }
  }
})

/**
 * 匹配属性访问表达式，支持普通属性和计算属性
 * 如：abc[1 + 'a'].cdf
 *
 * @type {Rule}
 */
export const $member = lex.set({
  type: 'Member',
  rule: [
    // 1.a {a: 1}.a 都是不合法的表达式
    [or, [
      $variable,
      $string,
      $array,
      $grouping
    ]],
    // $primary,
    [some, [
      _,
      [or, [
        $computedProperty,
        $identifierProperty
      ]]
    ]]
  ],
  match (args) {
    let head = args[0]
    return args[1].reduce((result, arg) => {
      return {
        type: 'Member',
        object: result,
        property: arg[1].property,
        computed: arg[1].computed
      }
    }, head)
  },
  fallback: $primary
})

/**
 * 匹配方法变量
 * 如：(a, b, c) => {} 中的 (a, b, c) 部分
 *
 * @type {Rule}
 */
export const $params = lex.set({
  type: 'Params',
  rule: [or, [
    [seq, [
      $leftParen,
      [any, [
        _,
        $identifier,
        _,
        $comma
      ]],
      _,
      [opt,
        $identifier
      ],
      _,
      $rightParen
    ]],
    // 当只存在一个参数时，支持去掉圆括号：a => a + 1
    $identifier
  ]],
  match (args) {
    if (args.type === 'Identifier') {
      return {
        params: [args]
      }
    }
    let heads = args[1]
    let tail = args[3]
    let results = heads.map(args => args[1])
    if (tail) {
      results.push(tail)
    }
    return {
      params: results
    }
  }
})

/**
 * 匹配单行箭头函数
 *
 * @type {Rule}
 */
export const $arrowFunction = lex.set({
  type: 'ArrowFunction',
  rule: () => [
    $params,
    _,
    [text, '=>'],
    _,
    // 不支持 () => { return true } 之类的表达式
    // 仅支持 () => true
    [not, [text, '{']],
    $conditional
  ],
  match (args) {
    return {
      params: args[0].params,
      body: args[5]
    }
  }
})

/**
 * 匹配 CallExpression 中的参数，支持三元运算符（及其降级运算）和箭头函数
 *
 * @type {Rule}
 */
export const $arguments = lex.set({
  type: 'Arguments',
  rule: () => [
    $leftParen,
    [any, [
      _,
      [or, [
        $arrowFunction,
        $conditional
      ]],
      _,
      $comma
    ]],
    _,
    [opt,
      [or, [
        $arrowFunction,
        $conditional
      ]]
    ],
    _,
    $rightParen
  ],
  match (args) {
    let heads = args[1]
    let tail = args[3]

    let results = heads.map(arg => arg[1])
    if (results.length > 0 || tail) {
      results.push(tail)
    }
    return {
      type: 'Call',
      arguments: results
    }
  }
})

/**
 * 匹配函数执行表达式
 * 如：' abc '.trim().split('').join(',')
 *
 * @type {Rule}
 */
export const $call = lex.set({
  type: 'Call',
  rule: [
    $member,
    _,
    $arguments,
    [any, [
      _,
      [or, [
        $arguments,
        $computedProperty,
        $identifierProperty
      ]]
    ]]
  ],
  match (args) {
    let head = {
      type: 'Call',
      callee: args[0],
      arguments: args[2].arguments
    }
    return args[3].reduce((result, tail) => {
      let element = tail[1]
      if (element.type === 'Member') {
        element.object = result
      } else {
        element.callee = result
      }
      return element
    }, head)
  },
  fallback: $member
})

/**
 * 匹配单元运运算
 *
 * @type {Rule}
 */
export const $unary = lex.set({
  type: 'Unary',
  rule: [
    [regexp, /^[+\-!~]/],
    _,
    $call
  ],
  match (args) {
    return {
      operator: args[0].raw,
      argument: args[2]
    }
  },
  fallback: $call
})

/**
 * 匹配乘性运算
 *
 * @type {Rule}
 */
export const $multiplicative = lex.set({
  type: 'Multiplicative',
  rule: [
    $unary,
    [some, [
      _,
      [or, [
        [text, '*'],
        [text, '/'],
        [text, '%']
      ]],
      _,
      $unary
    ]]
  ],
  match: buildBinaryAst,
  fallback: $unary
})

/**
 * 匹配加性运算
 *
 * @type {Rule}
 */
export const $additive = lex.set({
  type: 'Additive',
  rule: [
    $multiplicative,
    [some, [
      _,
      [or, [
        [text, '+'],
        [text, '-']
      ]],
      _,
      $multiplicative
    ]]
  ],
  match: buildBinaryAst,
  fallback: $multiplicative
})

/**
 * 匹配大于小于运算
 *
 * @type {Rule}
 */
export const $relational = lex.set({
  type: 'Relational',
  rule: [
    $additive,
    [some, [
      _,
      [or, [
        [text, '<='],
        [text, '<'],
        [text, '>='],
        [text, '>']
      ]],
      _,
      $additive
    ]]
  ],
  match: buildBinaryAst,
  fallback: $additive
})

/**
 * 匹配等于运算
 *
 * @type {Rule}
 */
export const $equality = lex.set({
  type: 'Equality',
  rule: [
    $relational,
    [some, [
      _,
      [or, [
        [text, '==='],
        [text, '=='],
        [text, '!=='],
        [text, '!=']
      ]],
      _,
      $relational
    ]]
  ],
  match: buildBinaryAst,
  fallback: $relational
})

/**
 * 匹配 && 运算
 *
 * @type {Rule}
 */
export const $logicalAnd = lex.set({
  type: 'LogicalAnd',
  rule: [
    $equality,
    [some, [
      _,
      [text, '&&'],
      _,
      $equality
    ]]
  ],
  match: buildBinaryAst,
  fallback: $equality
})

/**
 * 匹配 || 运算
 *
 * @type {Rule}
 */
export const $logicalOr = lex.set({
  type: 'LogicalOr',
  rule: [
    $logicalAnd,
    [some, [
      _,
      [text, '||'],
      _,
      $logicalAnd
    ]]
  ],
  match: buildBinaryAst,
  fallback: $logicalAnd
})

/**
 * 定义二元运算，按优先级从逻辑或运算开始匹配
 *
 * @type {Rule}
 */
export const $binary = lex.set({
  type: 'Binary',
  rule: $logicalOr
})

/**
 * 匹配三元运算符，匹配失败则降级到二元运算
 *
 * @type {Rule}
 */
export const $conditional = lex.set({
  type: 'Conditional',
  rule: () => [
    $binary,
    _,
    $question,
    _,
    $conditional,
    _,
    $colon,
    _,
    $conditional
  ],
  match (args) {
    return {
      test: args[0],
      consequent: args[4],
      alternate: args[8]
    }
  },
  fallback: $binary
})
