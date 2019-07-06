/**
 * @file state-grammar.js
 * @author clark-t (clarktanglei@163.com)
 * @description
 *   Inspired By the listing URLs
 *    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
 *    https://github.com/pegjs/pegjs/blob/master/examples/javascript.pegjs
 */

import lex from './lexer'

function buildBinaryAst (head, tails) {
  return tails.reduce((result, args) => {
    return {
      type: 'BinaryExpression',
      operator: args[1].raw,
      left: result,
      right: args[3]
    }
  }, head)
}

// whitespace
const _ = lex.regexp('^\\s*')

lex.set({
  type: 'ConditionalExpression',
  rule: lex.seq([
    lex.use('BinaryExpression'),
    lex.optional([
      _,
      lex.text('?'),
      _,
      lex.use('ConditionalExpression'),
      _,
      lex.text(':'),
      _,
      lex.use('ConditionalExpression')
    ])
  ]),
  onMatch (test, tails) {
    if (!tails) {
      return test
    }

    let [__, question, ___, consequent, ____, colon, _____, alternate] = tails

    return {
      test,
      consequent,
      alternate
    }
  }
})

lex.set({
  type: 'BinaryExpression',
  rule: lex.or([
    lex.use('LogicalOrExpression'),
    lex.use('LogicalAndExpression'),
    lex.use('EqualityExpression'),
    lex.use('RelationalExpression'),
    lex.use('AdditiveExpression'),
    lex.use('MultiplicativeExpression')
  ]),
  fallback: lex.use('UnaryExpression')
})

lex.set({
  type: 'LogicalOrExpression',
  rule: lex.seq([
    lex.use('LogicalAndExpression'),
    lex.any([
      _,
      lex.text('||'),
      _,
      lex.use('LogicalAndExpression')
    ])
  ]),
  onMatch (head, tails) {
    return buildBinaryAst(head, tails)
  }
})

lex.set({
  type: 'LogicalAndExpression',
  rule: lex.seq([
    lex.use('EqualityExpression'),
    lex.any([
      _,
      lex.text('&&'),
      _,
      lex.use('EqualityExpression')
    ])
  ]),
  onMatch (head, tails) {
    return buildBinaryAst(head, tails)
  }
})

lex.set({
  type: 'EqualityExpression',
  rule: lex.seq([
    lex.use('RelationalExpression'),
    lex.any([
      _,
      lex.or([
        lex.text('==='),
        lex.text('=='),
        lex.text('!=='),
        lex.text('!=')
      ]),
      _,
      lex.use('RelationalExpression')
    ])
  ]),
  onMatch (head, tails) {
    return buildBinaryAst(head, tails)
  }
})

lex.set({
  type: 'RelationalExpression',
  rule: lex.seq([
    lex.use('AdditiveExpression'),
    lex.any([
      _,
      lex.or([
        lex.text('<='),
        lex.text('<'),
        lex.text('>='),
        lex.text('>')
      ]),
      _,
      lex.use('AdditiveExpression')
    ])
  ]),
  onMatch (head, tails) {
    return buildBinaryAst(head, tails)
  }
})

lex.set({
  type: 'AdditiveExpression',
  rule: lex.seq([
    lex.use('MultiplicativeExpression'),
    lex.any([
      _,
      lex.or([
        lex.text('+'),
        lex.text('-')
      ]),
      _,
      lex.use('MultiplicativeExpression')
    ])
  ]),
  onMatch (head, tails) {
    return buildBinaryAst(head, tails)
  }
})

lex.set({
  type: 'MultiplicativeExpression',
  rule: lex.seq([
    lex.use('UnaryExpression'),
    lex.any([
      _,
      lex.or([
        lex.text('*'),
        lex.text('/'),
        lex.text('%')
      ]),
      _,
      lex.use('UnaryExpression')
    ])
  ]),
  onMatch (head, tails) {
    return buildBinaryAst(head, tails)
  }
})

lex.set({
  type: 'UnaryExpression',
  rule: lex.seq([
    lex.regexp('^[+\\-!~]?'),
    _,
    lex.or([
      lex.use('CallExpression'),
      lex.use('GroupingExpression'),
      lex.use('PrimaryExpression')
    ])
  ]),
  onMatch (operator, __, argument) {
    if (!operator.raw) {
      return argument
    }

    return {
      operator: operator.raw,
      argument
    }
  }
 })

lex.set({
  type: 'GroupingExpression',
  rule: lex.seq([
    lex.text('('),
    _,
    lex.use('ConditionalExpression'),
    _,
    lex.text(')')
  ]),
  onMatch (leftBracket, __, expression) {
    return expression
  },
  fallback: lex.use('Literal')
})

lex.set({
  type: 'ArrayExpression',
  rule: lex.seq([
    lex.text('['),
    lex.any([
      _,
      lex.optional(
        lex.use('ConditionalExpression'),
      ),
      _,
      lex.text(',')
    ]),
    _,
    lex.optional(
      lex.use('ConditionalExpression')
    ),
    _,
    lex.text(']')
  ]),
  onMatch (leftBracket, heads, __, tail) {
    return {
      elements: heads.map(arg => arg[1]).concat(tail)
    }
  }
})

lex.set({
  type: 'ObjectExpression',
  rule: lex.seq([
    lex.text('{'),
    lex.any([
      _,
      lex.use('Property'),
      _,
      lex.text(',')
    ]),
    _,
    lex.optional(
      lex.use('Property')
    ),
    _,
    lex.text('}')
  ]),
  onMatch (leftBracket, heads, __, tail) {
    let props = heads.map(arg => arg[1])
    if (tail) {
      props.push(tail)
    }
    return {
      properties: props
    }
  }
})

lex.set({
  type: 'Property',
  rule: lex.seq([
    lex.or([
      lex.use('String'),
      lex.use('Identifier')
    ]),
    _,
    lex.text(':'),
    _,
    lex.use('ConditionalExpression')
  ]),
  onMatch (key, __, colon, ___, value) {
    return {
      key,
      value
    }
  }
})

lex.set({
  type: 'Identifier',
  rule: lex.regexp('^[a-z$_][a-z$_0-9]*', 'i'),
  onMatch (match) {
    return {
      name: match.raw,
      range: match.range
    }
  }
})

lex.set({
  type: 'HTMLElementIdentifier',
  rule: lex.regexp('^[a-zA-Z][\\w-]*'),
  // rule: lex.regexp('^[^!:;,(). ]+'),
  onMatch (match) {
    return {
      type: 'Identifier',
      name: match.raw
    }
  }
})

lex.set({
  type: 'MemberExpression',
  rule: lex.seq([
    lex.or([
      lex.use('Identifier'),
      lex.use('HTMLElementIdentifier'),
      lex.use('ArrayExpression'),
      lex.use('String'),
      lex.use('GroupingExpression')
    ]),
    lex.any([
      _,
      lex.or([
        lex.use('ComputedProperty'),
        lex.use('IdentifierProperty')
      ])
    ])
  ]),
  onMatch (head, tails) {
    // 标记这个 Identifier 是根对象
    if (head.type === 'Identifier') {
      head.role = 'root'
    }

    let results = tails.reduce((result, args) => {
      return {
        type: 'MemberExpression',
        object: result,
        property: args[1].property,
        computed: args[1].computed
      }
    }, head)
    return results
  }
})

lex.set({
  type: 'ComputedProperty',
  rule: lex.seq([
    lex.text('['),
    _,
    lex.use('ConditionalExpression'),
    _,
    lex.text(']')
  ]),
  onMatch (leftBracket, __, property) {
    return {
      type: 'MemberExpression',
      computed: true,
      property
    }
  }
})

lex.set({
  type: 'IdentifierProperty',
  rule: lex.seq([
    lex.text('.'),
    _,
    lex.use('Identifier')
  ]),
  onMatch (dot, __, identifier) {
    return {
      type: 'MemberExpression',
      computed: false,
      property: identifier
    }
  }
})

lex.set({
  type: 'CallExpression',
  rule: lex.seq([
    lex.use('MemberExpression'),
    _,
    lex.use('Arguments'),
    lex.any([
      _,
      lex.or([
        lex.use('Arguments'),
        lex.use('ComputedProperty'),
        lex.use('IdentifierProperty')
      ])
    ])
  ]),
  onMatch (callee, __, args, tails) {
    let head = {
      type: 'CallExpression',
      callee: callee,
      arguments: args.arguments
    }
    return tails.reduce((result, tail) => {
      let element = tail[1]
      if (element.type === 'MemberExpression') {
        element.object = result
      } else {
        element.callee = result
      }
      return element
    }, head)
  },
  fallback: lex.use('MemberExpression')
})

lex.set({
  type: 'Arguments',
  rule: lex.seq([
    lex.text('('),
    lex.any([
      _,
      lex.or([
        lex.use('ArrowFunctionExpression'),
        lex.use('ConditionalExpression')
      ]),
      _,
      lex.text(',')
    ]),
    _,
    lex.optional(
      lex.or([
        lex.use('ArrowFunctionExpression'),
        lex.use('ConditionalExpression')
      ])
    ),
    _,
    lex.text(')')
  ]),
  onMatch (leftBracket, heads, __, tail) {
    let args = heads.map(([_, expression, __]) => expression)
    if (args.length > 0 || tail) {
      args.push(tail)
    }
    return {
      type: 'CallExpression',
      arguments: args
    }
  }
})

lex.set({
  type: 'ArrowFunctionExpression',
  rule: lex.seq([
    lex.use('Params'),
    _,
    lex.text('=>'),
    _,
    lex.or([
      lex.text('{'),
      lex.use('ConditionalExpression')
    ])
  ]),
  onMatch (params, __, arrow, ___, body) {
    // 不支持 BlockStatement
    if (body.raw === '{') {
      return false
    }
    return {
      params: params.params,
      body
    }
  }
})

lex.set({
  type: 'Params',
  rule: lex.or([
    lex.seq([
      lex.text('('),
      lex.any([
        _,
        lex.use('Identifier'),
        _,
        lex.text(',')
      ]),
      _,
      lex.optional(
        lex.use('Identifier')
      ),
      _,
      lex.text(')')
    ]),
    lex.use('Identifier')
  ]),
  onMatch (...args) {
    if (args[0].type === 'Identifier') {
      return {
        params: [args[0]]
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

lex.set({
  type: 'PrimaryExpression',
  rule: lex.or([
    lex.use('Identifier'),
    lex.use('Literal'),
    lex.use('ArrayExpression'),
    lex.use('ObjectExpression')
  ])
})

lex.set({
  type: 'Literal',
  rule: lex.or([
    lex.use('String'),
    lex.use('Number'),
    lex.use('Boolean'),
    lex.use('Null'),
    lex.use('Undefined'),
    // lex.use('NaN'),
    // lex.use('Infinity')
  ])
  // ,
  // onMatch (match) {
  //   match.type = 'Literal'
  //   return match
  // }
})

lex.set({
  type: 'String',
  rule: lex.or([
    lex.seq([
      lex.text('\''),
      lex.any(
        lex.or([
          lex.use('Escape'),
          lex.regexp('^[^\']')
        ])
      ),
      lex.text('\'')
    ]),
    lex.seq([
      lex.text('"'),
      lex.any(
        lex.or([
          lex.use('Escape'),
          lex.regexp('^[^"]')
        ])
      ),
      lex.text('"')
    ])
  ]),
  onMatch (leftComma, contents, rightComma) {
    return {
      type: 'Literal',
      raw: leftComma.raw + contents.map(content => content.raw).join('') + rightComma.raw,
      value: contents.map(content => content.value == null ? content.raw : content.value).join('')
    }
  }
})

lex.set({
  type: 'Escape',
  rule: lex.seq([
    lex.text('\\'),
    lex.regexp('^["\'\\/bfnrt]')
  ]),
  onMatch (escape, character) {
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

lex.set({
  type: 'Number',
  rule: lex.regexp(/^(0|[1-9]\d*)(\.\d+)?(e[+-]?\d+)?/i),
  onMatch (match) {
    match.value = +match.raw
    match.type = 'Literal'
    return match
  }
})

lex.set({
  type: 'Boolean',
  rule: lex.or([
    lex.text('true'),
    lex.text('false')
  ]),
  onMatch (match) {
    match.value = match.raw === 'true'
    match.type = 'Literal'
    return match
  }
})

lex.set({
  type: 'Null',
  rule: lex.text('null'),
  onMatch (match) {
    match.value = null
    match.type = 'Literal'
    return match
  }
})

lex.set({
  type: 'Undefined',
  rule: lex.text('undefined'),
  onMatch (match) {
    match.value = undefined
    match.type = 'Literal'
    return match
  }
})

// lex.set({
//   type: 'NaN',
//   rule: lex.text('NaN'),
//   onMatch (match) {
//     match.value = NaN
//     match.type = 'Literal'
//     return match
//   }
// })

// lex.set({
//   type: 'Infinity',
//   rule: lex.text('Infinity'),
//   onMatch (match) {
//     match.value = Infinity
//     match.type = 'Literal'
//     return match
//   }
// })

export default lex



