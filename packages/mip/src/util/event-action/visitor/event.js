/**
 * @file event.js
 * @author clark-t (clarktanglei@163.com)
 */

import elementAction from '../whitelist/element-action'
import mipAction from '../whitelist/mip-action'
// import {
//   HTMLElementAction,
//   MIPAction
// } from '../whitelist/basic'

const visitor = {
  MIPEventHandlers (path) {
    let handlers = []
    for (let handler of path.node.elements) {
      handlers.push(path.traverse(handler))
    }

    return function () {
      for (let handler of handlers) {
        handler()
      }
    }
  },
  MIPEventHandler (path) {
    let event = path.node.event.name
    let actions = []

    for (let action of path.node.actions) {
      actions.push(path.traverse(action))
    }

    return function ({eventName}) {
      if (eventName !== event) {
        return
      }
      for (let action of actions) {
        try {
          action()
        } catch (e) {
          console.error(e)
        }
      }
    }
  },
  MIPAction (path) {
    let {object, property, role, argumentText} = path.node
    switch (role) {
      case 'MIP':
        return function (options) {
          return mipAction({
            options,
            object,
            property,
            argumentText
          })
        }
      case 'HTMLElement':
        return function (options) {
          return elementAction({
            options,
            object,
            property,
            argumentText
          })
        }
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

