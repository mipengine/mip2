/**
 * @file generator.js
 * @author clark-t (clarktanglei@163.com)
 */

import {
  // PROTOTYPE,
  // getMIPElementAction,
  getValidCallee,
  getValidObject,
  // CUSTOM_FUNCTIONS,
  CUSTOM_OBJECTS
  // byId.
} from '../whitelist'

function is (node, type) {
  return node.type === type
}

const BINARY_OPERATION = {
  '+': (left, right) => left + right,
  '-': (left, right) => left - right,
  '*': (left, right) => left * right,
  '/': (left, right) => left / right,
  '%': (left, right) => left % right,
  '>': (left, right) => left > right,
  '<': (left, right) => left < right,
  '>=': (left, right) => left >= right,
  '<=': (left, right) => left <= right,
  '==': (left, right) => left == right,
  '===': (left, right) => left === right,
  '!=': (left, right) => left != right,
  '!==': (left, right) => left !== right,
  '&&': (left, right) => left && right,
  '||': (left, right) => left || right,

}

const UNARY_OPERATION = {
  '+': (arg) => +arg,
  '-': (arg) => -arg,
  '!': (arg) => !arg,
  '~': (arg) => ~arg
}

const visitor = {
  ConditionalExpression (path) {
    let test = path.traverse(path.node.test)
    let consequent = path.traverse(path.node.consequent)
    let alternate = path.traverse(path.node.alternate)

    return function () {
      return test() ? consequent() : alternate()
    }
  },

  BinaryExpression (path) {
    let node = path.node
    let operation = BINARY_OPERATION[node.operator]
    let left = path.traverse(node.left)
    let right = path.traverse(node.right)
    return function () {
      return operation(left(), right())
    }
  },

  UnaryExpression (path) {
    let node = path.node
    let operation = UNARY_OPERATION(node.operator)
    let argument = path.traverse(node.argument)
    return function () {
      return operation(argument())
    }
  },

  ArrayExpression (path) {
    let elements = []
    for (let element of path.node.elements) {
      if (element == null) {
        elements.push(() => element)
      } else {
        elements.push(path.traverse(element))
      }
    }

    return function () {
      return elements.map(element => element())
    }
  },

  ObjectExpression (path) {
    let properties = []
    for (let property of path.node.properties) {
      properties.push(path.traverse(property))
    }

    return function () {
      return properties.reduce((obj, property) => {
        let [key, value] = property()
        obj[key] = value
        return obj
      }, {})
    }
  },

  Property (path) {
    let key = path.traverse(path.node.key)
    let value = path.traverse(path.node.value)

    return function () {
      return [key(), value()]
    }
  },

  Identifier (path) {
    let name = path.node.name

    return function () {
      return name
       // return WHITELIST.customObjects[name] ||
        // WHITELIST.defaults({id: name})
    }
  },

  Literal (path) {
    let value = path.node.value
    return function () {
      return value
    }
  },

  MemberExpression (path) {
    let node = path.node
    let object

    if (is(node.object, 'Identifier')) {
      object = getValidObject(node.object.name)
      // object = CUSTOM_OBJECTS[node.object.name] ||
        // byId.bind(null, node.object.name)
      // object = getCustomObject(node.object.name)
    } else {
      object = path.traverse(node.object)
    }

    let property = path.traverse(node.property)
    return function (...args) {
      return object(...args)[property()]
    }
  },

  CallExpression (path) {
    // let node = path.node

    let callee = getValidCallee(path)
    let args = []

    for (let arg of path.node.arguments) {
      args.push(path.traverse(arg))
    }

    return function (...options) {
      return callee(...options).apply(undefined, args.map(arg => arg()))
    }
  },

  // ArrowFunctionExpression (path) {
  //   let params = path.node.params.map(node => node.name)
  //   let body = path.traverse(path.node.body)

  //   return function () {
  //     return function (...args) {
  //       return body(args)
  //     }
  //   }
  // }
}

export default visitor

