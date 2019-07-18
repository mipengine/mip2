/**
 * @file walker.js
 * @author clark-t (clarktanglei@163.com)
 */

export default class Walker {
  constructor (str) {
    this.str = str
    this.index = 0
    this.length = str.length
    this.records = []
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
  }

  record (rule, start, end, result) {
    this.records.push([rule, start, end, result])
  }

  query (rule, start) {
    for (let record of this.records) {
      if (record[0] === rule && record[1] === start) {
        this.index = record[2]
        return record
      }
    }
  }

  rest () {
    return this.str.slice(this.index)
  }

  // getRange (start) {
  //   return [start, this.index - 1]
  // }
}

