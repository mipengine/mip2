/**
 * @file lexer.js
 * @author clark-t (clarktanglei@163.com)
 */

function safeRun (test, walker) {
  let index = walker.index
  let result = test(walker)
  if (result === false) {
    walker.index = index
  }
  return result
}

export default class Lexer {
  constructor (descriptors = []) {
    this.types = {}

    this.caches = {
      regexp: {},
      text: {},
      type: {}
    }

    for (let descriptor of descriptors) {
      this.set(descriptor)
    }
  }

  use (type) {
    if (this.types[type]) {
      return this.types[type].test
    }
    if (!this.caches.type[type]) {
      this.caches.type[type] = walker => (this.types[type].test(walker))
    }
    return this.caches.type[type]
  }

  set (descriptor) {
    const rule = this.seq(descriptor.rule)
    const test = walker => {
      let result = safeRun(rule, walker)
      if (result === false) {
        return descriptor.fallback && descriptor.fallback(walker) || false
      }

      if (descriptor.onMatch) {
        let args = Array.isArray(result) ? result : [result]
        result = descriptor.onMatch(...args)
      }
      if (!result.type) {
        result.type = descriptor.type
      }
      return result
    }

    this.types[descriptor.type] = {
      descriptor,
      test
    }
  }

  or (tests) {
    return (walker) => {
      for (let test of tests) {
        let result = safeRun(test, walker)
        if (result !== false) {
          return result
        }
      }
      return false
    }
  }

  seq (tests) {
    if (Array.isArray(tests)) {
      return (walker) => {
        let index = walker.index
        let results = []
        for (let test of tests) {
          let result = safeRun(test, walker)
          if (result === false) {
            walker.index = index
            return false
          }
          results.push(result)
        }
        return results
      }
    }
    return tests
  }

  regexp (pattern, modifiers = '') {
    let regexpString = `/${pattern}/${modifiers}`;

    if (!this.caches.regexp[regexpString]) {
      let regexp = new RegExp(pattern, modifiers)

      this.caches.regexp[regexpString] = walker => {
        let index = walker.index
        let match = walker.matchRegExp(regexp)

        if (match) {
          return {
            raw: match[0],
            range: [
              index,
              walker.index
            ]
          }
        }
        return false
      }
    }

    return this.caches.regexp[regexpString]
  }

  text (pattern) {
    if (!this.caches.text[pattern]) {
      this.caches.text[pattern] = walker => {
        let index = walker.index
        let match = walker.matchText(pattern)
        if (match) {
          return {
            raw: pattern,
            range: [
              index,
              walker.index
            ]
          }
        }
        return false
      }
    }

    return this.caches.text[pattern]
  }

  zeroOrMore (tests) {
    let test = this.seq(tests)

    return walker => {
      let results = []
      while (!walker.end()) {
        let result = safeRun(test, walker)
        if (result === false) {
          break
        }
        results.push(result)
      }
     return results
    }
  }

  oneOrMore (tests) {
    let test = this.seq(tests)
    return (walker) => {
      let results = []
      let index = walker.index

      while (!walker.end()) {
        let result = safeRun(test, walker)
        // let result = grammar(walker)
        if (result === false) {
          break
        }
        results.push(result)
      }
      if (results.length) {
        return results
      }
      walker.index = index
      return false
    }
  }

  zeroOrOne (tests) {
    let test = this.seq(tests)
    return (walker) => {
      return safeRun(test, walker) || undefined
    }
  }
}

