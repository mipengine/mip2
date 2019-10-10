/**
 * @file mip-bind setData parser
 * @author clark-t (clarktanglei@163.com)
 */

import Parser from '../parser/index'
import grammar from './grammar/index'
import visitor from './visitor/index'

/**
 * 默认解析类型
 *
 * @type {string}
 */
const DEFAULT_TYPE = 'MIPEventHandlers'

const parser = new Parser({
  lexer: grammar,
  visitor: visitor,
  type: DEFAULT_TYPE
})

/**
 * 解析结果缓存存储对象
 *
 * @type {Object}
 */
const PARSER_STORE = {}

/**
 * 对外暴露的表达式解析方法
 *
 * @param {string} str 解析字符串
 * @param {string=} 解析类型，默认为 MIPEventHandlers
 * @return {Function} 解析得到的表达式
 */
export function parse (str, type = DEFAULT_TYPE) {
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
