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

export default parser

