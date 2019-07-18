/**
 * @file simple-parser index
 * @author clark-t (clarktanglei@163.com)
 * @description A parser for simple JS expression parse
 */
import Walker from './walker'
import traverse from './traverse'
import {run} from './lexer'

export default class Parser {
  constructor ({lexer, visitor, type}) {
    this.lexer = lexer
    this.visitor = visitor
    this.type = type
  }

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

  generate (ast) {
    return traverse(this.visitor, ast)
  }

  transform (str, type) {
    let ast = this.parse(str, type)
    return this.generate(ast)
  }
}

