/**
 * @file action grammar
 * @author clark-t (clarktanglei@163.com)
 */

import lex from './state'

const _ = lex.regexp('^\\s*')

lex.set({
  type: 'MIPEventHandlers',
  rule: lex.seq([
    _,
    lex.or([
      lex.use('MIPOldEventHandlers'),
      lex.use('MIPNewEventHandlers'),
      lex.use('MIPEventHandler')
    ]),
    _,
  ]),
  onMatch (__, handlers) {
    return handlers
  }
})

lex.set({
  type: 'MIPOldEventHandlers',
  rule: lex.seq([
    lex.use('MIPEventHandler'),
    lex.oneOrMore([
      _,
      lex.use('MIPEventHandler')
    ])
  ]),
  onMatch (head, tails) {
    let handlers = [head]

    if (tails) {
      for (let args of tails) {
        handlers.push(args[1])
      }
    }

    return {
      type: 'MIPEventHandlers',
      handlers
    }
  }
})

lex.set({
  type: 'MIPNewEventHandlers',
  rule: lex.seq([
    lex.use('MIPEventHandler'),
    lex.oneOrMore([
      _,
      lex.text(';'),
      _,
      lex.use('MIPEventHandler')
    ]),
    lex.zeroOrOne([
      _,
      lex.text(';')
    ])
  ]),
  onMatch (handler, tails) {
    let handlers = [handler]
    for (let args of tails) {
      handlers.push(args[3])
    }
    return {
      type: 'MIPEventHandlers',
      handlers
    }
  }
})

lex.set({
  type: 'MIPEventHandler',
  rule: lex.seq([
    lex.regexp('^[a-zA-Z][\\w$_]*'),
    _,
    lex.text(':'),
    _,
    lex.use('MIPActions')
  ]),
  onMatch(event, __, colon, ___, actions) {
    return {
      event,
      actions
    }
  }
})

lex.set({
  type: 'MIPActions',
  rule: lex.seq([
    lex.use('MIPAction'),
    lex.zeroOrMore([
      _,
      lex.text(','),
      _,
      lex.use('MIPAction')
    ]),
    lex.zeroOrOne([
      _,
      lex.text(',')
    ])
  ]),
  onMatch (head, tails) {
    let results = [head]
    for (let tail of tails) {
      results.push(tail[3])
    }
    return results
  }
})

lex.set({
  type: 'MIPAction',
  rule: lex.or([
    lex.use('MIPBindAction'),
    lex.use('MIPGlobalAction'),
    lex.use('MIPComponentAction')
  ])
})

lex.set({
  type: 'MIPBindAction',
  rule: lex.seq([
    lex.text('MIP.setData('),
    lex.use('ObjectExpression'),
    lex.text(')')
  ]),
  onMatch (prefix, data) {
    return {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: 'MIP'
        },
        property: {
          type: 'Identifier',
          name: 'setData'
        }
      },

      // callee: {
      //   name: 'setData'
      // },
      // arguments: data.arguments
      arguments: [data]
    }
  }
})

lex.set({
  type: 'MIPGlobalAction',
  rule: lex.seq([
    lex.text('MIP'),
    lex.text('.'),
    lex.use('Identifier'),
    lex.zeroOrOne(
      lex.use('MIPActionArguments')
    )
  ]),
  onMatch (mip, dot, property, args) {
    return {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: 'MIP'
        },
        property: property
      },
      // object: {
      //   name: mip.raw,
      //   type: 'Idendifier'
      // },
      // callee,
      arguments: args && args.arguments || []
    }
  }
})

lex.set({
  type: 'MIPComponentAction',
  rule: lex.seq([
    lex.use('HTMLElementIdentifier'),
    lex.text('.'),
    lex.use('Identifier'),
    lex.zeroOrOne(
      lex.use('MIPActionArguments')
    )
  ]),
  onMatch (object, dot, property, args) {
    return {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: object,
        computed: false,
        property: property
      },
      arguments: args && args.arguments || []
    }
  }
})

lex.set({
  type: 'MIPActionArguments',
  rule: lex.seq([
    lex.text('('),
    _,
    lex.zeroOrOne(
      lex.or([
        lex.use('MIPOldActionArguments'),
        lex.use('MIPNewActionArguments')
      ])
    ),
    _,
    lex.text(')')
  ]),
  onMatch (leftBracket, __, args) {
    return {
      arguments: args && args.arguments || []
    }
  }
})

lex.set({
  type: 'MIPOldActionArguments',
  rule: lex.seq([
    lex.use('MIPValue'),
    lex.zeroOrMore([
      _,
      lex.text(','),
      _,
      lex.use('MIPValue')
    ]),
    _,
    lex.zeroOrOne(
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
      // 这里得留意一下
      arguments: args
    }
  }
})

// 新版语法与 AMP 靠齐 (a=1, b=2, c=3) 之类
lex.set({
  type: 'MIPNewActionArguments',
  rule: lex.seq([
    lex.use('MIPActionAssignmentExpression'),
    lex.zeroOrMore([
      _,
      lex.text(','),
      _,
      lex.use('MIPActionAssignmentExpression'),
    ]),
    _,
    lex.zeroOrOne(
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
      // 这里得留意一下
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
    lex.text('='),
    lex.use('MIPValue')
  ]),
  onMatch (key, equal, value) {
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
    // lex.use('MIPStateExpression'),
    lex.use('Literal')
  ])
})

// 从 AMP 文档来看 在 on 表达式当中是无法使用到 state 的,
// 所以 MIP 也暂时不提供支持，只在 MIP.setData() 里面可以使用

// my-state.a.b.c

// lex.set({
//   type: 'MIPStateExpression',
//   rule: lex.seq([
//     lex.use('MIPElementIdentifier'),
//     lex.oneOrMore([
//       lex.text('.'),
//       lex.use('Identifier')
//     ])
//   ]),
//   onMatch (id, tails) {
//     let results = tails.reduce((result, args) => {
//       return {
//         type: 'MIPStateExpression',
//         object: result,
//         property: args[1],
//         computed: false
//       }
//     }, id)
//     return results
//   }
// })

lex.set({
  type: 'MIPEvent',
  rule: lex.seq([
    lex.text('event'),
    lex.oneOrMore([
      _,
      lex.text('.'),
      _,
      // 这里要讨论一下，是否需要支持 event['a']['b'] 这种计算类型的写法
      lex.use('Identifier')
    ])
  ]),
  onMatch (event, tails) {
    return tails.reduce((result, args) => {
      return {
        type: 'MemberExpression',
        object: result,
        property: args[3],
        computed: false
      }
    }, {
      name: event.raw,
      type: 'Identifier'
    })
  }
})

export default lex

