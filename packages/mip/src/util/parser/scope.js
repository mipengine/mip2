/**
 * @file scope.js
 * @author clark-t (clarktanglei@163.com)
 * @description 作用域管理
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

  /**
   * 设置当前作用域的父作用域
   *
   * @param {Scope|Object} parent 副作用域对象
   */
  setParent (parent) {
    /* istanbul ignore else */
    if (parent instanceof Scope) {
      this.parents = parent.list()
    } else if (typeof parent === 'object') {
      this.parents = [new Scope(parent)]
    }
  }

  /**
   * 返回当前作用域链
   *
   * @return {Array.<Scope>} 作用域链
   */
  list () {
    if (!this.parents) {
      return [this]
    }

    return [...this.parents, this]
  }

  /**
   * 往当前作用域声明变量
   *
   * @params {Array.<string>} names 变量名列表
   */
  declare (names) {
    this.names = names
  }

  /**
   * 往作用域写入已声明变量的值
   *
   * @param {Array.<string>} names 变量名列表
   * @param {Array} values 对应变量的值列表
   * @param {string=} type 作用域类型
   *                       'global' - 写入根作用域
   *                       'parent' - 写入父作用域
   *                       默认 - 写入当前作用域
   */
  set (names, values, type) {
    /* istanbul ignore if */
    if (type === 'global' /* istanbul ignore next */ && this.parents) {
      this.parents[0].set(names, values)
      return
    }
    /* istanbul ignore if */
    if (type === 'parent' /* istanbul ignore next */ && this.parents) {
      this.parents[this.parents.length - 1].set(names, values)
      return
    }

    for (let i = 0; i < names.length; i++) {
      this.map[names[i]] = values[i]
    }
  }

  /**
   * 通过名称获取作用域中声明的变量的值
   *
   * @return {*} 变量的值
   */
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

  /**
   * 判断是否存在已声明的变量
   *
   * @param {string} name 变量名
   * @param {boolean=} recursive 是否沿着作用域链向上查找，默认为 true
   * @return {boolean} 是否存在
   */
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

/**
 * 作用域管理类，作为 AST 节点遍历方法 traverse 统一管理作用域的对象
 */
export class ScopeManager {
  constructor () {
    this.parent = null
    this.instance = null
    this.created = false
  }

  /**
   * 创建新作用域
   */
  create () {
    if (!this.created) {
      this.created = true
      this.instance = new Scope()
      this.parent /* istanbul ignore next */ && this.instance.setParent(this.parent)
    }
    return this.instance
  }

  /**
   * 为当前作用域设置父作用域
   *
   * @param {ScopeManager|Scope|Object} 父作用域
   */
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

  /**
   * 获取当前作用域
   *
   * @return {Scope|undefined} 当前作用域
   */
  getInstance () {
    return this.instance
  }
}

export default ScopeManager
