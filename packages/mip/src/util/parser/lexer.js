/**
 * @file lexer.js
 * @author clark-t (clarktanglei@163.com)
 */

function memoize (callback) {
  return (walker, rule) => {
    let index = walker.index
    let record = walker.query(rule, index)
    if (record) {
      return record[3]
    }
    let result = callback(walker, rule)
    walker.record(rule, index, walker.index, result)
    return result
  }
}

function restorable (callback) {
  return (walker, rule) => {
    let index = walker.index
    let result = callback(walker, rule)
    if (result === undefined || result === false) {
      walker.index = index
    }
    return result
  }
}

function singleton (callback, keys) {
  let caches = {}
  return (walker, rule) => {
    let cache = caches[rule.type]
    if (!cache) {
      cache = rule
      for (let key of keys) {
        if (typeof cache[key] === 'function') {
          cache[key] = cache[key]()
        }
      }
      caches[rule.type] = cache
    }
    return callback(walker, cache)
  }
}

export function run (walker, rule) {
  return rule[0](walker, rule[1])
}

export const seq = restorable((walker, rules) => {
  if (typeof rules[0] === 'function') {
    return run(walker, rules)
  }
  let results = []
  for (let node of rules) {
    let result = run(walker, node)
    if (result === false) {
      return false
    }
    results.push(result)
  }
  return results
})

export const or = (walker, rules) => {
  let index = walker.index
  for (let node of rules) {
    let result = run(walker, node)
    if (result !== false) {
      return result
    }
    walker.index = index
  }
  return false
}

export const any = (walker, rule) => {
  let results = []
  while (!walker.end()) {
    let result = seq(walker, rule)
    if (result === false) {
      break
    }
    results.push(result)
  }
  return results
}

export const some = (walker, rule) => {
  let results = []
  while (!walker.end()) {
    let result = seq(walker, rule)
    if (result === false) {
      break
    }
    results.push(result)
  }
  return results.length ? results : false
}

export const opt = (walker, rule) => {
  return seq(walker, rule) || undefined
}

export const not = restorable((walker, rule) => {
  let result = seq(walker, rule)
  return result === false ? undefined : false
})

export const def = memoize(singleton(
  (walker, descriptor) => {
    let index = walker.index
    const { rule, match, type, fallback } = descriptor
    let result = seq(walker, rule)

    if (result !== false && match) {
      result = match(result, walker)
    }

    if (result === false && fallback) {
      walker.index = index
      return seq(walker, fallback)
    }

    if (result && !result.type) {
      result.type = type
    }

    return result
  },
  ['rule', 'fallback']
))

export const text = memoize(
  (walker, pattern) => {
    let match = walker.matchText(pattern)
    return match ? { raw: pattern } : false
  }
)

export const regexp = memoize(
  (walker, pattern) => {
    let match = walker.matchRegExp(pattern)
    return match ? { raw: match[0] } : false
  }
)

export default class Lexer {
  constructor () {
    this.types = {}
  }

  set (descriptor) {
    let item = [def, descriptor]
    this.types[descriptor.type] = item
    return item
  }

  get (type) {
    return this.types[type]
  }
}

