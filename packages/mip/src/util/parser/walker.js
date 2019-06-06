/**
 * @file walker.js
 * @author clark-t (clarktanglei@163.com)
 */

export default class Walker {
  constructor (str) {
    this.str = str
    this.index = 0
    this.length = str.length
  }

  end () {
    return this.index  === this.length
  }

  matchText (str) {
    let length = str.length
    let result = this.str.substr(this.index, length) === str
    if (result) {
      this.index += length
    }
    return result
  }

  matchRegExp (regexp) {
    let match = regexp.exec(this.rest())
    if (match && match.index === 0) {
      this.index += match[0].length
      return match
    }
    // return match
  }

  currentChar () {
    return this.str[this.index]
  }

  rest () {
    return this.str.slice(this.index)
  }
}

