/**
 * @file event.js
 * @author clark-t (clarktanglei@163.com)
 */

const visitorOfEventHandlers = path => {
  let handlers = []
  for (let handler of path.node.elements) {
    handlers.push(path.traverse(handler))
  }

  return function () {
    return handlers.map(handler => handler())
  }
}

const visitor = {
  MIPOldEventHandlers: visitorOfEventHandlers,
  MIPNewEventHandlers: visitorOfEventHandlers,

  MIPEventHandler (path) {
    let event = path.node.event.raw
    // let event = path.traverse(path.node.event)
    let actions = []

    for (let action of path.node.actions) {
      actions.push(path.traverse(action))
    }

    return function ({eventName}) {
      if (eventName === event) {
        for (let action of actions) {
          action()
        }
      }
    }
  },

  // MIPBindAction (path) {

  // },

  // MIPGlobalAction (path) {

  // },

  // MIPComponentAction (path) {
  //   let id = path.node.object.name
  //   let method = path.node.callee.name
  //   let args = []
  //   for (let arg of path.node.arguments) {
  //     args.push(path.traverse(arg))
  //   }
  //   return function () {
  //     let node = document.getElementById(id)
  //     if (node) {
  //       node[method](...args())
  //     }
  //   }
  // }
}

export default visitor

