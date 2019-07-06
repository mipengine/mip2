/**
 * @file event-object.js
 * @author clark-t (clarktanglei@163.com)
 */

import lex from './lexer'

const _ = lex.regexp('^\\s*')

lex.set({
  type: 'MIPEvent',
  rule: lex.seq([
    lex.text('event'),
    lex.any([
      _,
      lex.text('.'),
      _,
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
      type: 'Identifier',
      role: 'event'
    })
  }
})

lex.set({
  type: 'MIPDOM',
  rule: lex.seq([
    lex.text('DOM'),
    lex.some([
      _,
      lex.text('.'),
      _,
      lex.use('Identifier')
    ])
  ]),
  onMatch (dom, tails) {
    return tails.reduce((result, args) => {
      return {
        type: 'MemberExpression',
        object: result,
        property: args[3],
        computed: false
      }
    }, {
      name: dom.raw,
      type: 'Identifier',
      role: 'DOM'
    })
  }
})

export default lex

