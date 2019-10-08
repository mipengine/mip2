/**
 * @file simple-parser index
 * @author clark-t (clarktanglei@163.com)
 * @description A parser for simple JS expression parse
 */

import Walker from './walker'
import traverse from './traverse'
import {run} from './lexer'

/**
 * 解析器类，提供表达式字符串转 AST 和 AST 转 function 的能力
 */
export default class Parser {

  /**
   * constructor
   *
   * @param {Object} options
   * @param {Lexer} options.lexer 词法分析器
   * @param {Object} options.visitor AST 节点访问对象
   * @param {string=} options.type 默认解析的节点类型
   */
  constructor ({lexer, visitor, type}) {
    this.lexer = lexer
    this.visitor = visitor
    this.type = type
  }

  /**
   * 将表达式字符串解析成 AST
   *
   * @param {string} str 待解析的表达式字符串
   * @param {string=} type 制定解析的类型
   * @return {ASTNode} AST
   */
  parse (str, type) {
    type = type || this.type
    const lexer = this.lexer.get(type)
    const walker = new Walker(str)
    let ast = run(walker, lexer)
    if (ast !== false && walker.end()) {
      return ast
    }
    throw new Error(walker.rest())
  }

  /**
   * 将 AST 转换成 function
   *
   * @param {ASTNode} ast AST
   * @return {Function} 可执行的 function
   */
  generate (ast) {
    return traverse(this.visitor, ast)
  }

  /**
   * 将字符串转换成 function
   *
   * @param {string} str 待解析的表达式字符串
   * @param {string=} type 待解析的类型
   * @return {Function} 可执行的 function
   */
  transform (str, type) {
    let ast = this.parse(str, type)
    return this.generate(ast)
  }
}

