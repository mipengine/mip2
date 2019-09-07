/**
 * @file generator.js
 * @author clark-t (clarktanglei@163.com)
 */

import {
  UNARY_OPERATION,
  BINARY_OPERATION,
  CUSTOM_FUNCTIONS,
  MIP_REGISTER_FUNCTION_MACRO,
  CUSTOM_OBJECTS,
  getValidPrototypeFunction,
  getProperty
} from '../whitelist/basic'

function isCallee (parent, node) {
  return parent &&
    parent.type === 'Call' &&
    parent.callee === node
}

const visitor = {
  Conditional (path) {
    let test = path.traverse(path.node.test)
    let consequent = path.traverse(path.node.consequent)
    let alternate = path.traverse(path.node.alternate)

    return function () {
      return test() ? consequent() : alternate()
    }
  },

  Binary (path) {
    let node = path.node
    let operation = BINARY_OPERATION[node.operator]
    let left = path.traverse(node.left)
    let right = path.traverse(node.right)
    return function () {
      return operation(left, right)
    }
  },

  Unary (path) {
    let node = path.node
    let operation = UNARY_OPERATION[node.operator]
    let argument = path.traverse(node.argument)
    return function () {
      return operation(argument)
    }
  },

  ArrayLiteral (path) {
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

  ObjectLiteral (path) {
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

  Variable (path) {
    let {parent, node} = path
    let name = node.name

    if (isCallee(parent, node)) {
      let fn = CUSTOM_FUNCTIONS[name] || MIP_REGISTER_FUNCTION_MACRO[name]
      return () => fn
    }

    let valid = CUSTOM_OBJECTS[name]
    let varFn = valid && valid.object
    let scopeManager = path.scopeManager

    return function (options) {
      let scope = scopeManager.getInstance()
      if (scope.has(name)) {
        return scope.get(name)
      }
      let params = {options}

      return varFn && varFn(params) ||
        getProperty(CUSTOM_OBJECTS.m.object(params), name)
    }

  },

  Identifier (path) {
    let name = path.node.name
    return () => name
  },

  Literal (path) {
    let value = path.node.value
    return () => value
  },

  Member (path) {
    let {node, parent} = path
    let propertyFn = path.traverse(node.property)
    let objectFn = path.traverse(node.object)

    let getPropertyFn = getProperty
    let isCustomObject = false

    if (node.object.type === 'Variable') {
      let valid = CUSTOM_OBJECTS[node.object.name]
      isCustomObject = !!valid
      if (isCustomObject && valid.property) {
        getPropertyFn = valid.property
      }
    }

    if (!isCustomObject && isCallee(parent, node)) {
      getPropertyFn = getValidPrototypeFunction
    }

    return function () {
      return getPropertyFn(objectFn(), propertyFn())
    }
  },

  Call (path) {
    let node = path.node
    // 处理参数
    let args = []
    for (let arg of path.node.arguments) {
      args.push(path.traverse(arg))
    }
    let argFn = () => args.map(arg => arg())
    let calleeFn = path.traverse(node.callee)

    return () => calleeFn()(...argFn())
  },

  ArrowFunction (path) {
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

