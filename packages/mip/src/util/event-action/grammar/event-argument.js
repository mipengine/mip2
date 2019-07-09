/**
 * @file argument.js
 * @author clark-t (clarktanglei@163.com)
 */

import lex from './lexer'

const _ = lex.regexp('^\\s*')

lex.set({
  type: 'MIPActionArguments',
  rule: lex.seq([
    _,
    lex.optional(
      lex.or([
        lex.use('MIPOldActionArguments'),
        lex.use('MIPNewActionArguments')
      ])
    ),
    _
  ]),
  onMatch (__, args) {
    return {
      arguments: args && args.arguments || []
    }
  }
})

lex.set({
  type: 'MIPOldActionArguments',
  rule: lex.seq([
    lex.use('MIPValue'),
    lex.any([
      _,
      lex.text(','),
      _,
      lex.use('MIPValue')
    ]),
    _,
    lex.optional(
      lex.text(',')
    )
  ]),
  onMatch (head, middles, __, comma) {
    let args = [
      head,
      ...middles.map(([__, comma, ___, expression]) => expression)
    ]

    if (comma) {
      args.push(undefined)
    }

    return {
      arguments: args
    }
  }
})

// 新版语法与 AMP 靠齐 (a=1, b=2, c=3) 之类
// @TODO 支持 unpair string
lex.set({
  type: 'MIPNewActionArguments',
  rule: lex.seq([
    lex.use('MIPActionAssignmentExpression'),
    lex.any([
      _,
      lex.text(','),
      _,
      lex.use('MIPActionAssignmentExpression'),
    ]),
    _,
    lex.optional(
      lex.text(',')
    ),
  ]),
  onMatch (head, middles, __, comma) {
     let args = [
      head,
      ...middles.map(([__, comma, ___, expression]) => expression)
    ]

    if (comma) {
      args.push(undefined)
    }

    return {
      arguments: [
        {
          type: 'ObjectExpression',
          properties: args
        }
      ]
    }
  }
})

lex.set({
  type: 'MIPActionAssignmentExpression',
  rule: lex.seq([
    lex.use('Identifier'),
    _,
    lex.text('='),
    _,
    lex.use('MIPValue')
  ]),
  onMatch (key, __, equal, ___, value) {
    return {
      type: 'Property',
      key,
      value,
      computed: false
    }
  }
})

lex.set({
  type: 'MIPValue',
  rule: lex.or([
    lex.use('MIPEvent'),
    lex.use('MIPDOM'),
    lex.use('Literal'),
    // 负数
    lex.use('NegativeNumber')
  ])
})

lex.set({
  type: 'NegativeNumber',
  rule: lex.seq([
    lex.text('-'),
    _,
    lex.use('Number')
  ]),
  onMatch (minus, __, number) {
    return {
      type: 'Literal',
      value: -number.value,
      raw: '-' + number.raw
    }
  }
})

export default lex

