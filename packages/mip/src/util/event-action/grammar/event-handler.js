/**
 * @file handler grammar
 * @author clark-t (clarktanglei@163.com)
 * @description 只负责将 on 句柄解析出事件、作用对象、作用方法和参数字符串
 */

import lex from './lexer'

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
    lex.some([
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
    lex.some([
      _,
      lex.text(';'),
      _,
      lex.use('MIPEventHandler')
    ]),
    lex.optional([
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
      event: {
        type: 'Identifier',
        name: event.raw
      },
      actions
    }
  }
})

lex.set({
  type: 'MIPActions',
  rule: lex.seq([
    lex.use('MIPAction'),
    lex.any([
      _,
      lex.text(','),
      _,
      lex.use('MIPAction')
    ]),
    lex.optional([
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
    lex.text('MIP'),
    lex.text('.'),
    lex.text('setData'),
    lex.use('MIPArgumentText')
  ]),
  onMatch (mip, dot, property, argstring) {
    return {
      type: 'MIPAction',
      object: 'MIP',
      property: 'setData',
      role: 'MIP',
      argumentText: argstring.raw
      // arguments: [
      //   {
      //     type: 'Literal',
      //     value: argstring.raw
      //   }
      // ]
    }
  }
})

lex.set({
  type: 'MIPGlobalAction',
  rule: lex.seq([
    lex.text('MIP'),
    lex.text('.'),
    lex.use('Identifier'),
    lex.optional(
      lex.use('MIPArgumentText')
      // lex.use('MIPActionArguments')
    )
  ]),
  onMatch (mip, dot, property, argstring) {
    return {
      type: 'MIPAction',
      object: 'MIP',
      property: property.name,
      role: 'MIP',
      argumentText: argstring ? argstring.raw : null
      // arguments: argstring &&
      //   [{
      //     type: 'Literal',
      //     value: argstring.raw
      //   }] ||
      //   []
    }
  }
})

lex.set({
  type: 'MIPComponentAction',
  rule: lex.seq([
    lex.use('HTMLElementIdentifier'),
    lex.text('.'),
    lex.use('Identifier'),
    lex.optional(
      lex.use('MIPArgumentText')
      // lex.use('MIPActionArguments')
    )
  ]),
  onMatch (object, dot, property, argstring) {
    return {
      type: 'MIPAction',
      object: object.name,
      property: property.name,
      role: 'HTMLElement',
      argumentText: argstring ? argstring.raw : null
      // type: 'CallExpression',
      // callee: {
      //   type: 'MemberExpression',
      //   object: {
      //     type: object.type,
      //     name: object.name,
      //     role: 'HTMLElement'
      //   },
      //   computed: false,
      //   property: property
      // },
      // arguments: argstring &&
      //   [{
      //     type: 'Literal',
      //     value: argstring.raw
      //   }] ||
      //   []
    }
  }
})

lex.set({
  type: 'MIPArgumentText',
  rule: lex.seq([
    lex.text('('),
    lex.any(
      lex.use('MIPArgumentContent'),
    ),
    lex.text(')')
  ]),
  onMatch (left, contents, right) {
    return {
      raw: contents.map(content => content.raw).join('')
    }
  }
})

lex.set({
  type: 'MIPArgumentContent',
  rule: lex.or([
    lex.use('MIPArgumentContentWithBracket'),
    lex.use('String'),
    lex.regexp('^[^()\'"]+')
  ]),
  onMatch (content) {
    return {
      raw: content.raw
    }
  }
})

lex.set({
  type: 'MIPArgumentContentWithBracket',
  rule: lex.seq([
    lex.text('('),
    lex.any(
      lex.use('MIPArgumentContent'),
    ),
    lex.text(')')
  ]),
  onMatch (left, texts, right) {
    return {
      raw: left.raw + texts.map(t => t.raw).join('') + right.raw
    }
  }
})

export default lex

