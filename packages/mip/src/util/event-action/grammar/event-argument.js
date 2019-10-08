/**
 * @file argument.js
 * @author clark-t (clarktanglei@163.com)
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

export const $mipValue = lex.set({
  type: 'MIPValue',
  rule: [or, [
    $mipActionAllowed,
    $literal,
    $minus
  ]]
})

export const $mipActionAssignment = lex.set({
  type: 'MIPActionAssignment',
  rule: [
    $identifier,
    _,
    [text, '='],
    _,
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

export const $mipActionObjectArguments = lex.set({
  type: 'MIPActionObjectArguments',
  rule: $object,
  match (args) {
    return {
      arguments: [args]
    }
  }
})

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
      arguments: args[1] && args[1].arguments || []
    }
  }
})

