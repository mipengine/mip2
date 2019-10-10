/**
 * @file event.js
 * @author clark-t (clarktanglei@163.com)
 */

import elementAction from '../whitelist/element-action'
import mipAction from '../whitelist/mip-action'
import log from '../../log'

const logger = log('Event-Action')

const visitor = {
  MIPEventHandlers (path) {
    let handlers = []
    for (let handler of path.node.handlers) {
      handlers.push(path.traverse(handler))
    }

    return function () {
      for (let handler of handlers) {
        handler()
      }
    }
  },

  MIPEventHandler (path) {
    let event = path.node.event
    let actions = []

    for (let action of path.node.actions) {
      actions.push(path.traverse(action))
    }

    return function ({eventName}) {
      if (eventName !== event) {
        return
      }
      for (let action of actions) {
        // 行为在执行的时候是互不干扰的，因此强制捕获错误
        try {
          action()
        } catch (e) /* istanbul ignore next */ {
          logger.error(e)
        }
      }
    }
  },

  MIPAction (path) {
    let {object, property, argumentText} = path.node
    // MIP Action 目前仅支持 html-id.doSomething 和 MIP.doSomething 两种形式
    // 分别对应元素行为和 MIP 全局行为
    return object === 'MIP'
      ? function (options) {
          return mipAction({
            options,
            object,
            property,
            argumentText
          })
        }
      : function (options) {
          return elementAction({
            options,
            object,
            property,
            argumentText
          })
        }
  },

  MIPActionArguments (path) {
    let args = []
    for (let arg of path.node.arguments) {
      args.push(path.traverse(arg))
    }

    return function () {
      return [...args.map(arg => arg())]
    }
  }
}

export default visitor

