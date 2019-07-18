/**
 * @file handler grammar
 * @author clark-t (clarktanglei@163.com)
 * @description 只负责将 on 句柄解析出事件、作用对象、作用方法和参数字符串
 */

import {
  text,
  regexp,
  or,
  any,
  some,
  opt,
  def
} from '../../parser/lexer'

import {
  _,
  __,
  $colon,
  $comma,
  $semi,
  $dot,
  $leftParen,
  $rightParen,
} from './token'

import {
  $string,
  $identifier
} from './basic'

import lex from './lexer'

export const $mipArgumentContentWithBracket = lex.set({
  type: 'MIPArgumentContentWithBracket',
  rule: () => [
    $leftParen,
    [any, $mipArgumentContent],
    $rightParen
  ],
  match (args) {
    return {
      raw: args[0].raw + args[1].map(t => t.raw).join('') + args[2].raw
    }
  }
})

export const $mipArgumentContent = lex.set({
  type: 'MIPArgumentContent',
  rule: [or, [
    $mipArgumentContentWithBracket,
    $string,
    [regexp, /^[^()'"]+/]
  ]],
  match (args) {
    return {
      raw: args.raw
    }
  }
})

export const $mipArgumentText = lex.set({
  type: 'MIPArgumentText',
  rule: [
    $leftParen,
    [any, $mipArgumentContent],
    $rightParen
  ],
  match (args) {
    return {
      raw: args[1].map(arg => arg.raw).join('')
    }
  }
})

export const $htmlIdentifier = lex.set({
  type: 'HTMLEIdentifier',
  rule: [regexp, /^[a-z][\w-]*/i],
  match (args) {
    return {
      type: 'Identifier',
      name: args.raw
    }
  }
})

export const $mipAction = lex.set({
  type: 'MIPAction',
  rule: [
    [or, [
      [text, 'MIP'],
      $htmlIdentifier,
    ]],
    $dot,
    $identifier,
    [opt, $mipArgumentText]
  ],
  match (args) {
    return {
      object: args[0].name || args[0].raw,
      property: args[2].name,
      argumentText: args[3] ? args[3].raw : null
    }
  }
})

export const $mipActions = lex.set({
  type: 'MIPActions',
  rule: [
    $mipAction,
    [any, [
      _,
      $comma,
      _,
      $mipAction
    ]],
    [opt, [
      _,
      $comma
    ]]
  ],
  match (args) {
    let results = [args[0]]
    for (let tail of args[1]) {
      results.push(tail[3])
    }
    return results
  }
})

export const $mipEventHandler = lex.set({
  type: 'MIPEventHandler',
  rule: [
    [regexp, /^[a-z][\w$-]*/i],
    _,
    $colon,
    _,
    $mipActions,
  ],
  match (args) {
    return {
      event: args[0].raw,
      actions: args[4]
    }
  }
})

export const $mipEventNewHandlers = lex.set({
  type: 'MIPEventNewHanlers',
  rule: [
    $mipEventHandler,
    [some, [
      _,
      $semi,
      _,
      $mipEventHandler
    ]],
    [opt, $semi]
  ],
  match (args) {
    let handlers = [args[0]]
    for (let tail of args[1]) {
      handlers.push(tail[3])
    }
    return {
      type: 'MIPEventHandlers',
      handlers
    }
  }
})

export const $mipEventOldHandlers = lex.set({
  type: 'MIPEventOldHandlers',
  rule: [
    $mipEventHandler,
    [some, [
      __,
      $mipEventHandler
    ]]
  ],
  match (args) {
    let handlers = [args[0]]
    for (let tail of args[1]) {
      handlers.push(tail[1])
    }
    return {
      type: 'MIPEventHandlers',
      handlers
    }
  }
})

export const $mipEventHandlers = lex.set({
  type: 'MIPEventHandlers',
  rule: [
    _,
    [or, [
      $mipEventNewHandlers,
      $mipEventOldHandlers,
      $mipEventHandler
    ]],
    _
  ],
  match (args) {
    return args[1]
  }
})

