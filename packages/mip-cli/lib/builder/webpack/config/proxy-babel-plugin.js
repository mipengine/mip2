/**
 * @file proxy-babel-plugin.js
 * @author clark-t (clarktanglei@163.com)
 */
const minimatch = require('minimatch')

module.exports = function ({types: t}) {
  return {
    visitor: {
      Literal (path, state) {
        if (typeof path.node.value !== 'string') {
          return
        }

        let keys = Object.keys(state.opts)
        for (let i = 0; i < keys.length; i++) {
          if (minimatch(path.node.value, keys[i])) {
            let match = state.opts[keys[i]]
            let dist
            if (typeof match === 'function') {
              dist = match(path.node.value)
            } else {
              dist = match
            }
            path.replaceWith(t.stringLiteral(dist))
            path.stop()
            return
          }
        }
      }
    }
  }
}
