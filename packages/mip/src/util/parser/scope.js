/**
 * @file scope.js
 * @author clark-t (clarktanglei@163.com)
 */

export class Scope {
  constructor (obj) {
    /* istanbul ignore if */
    if (obj) {
      this.map = obj
      this.names = Object.keys(obj)
    } else {
      this.map = {}
      this.names = null
    }
  }

  setParent (parent) {
    /* istanbul ignore else */
    if (parent instanceof Scope) {
      this.parents = parent.list()
    } else if (typeof parent === 'object') {
      this.parents = [new Scope(parent)]
    }
  }

  list () {
    if (!this.parents) {
      return [this]
    }

    return [...this.parents, this]
  }

  declare (names) {
    this.names = names
  }

  set (names, values, type) {
    /* istanbul ignore if */
    if (type === 'global' /*istanbul ignore next */ && this.parents) {
      this.parents[0].set(names, values)
      return
    }
    /* istanbul ignore if */
    if (type === 'parent' /*istanbul ignore next */ && this.parents) {
      this.parents[this.parents.length - 1].set(names, values)
      return
    }

    for (let i = 0; i < names.length; i++) {
      this.map[names[i]] = values[i]
    }
  }

  get (name) {
    if (this.has(name, false)) {
      return this.map[name]
    }
    /* istanbul ignore if */
    if (!this.parents) {
      return
    }

    for (let i = this.parents.length - 1; i > -1; i--) {
      if (this.parents[i].has(name, false)) {
        return this.parents[i].map[name]
      }
    }
  }

  has (name, recursive = true) {
    if (this.names != null) {
      for (let thisName of this.names) {
        if (thisName === name) {
          return true
        }
      }
    }

    if (!recursive) {
      return false
    }

    if (this.parents) {
      for (let parent of this.parents) {
        if (parent.has(name, recursive)) {
          return true
        }
      }
    }

    return false
  }
}

export class ScopeManager {
  constructor () {
    this.parent = null
    this.instance = null
    this.created = false
  }

  create () {
    if (!this.created) {
      this.created = true
      this.instance = new Scope()
      this.parent /* istanbul ignore next */ && this.instance.setParent(this.parent)
    }
    return this.instance
  }

  setParent (parent) {
    if (this.parent) {
      return
    }
    /* istanbul ignore else */
    if (parent instanceof ScopeManager) {
      this.parent = parent.getInstance()
    } else if (parent instanceof Scope) {
      this.parent = parent
    } else {
      this.parent = new Scope(parent)
    }

    if (this.created) {
      this.instance.setParent(this.parent)
    } else {
      this.instance = this.parent
    }
  }

  getInstance () {
    return this.instance
  }
}

export default ScopeManager

