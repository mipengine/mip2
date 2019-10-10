/**
 * @file handler grammar
 * @author clark-t (clarktanglei@163.com)
 * @description 只负责将 on 句柄解析出事件、作用对象、作用方法和参数字符串
 *              如 tap:bottom-bar.scrollTo({ duration: 200, position: 'center' }) 解析出
 *              tap - 事件，
 *              bottom-bar - 作用对象，
 *              scrollTo - 作用方法，
 *              { duration: 200, position: 'center' } - 参数字符串
 */

import {
  text,
  regexp,
  or,
  any,
  some,
  opt
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

/**
 * 匹配参数中带圆括号的内容
 * 如：tap:abc.doSomething('abc(subcontent)def') 中的 (subcontent) 部分
 *
 * @type {Rule}
 */
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

/**
 * 匹配参数内容
 * 如：tap:abc.doSomething(a='abc(subcontent)def', b=1234) 中的 a='abc(subcontent)def', b=1234 部分
 *
 * @type {Rule}
 */
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

/**
 * 匹配参数字符串
 * 如：tap:abc.doSomething(a='abc(subcontent)def', b=1234) 中的 (a='abc(subcontent)def', b=1234) 部分
 *
 * @type {Rule}
 */
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

/**
 * 匹配满足 HTML ID 选择器规则的部分
 *
 * @type {Rule}
 */
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

/**
 * 匹配 MIP 行为表达式
 * 如 tap:abc.doSomething(a='bcdef') 中的 abc.doSomething(a='bcdef') 部分
 *
 * @type {Rule}
 */
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

/**
 * 匹配 MIP 多行为表达式
 * 如 tap:a.do1(),b.do2(a=123),c.do3() 中的 a.do1(),b.do2(a=123),c.do3() 部分
 *
 * @type {Rule}
 */
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

/**
 * 匹配单事件监听的 MIP 表达式
 * 如tap:a.do1(),b.do2()
 *
 * @type {Rule}
 */
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

/**
 * 匹配多事件监听的 MIP 表达式，形式与 AMP 表达式一致
 * 如 tap:a.do1(),b.do2(); change:c.do2(),d.do3()
 *
 * @type {Rule}
 */
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

/**
 * 匹配旧版的 MIP 多事件监听表达式
 * 如 tap:a.do1() tap:b.do2() change:c.do2() change:c.do3()
 *
 * @type {Rule}
 */
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

/**
 * 统一的 MIP 表达式匹配入口
 *
 * @type {Rule}
 */
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

