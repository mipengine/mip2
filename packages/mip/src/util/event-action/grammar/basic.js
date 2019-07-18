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
  not,
  def
} from '../../parser/lexer'

import {
  _,
  $question,
  $colon,
  $comma,
  // $semi,
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

export const $number = lex.set({
  type: 'Number',
  rule: [regexp, /^(0|[1-9]\d*)(\.\d+)?(e[+-]?\d+)?/i],
  match (match) {
    match.value = +match.raw
    match.type = 'Literal'
    return match
  }
})

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

export const $literal = lex.set({
  type: 'Literal',
  rule: [or, [
    $string,
    $number,
    $boolean,
    $null
  ]]
})

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

export const $identifier = lex.set({
  type: 'Identifier',
  rule: [
    [not, [
      $reservedToken,
      [regexp, /^[^\w$]/i]
    ]],
    [regexp, /^[a-z$_][\w$]*/i]
  ],
  match (args) {
    return {
      name: args[1].raw
    }
  }
})

export const $variable = lex.set({
  type: 'Variable',
  rule: $identifier,
  match (args) {
    return {
      name: args.name
    }
  }
})

export const $property = lex.set({
  type: 'Property',
  rule: () => [
    [or, [
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
    return {
      key: args[0],
      value: args[4]
    }
  }
})

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
    if (elements.length || args[3]) {
      elements.push(args[3])
    }
    return {
      elements
    }
  }
})

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

export const $member = lex.set({
  type: 'Member',
  rule: [
    $primary,
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
    // if (head.type === 'Identifier') {
      // head.role = 'root'
    // }
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

export const $arrowFunction = lex.set({
  type: 'ArrowFunction',
  rule: () => [
    $params,
    _,
    [text, '=>'],
    _,
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
  // match (args) {
  //   return buildBinaryAst(args)
  // },
  fallback: $logicalAnd
  // return buildBinaryAst(head, tail)
})

export const $binary = lex.set({
  type: 'Binary',
  rule: $logicalOr
})

// export const $binary = $logicalOr
// export const $binary = lex.set({
//   type: 'Binary',
//   rule: [or, [
//     $logicalOr,
//     $logicalAnd,
//     $equality,
//     $relational,
//     $additive,
//     $multiplicative
//   ]],
//   fallback: $unary
// })

export const $conditional = lex.set({
  type: 'Conditional',
  rule: () => [
    $binary,
    _,
    $question,
    _,
    $conditional,
    // $ternary,
    _,
    $colon,
    _,
    $conditional
    // $ternary
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

// export default lex



