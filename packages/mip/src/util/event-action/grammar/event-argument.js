/**
 * @file argument.js
 * @author clark-t (clarktanglei@163.com)
 * @description 对 event-handler.js 解析出的参数字符串做进一步解析，
 *              支持 AMP 参数形式和 PlainObject 的参数定义形式
 */

import {
  text,
  or,
  any,
  opt
} from '../../parser/lexer'

import {
  _,
  $comma,
  $dot
} from './token'

import {
  $conditional,
  $object,
  $number,
  $literal,
  $variable,
  $identifier
} from './basic'

import {
  MIP_ACTION_ALLOWED_OBJECTS
} from '../whitelist/basic'

import lex from './lexer'

/**
 * 同步 AMP 的参数定义形式：argumentName=value
 *
 * @type {Rule}
 */
export const $mipActionAssignment = lex.set({
  type: 'MIPActionAssignment',
  rule: [
    $identifier,
    _,
    [text, '='],
    _,
    // 放开参数的单行计算支持
    $conditional
    // $mipValue
  ],
  match (args) {
    return {
      type: 'Property',
      key: args[0],
      value: args[4],
      computed: false
    }
  }
})

/**
 * 同步 AMP 的参数定义形式：(arg1=value1, arg2=value2)
 *
 * @type {Rule}
 */
export const $mipActionNewArguments = lex.set({
  type: 'MIPActionNewArguments',
  rule: [
    $mipActionAssignment,
    [any, [
      _,
      $comma,
      _,
      $mipActionAssignment
    ]],
    _,
    [opt, $comma]
  ],
  match (args) {
    let results = [args[0]].concat(args[1].map(rests => rests[3]))
    if (args[3]) {
      results.push(undefined)
    }
    return {
      arguments: [{
        type: 'ObjectLiteral',
        properties: results
      }]
    }
  }
})

/**
 * 在 MIP 参数字符串中，仅允许使用有限的特殊对象，定义在 MIP_ACTION_ALLOWED_OBJECTS
 *
 * @type {Rule}
 */
export const $mipActionAllowed = lex.set({
  type: 'MIPActionAllowed',
  rule: [
    $variable,
    // $identifier,
    [any, [
      _,
      $dot,
      _,
      $identifier
    ]]
  ],
  match (args) {
    let id = args[0]
    let name = id.name
    let allowed = MIP_ACTION_ALLOWED_OBJECTS[name]
    if (!allowed) {
      return false
    }
    let tails = args[1]
    if (!tails.length) {
      return allowed.root ? id : false
    }
    return tails.reduce((result, rests) => {
      return {
        type: 'Member',
        object: result,
        property: rests[3],
        computed: false
      }
    }, id)
  }
})

/**
 * 负数
 *
 * @type {Rule}
 */
export const $minus = lex.set({
  type: 'Minus',
  rule: [
    [text, '-'],
    _,
    $number
  ],
  match (args) {
    return {
      type: 'Literal',
      value: -args[2].value,
      raw: '-' + args[2].raw
    }
  }
})

/**
 * 旧版 MIP 参数字符串当中，仅支持字面量参数、负数、有限的 MIP 允许的特殊对象
 *
 * @type {Rule}
 */
export const $mipValue = lex.set({
  type: 'MIPValue',
  rule: [or, [
    $mipActionAllowed,
    $literal,
    $minus
  ]]
})

/**
 * 旧版 MIP 参数形式：如 ( 'abc', 456, event.a )
 * 仅做有限的兼容处理，不做后续的功能升级
 *
 * @type {Rule}
 */
export const $mipActionOldArguments = lex.set({
  type: 'MIPActionOldArguments',
  rule: [
    $mipValue,
    [any, [
      _,
      $comma,
      _,
      $mipValue
    ]],
    _,
    [opt, $comma]
  ],
  match (args) {
    let results = [args[0]].concat(args[1].map(rests => rests[3]))
    if (args[3]) {
      results.push(undefined)
    }
    return {
      arguments: results
    }
  }
})

/**
 * 支持 Plain Object 形式的 MIP 参数定义，如 MIP.scrollTo({ target: 'abc', duration: 200, position: 'center' })
 *
 * @type {Rule}
 */
export const $mipActionObjectArguments = lex.set({
  type: 'MIPActionObjectArguments',
  rule: $object,
  match (args) {
    return {
      arguments: [args]
    }
  }
})

/**
 * 统一的 MIP 参数字符串解析入口
 *
 * @type {Rule}
 */
export const $mipActionArguments = lex.set({
  type: 'MIPActionArguments',
  rule: [
    _,
    [opt,
      [or, [
        $mipActionObjectArguments,
        $mipActionOldArguments,
        $mipActionNewArguments
      ]]
    ],
    _
  ],
  match (args) {
    return {
      arguments: (args[1] && args[1].arguments) || []
    }
  }
})
