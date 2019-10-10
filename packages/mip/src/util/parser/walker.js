/**
 * @file walker.js
 * @author clark-t (clarktanglei@163.com)
 */

/**
 * 字符串读取类
 */
export default class Walker {
  constructor (str) {
    this.str = str
    this.index = 0
    this.length = str.length
    this.records = []
  }

  /**
   * 判断当前字符串是否已解析完毕
   *
   * @return {boolean} 是否解析完毕
   */
  end () {
    return this.index === this.length
  }

  /**
   * 按给定的字符串向前移动 index
   *
   * @param {string} str 给定字符串
   * @return {boolean} 是否匹配成功，成功为 true 失败为 false
   */
  matchText (str) {
    let length = str.length
    let result = this.str.substr(this.index, length) === str
    if (result) {
      this.index += length
    }
    return result
  }

  /**
   * 按给定的正则表达式向前移动 index
   *
   * @param {RegExp} regexp 给定的正则表达式
   * @return {Array|undefined} 是否匹配成功，成功为 match 结果，失败为 undefined
   */
  matchRegExp (regexp) {
    let match = regexp.exec(this.rest())
    if (match && match.index === 0) {
      this.index += match[0].length
      return match
    }
  }

  /**
   * 记录某条规则匹配某区间段内的字符串解析匹配结果
   *
   * @param {Rule} rule 匹配规则
   * @param {number} start 字符串起始区间 index
   * @param {number} end 字符串终止区间 index
   * @param {ASTNode|undefined|false} result 解析匹配结果
   */
  record (rule, start, end, result) {
    this.records.push([rule, start, end, result])
  }

  /**
   * 查询某条规则在某 index 下的字符串匹配结果
   *
   * @param {Rule} rule 匹配规则
   * @param {number} start 解析匹配起始坐标
   * @return {Record|undefined} 查询结果
   */
  query (rule, start) {
    for (let record of this.records) {
      if (record[0] === rule && record[1] === start) {
        this.index = record[2]
        return record
      }
    }
  }

  /**
   * 返回剩余未匹配的字符串
   *
   * @return {string} 剩余的字符串
   */
  rest () {
    return this.str.slice(this.index)
  }

  // getRange (start) {
  //   return [start, this.index - 1]
  // }
}
