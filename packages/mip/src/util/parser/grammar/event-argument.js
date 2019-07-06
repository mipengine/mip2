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
// lex.set({
//   type: 'MIPComponentArgumentText',
//   rule: lex.seq([
//     lex.text('('),
//     lex.use('MIPComponentActionArgumentContent'),
//     lex.text(')')
//   ])
// })

// lex.set({
//   type: 'MIPComponentArgumentsText',
//   rule: lex.seq([
//     lex.some([
//       lex.optional(
//         lex.use('MIPComponentArgumentText')
//       ),
//       lex.text(',')
//     ]),
//     lex.optional(
//       lex.use('MIPComponentArgumentText')
//     )
//   ]),
//   onMatch (heads, tail) {
//     let args = heads.map(arg => arg[0])

//     if (tail) {
//       args.push(tail)
//     }

//     return {
//       arguments: args
//     }
//   }
// })

// lex.set({
//   type: 'MIPComponentArgumentsText',
//   rule: lex.some(
//     lex.or([
//       lex.use('MIPComponentArgumentBracketText'),
//       lex.use('String'),
//       lex.use('MIPEvent'),
//       lex.use('MIPArgumentSpecialText'),
//       lex.use('MIPArgumentAnyText')
//     ])
//   )
// })

// lex.set({
//   type: 'MIPComponentArgumentText',
//   rule: lex.or([
//     lex.use('MIPComponentArgumentBracketText'),
//     lex.use('String'),
//     lex.use('MIPArgumentSpecialText'),
//     lex.use('MIPArgumentContentText')
//   ])
// })

// lex.set({
//   type: 'MIPComponentArgumentBracketContent',
//   rule: lex.or([
//     lex.use('MIPComponentArgumentBracketText'),
//     lex.use('String'),
//     lex.use('MIPArgumentAnyText')
//   ]),
//   onMatch (match) {
//     // console.log(' --- match dao le sha ---- ')
//     // console.log(match)
//     return match
//   }
// })


// lex.set({
//   type: 'MIPComponentArgumentBracketText',
//   rule: lex.or([
//     lex.seq([
//       lex.text('('),
//       lex.any(
//         lex.use('MIPComponentArgumentBracketContent')
//       ),
//       lex.text(')')
//     ]),
//     lex.seq([
//       lex.text('['),
//       lex.any(
//         lex.use('MIPComponentArgumentBracketContent')
//       ),
//       lex.text(']')
//     ]),
//     lex.seq([
//       lex.text('{'),
//       lex.any(
//         lex.use('MIPComponentArgumentBracketContent')
//       ),
//       lex.text('}')
//     ])
//   ]),
//   onMatch (left, contents, right) {
//     // console.log('-- wozaizheliya --')
//     return {
//       left: left,
//       right: right,
//       contents: contents
//     }
//   }
// })

// lex.set({
//   type: 'MIPComponentArgumentBraceText',
//   rule: lex.seq([
//     lex.text('{'),
//     lex.any([
//       lex.use('MIPComponentArgumentBraceText'),
//       lex.use('String'),
//       lex.regexp('^[^{}]+')
//     ]),
//     lex.text('}')
//   ])
// })

// lex.set({
//   type: 'MIPComponentArgumentParenthesesText',
//   rule: lex.seq([
//     lex.text('['),
//     lex.any([
//       lex.use('MIPComponentArgumentParenthesesText'),
//       lex.use('String'),
//       lex.regexp('^[^\\[\\]]+')
//     ]),
//     lex.text(']')
//   ])
// })

// lex.set({
//   type: 'MIPComponentArgumentBraceText',
//   rule: lex.seq([
//     lex.text('{'),
//     lex.any([
//       lex.use('MIPComponentArgumentBraceText'),
//       lex.use('String'),
//       lex.regexp('^[^{}]+')
//     ]),
//     lex.text('}')
//   ])
// })

// lex.set({
//   type: 'MIPArgumentSpecialText',
//   rule: lex.regexp('^[^(){}\\[\\]\'"]*?[^(){}\\[\\]\'"\\w]')
// })

// lex.set({
//   type: 'MIPArgumentAnyText',
//   rule: lex.regexp('^[^(){}\\[\\]\'"]+')
// })

// lex.set({
//   type: 'MIPArgumentContentText',
//   rule: lex.regexp('^[^(){}\\[\\]\'",]+')
// })

export default lex

