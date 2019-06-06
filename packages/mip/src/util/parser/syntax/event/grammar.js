/**
 * @file on event action grammar
 * @author clark-t (clarktanglei@163.com)
 */

import Lexer from '../../lexer'

const lex = new Lexer()

const _ = lex.regexp('^\\s*')

lex.set({
  type: 'Actions',
  rule: lex.seq([
    _,
    lex.use('Action'),
    lex.zeroOrMore([
      _,
      lex.use('Action')
    ]),
    _
  ]),
  onMatch (__, head, tails) {
    let actions = [head]

    if (tails) {
      for (let args of tails) {
        actions.push(args[1])
      }
    }

    return {
      actions
    }
  }
})

lex.set({
  type: 'Action',
  rule: lex.seq([
    lex.regexp('^[a-zA-Z][\\w-]*'),
    lex.text(':')
    lex.regexp('^[a-zA-Z][\\w-]*')
  ])
})
