/**
 * @file mip-bind setData parser
 * @author clark-t (clarktanglei@163.com)
 */

import Parser from '../../index'
import grammar from './grammar'
import visitor from './visitor'

const parser = new Parser({
  lexer: grammar,
  visitor: visitor,
  type: 'ConditionalExpression'
})

export default parser

