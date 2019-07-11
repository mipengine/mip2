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

function memoize (callback, type) {
  return walker => {
    let index = walker.index
    let record = walker.query(type, index)
    if (record) {
      return record
    }

    let result = callback(walker)

    if (result === false) {
      return result
    }
    if (result)
  }
}

// function clone (parentLexer, childLexer) {
//   childLexer.types = Object.assign({}, parentLexer.types)
//   childLexer.caches = {
//     regexp: Object.assign({}, parentLexer.caches.regexp),
//     text: Object.assign({}, parentLexer.caches.text),
//     type: Object.assign({}, parentLexer.caches.type),
//   }
// }

// export function use (callback) {
//   return (...args) => callback()(...args)
// }

export function def ({type, rule, match, fallback}) {
  let tester

  return walker => {
    let index = walker.index

    let record = walker.query(type, index)
    if (record) {
      return record
    }

    tester = tester || seq(rule())
    let result = tester(walker)

    if (result !== false && match) {
      // let args = Array.isArray(result) ? result : [result]
      result = match(result)
    }

    if (result === false) {
      walker.index = index
      return fallback && fallback(walker) || false
    }

    if (result == null) {
      return result
    }

    if (!result.type) {
      result.type = type
    }

    walker.record(type, index, walker.index, result)
    // if (!result.range) {
    //   result.range = walker.getRange()
    // }

    return result
  }
}

export function or (tests) {
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

export function seq (tests) {
  if (Array.isArray(tests)) {
    return (walker) => {
      let index = walker.index
      let results = []
      for (let test of tests) {
        let result = test(walker)
        // let result = safeRun(test, walker)
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

const REGEXP_TYPE = 'lexer_regexp'

export function regexp (pattern, modifiers = '') {
  // let regexpString = `/${pattern}/${modifiers}`;
  let regexp = new RegExp(pattern, modifiers)

  return walker => {
    let index = walker.index
    let record = walker.query(REGEXP_TYPE, index)
    if (record) {
      return record
    }

    let match = walker.matchRegExp(regexp)

    if (match) {
      let result = { raw: match[0] }
      walker.record('regexp', index, walker.index, result)
      return result
      // return {
      //   raw: match[0]
      //   // ,
      //   // range: walker.getRange(index)
      // }
    }
    return false
  }
}

const TEXT_TYPE = 'lexer_text'

export function text (pattern) {
  return walker => {
    let index = walker.index
    let record
    let match = walker.matchText(pattern)
    if (match) {
      return {
        raw: pattern
        // ,
        // range: walker.getRange(index)
      }
    }
    return false
  }
}

export function any (tests) {
  let test = seq(tests)

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

export function some (tests) {
  let test = seq(tests)
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

export function optional (tests) {
  let test = seq(tests)
  return (walker) => {
    return safeRun(test, walker) || undefined
  }
}

// export default class Lexer {
//   constructor (parent) {
//     // if (parent instanceof Lexer) {
//     //   clone(parent, this)

//     // } else {
//     this.types = {}
//     this.caches = {
//       regexp: {},
//       text: {},
//       type: {}
//     }
//     // }
//     // this.types = {}

//     // this.caches = {
//     //   regexp: {},
//     //   text: {},
//     //   type: {}
//     // }

//     // for (let descriptor of descriptors) {
//     //   this.set(descriptor)
//     // }
//   }

//   // cache ()

//   use (type) {
//     if (this.types[type]) {
//       return this.types[type].test
//     }
//     if (!this.caches.type[type]) {
//       this.caches.type[type] = walker => (this.types[type].test(walker))
//     }
//     return this.caches.type[type]
//   }

//   set (descriptor) {
//     const rule = this.seq(descriptor.rule)
//     const test = (walker) => {
//       let index = walker.index
//       let result = rule(walker)
//       // let result = safeRun(rule, walker)

//       if (result !== false && descriptor.onMatch) {
//         let args = Array.isArray(result) ? result : [result]
//         result = descriptor.onMatch(...args)
//       }

//       if (result === false) {
//         walker.index = index
//         return descriptor.fallback && descriptor.fallback(walker) || false
//       }

//       if (result == null) {
//         return result
//       }

//       if (!result.type) {
//         result.type = descriptor.type
//       }

//       if (!result.range) {
//         result.range = walker.getRange()
//       }

//       return result
//     }

//     this.types[descriptor.type] = {
//       descriptor,
//       test
//     }
//   }

//   or (tests) {
//     return (walker) => {
//       for (let test of tests) {
//         let result = safeRun(test, walker)
//         if (result !== false) {
//           return result
//         }
//       }
//       return false
//     }
//   }

//   seq (tests) {
//     if (Array.isArray(tests)) {
//       return (walker) => {
//         let index = walker.index
//         let results = []
//         for (let test of tests) {
//           let result = safeRun(test, walker)
//           if (result === false) {
//             walker.index = index
//             return false
//           }
//           results.push(result)
//         }
//         return results
//       }
//     }
//     return tests
//   }

//   regexp (pattern, modifiers = '') {
//     let regexpString = `/${pattern}/${modifiers}`;

//     if (!this.caches.regexp[regexpString]) {
//       let regexp = new RegExp(pattern, modifiers)

//       this.caches.regexp[regexpString] = walker => {
//         let index = walker.index
//         let match = walker.matchRegExp(regexp)

//         if (match) {
//           return {
//             raw: match[0],
//             range: walker.getRange(index)
//           }
//         }
//         return false
//       }
//     }

//     return this.caches.regexp[regexpString]
//   }

//   text (pattern) {
//     if (!this.caches.text[pattern]) {
//       this.caches.text[pattern] = walker => {
//         let index = walker.index
//         let match = walker.matchText(pattern)
//         if (match) {
//           return {
//             raw: pattern,
//             range: walker.getRange(index)
//           }
//         }
//         return false
//       }
//     }

//     return this.caches.text[pattern]
//   }

//   any (tests) {
//     let test = this.seq(tests)

//     return walker => {
//       let results = []
//       while (!walker.end()) {
//         let result = safeRun(test, walker)
//         if (result === false) {
//           break
//         }
//         results.push(result)
//       }
//      return results
//     }
//   }

//   some (tests) {
//     let test = this.seq(tests)
//     return (walker) => {
//       let results = []
//       let index = walker.index

//       while (!walker.end()) {
//         let result = safeRun(test, walker)
//         // let result = grammar(walker)
//         if (result === false) {
//           break
//         }
//         results.push(result)
//       }
//       if (results.length) {
//         return results
//       }
//       walker.index = index
//       return false
//     }
//   }

//   optional (tests) {
//     let test = this.seq(tests)
//     return (walker) => {
//       return safeRun(test, walker) || undefined
//     }
//   }
// }

