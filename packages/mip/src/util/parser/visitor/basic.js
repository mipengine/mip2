/**
 * @file generator.js
 * @author clark-t (clarktanglei@163.com)
 */

import {
  CUSTOM_FUNCTIONS,
  getValidPrototypeFunction,
  getValidObject
} from '../whitelist'

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
    let operation = UNARY_OPERATION[node.operator]
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

    if (path.node.role === 'root') {
      let object = getValidObject(name)
      let scopeManager = path.scopeManager

      return function (options) {
        let scope = scopeManager.getInstance()
        if (scope.has(name)) {
          return scope.get(name)
        }
        return object({options})
      }
    }

    return () => name
  },

  Literal (path) {
    let value = path.node.value
    return function () {
      return value
    }
  },

  MemberExpression (path) {
    let node = path.node
    let propertyFn = path.traverse(node.property)

    if (node.object.type === 'Identifier') {
      let name = node.object.name
      let scopeManager = path.scopeManager
      let objectFn = getValidObject(name)

      return function (options) {
        let property = propertyFn()
        let scope = scopeManager.getInstance()

        if (scope.has(name)) {
          return scope.get(name)[property]
        }
        return objectFn({options, property})
      }
    }

    let object = path.traverse(node.object)
    return function () {
      return object()[propertyFn()]
    }
  },

  CallExpression (path) {
    let node = path.node
    // 处理参数
    let args = []
    for (let arg of path.node.arguments) {
      args.push(path.traverse(arg))
    }
    let argFn = () => args.map(arg => arg())

    // 处理 callee

    if (node.callee.type === 'Identifier') {
      let fn = CUSTOM_FUNCTIONS[node.callee.name]
      return function () {
        return fn(...argFn())
      }
    }

    if (
      node.callee.type === 'MemberExpression' &&
      node.callee.object.type === 'Identifier'
    ) {
      let name = node.callee.object.name
      let scopeManager = path.scopeManager
      let objectFn = getValidObject(name)
      let propertyFn = path.traverse(node.callee.property, node.callee)

      return function (options) {
        let property = propertyFn()
        let args = argFn()
        let scope = scopeManager.getInstance()
        if (scope.has(name)) {
          let object = scope.get(name)
          return getValidPrototypeFunction(object, property)(...args)
        }
        return objectFn({options, property})(...args)
      }
    }

    if (node.callee.type === 'MemberExpression') {
      let objectFn = path.traverse(node.callee.object, node.callee)
      let propertyFn = path.traverse(node.callee.property, node.callee)

      return function () {
        let object = objectFn()
        let property = propertyFn()
        return getValidPrototypeFunction(object, property)(...argFn())
      }
    }

    // 走到这里基本就是出错了
    throw Error('未知的表达式')
  },

  ArrowFunctionExpression (path) {
    const node = path.node

    let names = node.params.map(node => node.name)
    let scope = path.scopeManager.create()
    scope.declare(names)

    let body = path.traverse(node.body)
    return function () {
      return function (...args) {
        scope.set(names, args)
        return body()
      }
    }
  }
}

export default visitor

