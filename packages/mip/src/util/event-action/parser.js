/**
 * @file mip-bind setData parser
 * @author clark-t (clarktanglei@163.com)
 */

import Parser from '../parser/index'
import grammar from './grammar/index'
import visitor from './visitor/index'

const parser = new Parser({
  lexer: grammar,
  visitor: visitor,
  type: 'MIPEventHandlers'
})

const PARSER_STORE = {}

export function parse (str, type = 'MIPEventHandlers') {
  if (!PARSER_STORE[type]) {
    PARSER_STORE[type] = {}
  }
  if (!PARSER_STORE[type][str]) {
    try {
      let fn = parser.transform(str, type)
      PARSER_STORE[type][str] = fn
    } catch (e) {
      PARSER_STORE[type][str] = e
    }
  }
  if (PARSER_STORE[type][str] instanceof Error) {
    throw PARSER_STORE[type][str]
  }
  return PARSER_STORE[type][str]
}

export default parser

