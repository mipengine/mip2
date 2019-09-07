/**
 * @file mip-bind-macro.js
 * @author clark-t (clarktanglei@163.com)
 */

import {parse} from '../../util/event-action/parser'
import {registerFunction} from '../../util/event-action/whitelist/basic'
import CustomElement from '../../custom-element'


class MIPBindMacro extends CustomElement {
  build () {
    let {id, expression} = this.props
    let fn = parse(expression, 'Conditional')

    registerFunction(id, (params) => {
      return fn({
        event: params,
        target: this.element
      })
    })
  }
}

MIPBindMacro.props = {
  expression: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: ''
  }
}

export default MIPBindMacro
