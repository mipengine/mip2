/**
 * @file lexer.js
 * @author clark-t (clarktanglei@163.com)
 * @description 词法分析器
 */

/**
 * 对字符串解析的结果做缓存处理
 *
 * @param {Function} callback 字符串解析回调
 * @param {Function} 包装好的字符串解析回调
 */
function memoize (callback) {

  /**
   * 根据规则来处理当前字符串的回调函数
   *
   * @param {Walker} walker 字符串源码读取工具
   * @param {Rule} rule 字符串解析规则
   * @return {ASTNode} 字符串解析得到的 AST 对象
   */
  return (walker, rule) => {
    // 当查询到有解析结果时，直接返回缓存的解析结果
    let index = walker.index
    let record = walker.query(rule, index)
    if (record) {
      return record[3]
    }
    // 否则执行回调处理字符串，并对解析结果进行存储
    let result = callback(walker, rule)
    walker.record(rule, index, walker.index, result)
    return result
  }
}

/**
 * 当字符串使用当前规则解析失败时，将字符串解析下标恢复到原先的状态
 *
 * @param {Function} callback 字符串解析回调
 * @return {Function} 包装好的字符串解析回调
 */
function restorable (callback) {
  return (walker, rule) => {
    let index = walker.index
    let result = callback(walker, rule)
    // 解析失败只有 undefined（被动解析失败）false（lexer 规则主动判定失败）两种
    // 遇到解析失败时，直接回滚 index
    if (result === undefined || result === false) {
      walker.index = index
    }
    return result
  }
}

/**
 * 对规则属性的工厂方法执行结果做缓存处理
 *
 * @param {Function} callback 字符串解析回调
 * @params {Array.<string>} keys 需要缓存的属性列表
 * @return {Function} 包装好的字符串解析回调
 */
function singleton (callback, keys) {
  let caches = {}
  return (walker, rule) => {
    let cache = caches[rule.type]
    if (!cache) {
      cache = rule
      for (let key of keys) {
        if (typeof cache[key] === 'function') {
          cache[key] = cache[key]()
        }
      }
      caches[rule.type] = cache
    }
    return callback(walker, cache)
  }
}

/**
 * 对字符串执行解析规则
 *
 * @param {Walker} walker 表达式字符串读取工具
 * @param {Rule} rule 解析规则
 * @return {ASTNode|undefined|false} 解析得到 AST
 */
export function run (walker, rule) {
  return rule[0](walker, rule[1])
}

/**
 * 顺序执行规则列表，当其中某条规则解析错误时，则整体解析失败，同时回滚字符串解析下标
 *
 * @param {Walker} walker 表达式字符串读取工具
 * @param {Array.<Rule>} rules 解析规则列表
 * @return {ASTNode|false} 解析得到的 AST
 */
export const seq = restorable((walker, rules) => {
  if (typeof rules[0] === 'function') {
    return run(walker, rules)
  }
  let results = []
  for (let node of rules) {
    let result = run(walker, node)
    if (result === false) {
      return false
    }
    results.push(result)
  }
  return results
})

/**
 * 顺序执行规则列表，当其中某条规则解析成功时，则直接返回该解析结果，全部规则解析失败时，则整体解析失败，同时回滚字符串解析下标
 *
 * @param {Walker} walker 表达式字符串读取工具
 * @param {Array.<Rule>} rules 解析规则列表
 * @return {ASTNode|false} 解析得到的 AST
 */
export const or = (walker, rules) => {
  let index = walker.index
  for (let node of rules) {
    let result = run(walker, node)
    if (result !== false) {
      return result
    }
    walker.index = index
  }
  return false
}

/**
 * zero or more
 *
 * @param {Walker} walker 表达式字符串读取工具
 * @param {Rule} rule 解析规则
 * @return {ASTNode|undefined} 解析得到的 AST
 */
export const any = (walker, rule) => {
  let results = []
  while (!walker.end()) {
    let result = seq(walker, rule)
    if (result === false) {
      break
    }
    results.push(result)
  }
  return results
}


/**
 * one or more
 *
 * @param {Walker} walker 表达式字符串读取工具
 * @param {Rule} rule 解析规则
 * @return {ASTNode|false} 解析得到的 AST
 */
export const some = (walker, rule) => {
  let results = []
  while (!walker.end()) {
    let result = seq(walker, rule)
    if (result === false) {
      break
    }
    results.push(result)
  }
  return results.length ? results : false
}

/**
 * zero or one
 *
 * @param {Walker} walker 表达式字符串读取工具
 * @param {Rule} rule 解析规则
 * @return {ASTNode|undefined} 解析得到的 AST
 */
export const opt = (walker, rule) => {
  return seq(walker, rule) || undefined
}

/**
 * 当匹配到该规则时，则判定为解析失败，反之则解析成功
 *
 * @param {Walker} walker 表达式字符串读取工具
 * @param {Rule} rule 解析规则
 * @return {undefined|false} 成功时返回 undefined，反之则返回 false
 */
export const not = restorable((walker, rule) => {
  let result = seq(walker, rule)
  return result === false ? undefined : false
})

/**
 * 定义规则
 *
 * @param {Walker} walker 表达式字符串读取工具
 * @param {Descriptor} descriptor 规则描述对象
 * @return {ASTNode|undefined|false} 解析得到的 AST
 */
export const def = memoize(singleton(
  (walker, descriptor) => {
    let index = walker.index
    const {rule, match, type, fallback} = descriptor
    let result = seq(walker, rule)

    if (result !== false && match) {
      result = match(result, walker)
    }

    if (result === false && fallback) {
      walker.index = index
      return seq(walker, fallback)
    }

    if (result && !result.type) {
      result.type = type
    }

    return result
  },
  ['rule', 'fallback']
))

/**
 * 文本匹配
 *
 * @param {Walker} walker 表达式字符串读取工具
 * @param {string} pattern 要匹配的字符串
 * @return {ASTNode|false} 解析得到的 AST，匹配失败时返回 false
 */
export const text = memoize(
  (walker, pattern) => {
    let match = walker.matchText(pattern)
    return match ? {raw: pattern} : false
  }
)

/**
 * 正则匹配
 *
 * @param {Walker} walker 表达式字符串读取工具
 * @param {RegExp} pattern 正则表达式
 * @return {ASTNode|false} 解析得到的 AST，匹配失败时返回 false
 */
export const regexp = memoize(
  (walker, pattern) => {
    let match = walker.matchRegExp(pattern)
    return match ? {raw: match[0]} : false
  }
)


/**
 * 字符串词法分析类
 */
export default class Lexer {
  constructor () {
    this.types = {}
  }

  /**
   * 定义规则
   *
   * @param {Descriptor} descriptor 规则描述对象
   * @return {Rule} 结构化规则对象
   */
  set (descriptor) {
    let item = [def, descriptor]
    this.types[descriptor.type] = item
    return item
  }

  /**
   * 读取规则
   *
   * @param {string} 规则名称
   * @return {Rule} 结构化规则对象
   */
  get (type) {
    return this.types[type]
  }
}

