/**
 * @file type.js
 * @author clark-t (clarktanglei@163.com)
 */

module.exports = {
  identifier: function (name) {
    return {
      type: 'Identifier',
      name: name
    }
  },

  memberExpression: function (obj, prop, computed) {
    return {
      type: 'MemberExpression',
      object: obj,
      property: prop,
      computed: computed || false
    }
  },

  callExpression: function (call, args) {
    return {
      type: 'CallExpression',
      callee: call,
      arguments: args
    }
  },

  thisExpression: function () {
    return {
      type: 'ThisExpression'
    }
  }
}
