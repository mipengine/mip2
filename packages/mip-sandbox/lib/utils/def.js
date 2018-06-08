/**
 * @file def.js
 * @author clark-t (clarktanglei@163.com)
 */

module.exports = {
  defs: function (obj, props, {host = window, writable = false} = {}) {
    Object.defineProperties(
      obj,
      props.reduce(function (obj, key) {
        obj[key] = {
          enumberable: true,
          configurable: false
        }

        if (typeof host[key] === 'function') {
          if (/^[A-Z]/.test(key)) {
            // class
            obj[key].value = host[key]
            obj[key].writable = false
          } else {
            // 不然直接 MIP.sandbox.setTimeout(() => {}) 会报错
            obj[key].get = function () {
              return host[key].bind(host)
            }
          }
        } else {
          obj[key].get = function () {
            return host[key]
          }

          obj[key].set = function (val) {
            // 只是防止用户篡改而不是不让用户写
            if (writable) {
              host[key] = val
            }
          }
        }

        return obj
      }, {})
    )
  },

  def: function (obj, prop, getter) {
    Object.defineProperty(obj, prop, {
      enumberable: true,
      get: function () {
        return getter
      }
    })
  }
}
