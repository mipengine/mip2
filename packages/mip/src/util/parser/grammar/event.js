/**
 * @file action grammar
 * @author clark-t (clarktanglei@163.com)
 */

import lex from './state'

const _ = lex.regexp('^\\s*')

lex.set({
  type: 'MIPOldEventHandlers',
  rule: lex.seq([
    _,
    lex.use('MIPOldEventHandler'),
    lex.zeroOrMore([
      _,
      lex.use('MIPOldEventHandler')
    ])
  ]),
  onMatch (__, head, tails) {
    let handlers = [head]

    if (tails) {
      for (let args of tails) {
        handlers.push(args[1])
      }
    }

    return {
      handlers
    }
  }
})

lex.set({
  type: 'MIPOldEventHandler',
  rule: lex.seq([
    lex.regexp('^[a-zA-Z][\\w$_]*'),
    lex.text(':'),
    lex.use('MIPAction')
  ]),
  onMatch (event, colon, action) {
    return {
      event,
      action
    }
  }
})

lex.set({
  type: 'MIPEventHandlers',
  rule: lex.seq([
    _,
    lex.use('MIPEventHandler'),
    lex.zeroOrMore([
      lex.text(';'),
      _,
      lex.use('MIPEventHandler')
    ]),
    lex.zeroOrOne(
      lex.text(';')
    ),
    _
  ]),
  onMatch (__, handler, tails) {
    let handlers = [header]
    for (let args of tails) {
      handlers.push(args[2])
    }
    return {
      handlers
    }
  }
})

lex.set({
  type: 'MIPEventHandler',
  rule: lex.seq([
    lex.regexp('^[a-zA-Z][\\w$_]*'),
    lex.text(':'),
    lex.use('MIPActions')
  ]),
  onMatch(event, colon, actions) {
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
      lex.text(','),
      lex.use('MIPAction')
    ])
  ]),
  onMatch (head, tails) {
    let results = [head]
    for (let tail of tails) {
      results.push(tail[1])
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
      callee: {
        name: 'setData'
      },
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
  onMatch (mip, dot, callee, args) {
    return {
      object: {
        name: mip.raw
      },
      callee,
      arguments: args || []
    }
  }
})

lex.set({
  type: 'MIPComponentAction',
  rule: lex.seq([
    lex.use('MIPElementIdentifier'),
    lex.text('.'),
    lex.use('Identifier'),
    lex.zeroOrOne(
      lex.use('MIPActionArguments')
    )
  ]),
  onMatch (id, dot, callee, args) {
    return {
      object: id,
      callee,
      arguments: args && args.arguments || []
    }
  }
})

lex.set({
  type: 'MIPActionArguments',
  rule: lex.seq([
    lex.text('('),
    _,
    lex.or([
      lex.use('MIPOldActionArguments'),
      lex.use('MIPNewActionArguments')
    ]),
    _,
    lex.text(')')
  ]),
  onMatch (leftBracket, __, args) {
    return {
      arguments: args
    }
  }
})

lex.set({
  type: 'MIPOldActionArguments',
  rule: lex.seq([
    lex.zeroOrMore([
      _,
      lex.use('MIPValue'),
      _,
      lex.text(',')
    ]),
    lex.zeroOrOne(
      lex.use('MIPValue')
    )
  ]),
  onMatch (heads, __, tail) {
    let args = heads.map(([__, expression]) => expression)
    if (args.length > 0 || tail) {
      args.push(tail)
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
    lex.zeroOrMore([
      _,
      lex.use('MIPActionAssignmentExpression'),
      _,
      lex.text(',')
    ]),
    _,
    lex.zeroOrOne(
      lex.use('MIPActionAssignmentExpression')
    ),
  ]),
  onMatch (heads, __, tail) {
    let args = heads.map(([__, expression]) => expression)
    if (args.length > 0 || tail) {
      args.push(tail)
    }
    return {
      // 这里得留意一下
      arguments: args
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
    // lex.or([
    //   lex.use('MIPStateExpression'),
    //   lex.use('Literal')
    // ])
  ]),
  onMatch (key, __, equal, ___, value) {
    return {
      key,
      value
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

lex.set({
  type: 'MIPElementIdentifier',
  rule: lex.regexp('^[a-zA-Z][\\w-]*'),
  onMatch (match) {
    return {
      name: match.raw
    }
  }
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
      lex.text('.'),
      // 这里要讨论一下，是否需要支持 event.a.b.c 的这种深嵌套数据
      // 或者是 event['a']['b'] 这种计算类型的写法
      // lex.regexp('^[a-zA-Z$][\\W$]*')
      lex.use('Identifier')

    ])
  ]),
  onMatch (event, tails) {
    return tails.reduce((result, args) => {
      return {
        type: 'MIPEvent',
        object: result,
        property: args[1],
        computed: false
      }
    }, {
      name: event.raw,
      type: 'Identifier'
    })
  }
})

export default lex

