/**
 * @file action grammar
 * @author clark-t (clarktanglei@163.com)
 */

import lex from './lexer'

const _ = lex.regexp('^\\s*')

lex.set({
  type: 'MIPEventHandlers',
  rule: lex.seq([
    _,
    lex.use('MIPEventHandler'),
    lex.zeroOrMore([
      _,
      lex.use('MIPEventHandler')
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
  type: 'MIPEventHandler',
  rule: lex.seq([
    lex.regexp('^[a-zA-Z][\\w-]*'),
    lex.text(':'),
    lex.or([
      lex.use('MIPBindAction'),
      lex.use('MIPGlobalAction'),
      lex.use('MIPComponentAction')
    ])
  ])
})

lex.set({
  type: 'MIPComponentAction',
  rule: lex.seq([
    lex.regexp('^[a-zA-Z][\\w-]*'),
    lex.text('.'),
    lex.regexp('^[a-zA-Z$][\\w$]*'),
    lex.zeroOrOne(
      lex.use('MIPActionArgument')
    )
  ])
})

lex.set({
  type: 'MIPActionArguments',
  rule: lex.seq([
    lex.text('('),
    _,
    lex.use('MIPActionAssignmentExpression'),
    lex.zeroOrMore([
      _,
      lex.text(','),
      lex.use('MIPActionAssignmentExpression')
    ]),
    _,
    lex.text(')')
  ])
})

lex.set({
  type: 'MIPActionAssignmentExpression',
  rule: lex.seq([
    lex.regexp('^[a-zA-Z][\\w$]*'),
    lex.text('='),
    lex.use('Literal')
  ])
})

lex.set({
  type: 'MIPGlobalAction',
  rule: lex.seq([
    lex.text('MIP'),
    lex.text('.'),
    lex.regexp('^[a-zA-Z$][\\w$]*')
  ])
})

lex.set({
  type: 'MIPEvent'
})



