/**
 * @file reporter.js
 * @desc 报告信息
 * @author liwenqian
 */

class Reporter {
  constructor () {
    this.warns = []
    this.errors = []
  }

  warn (file, message, line, col) {
    this.warns.push({
      file: file,
      message: message,
      line: line == null ? -1 : line,
      col: col == null ? -1 : col
    })
  }

  error (file, message, line, col) {
    this.errors.push({
      file: file,
      message: message,
      line: line == null ? -1 : line,
      col: col == null ? -1 : col
    })
  }

  getReport () {
    return {
      status: (this.warns.length || this.errors.length) ? 1 : 0,
      warns: this.warns,
      errors: this.errors
    }
  }
}

module.exports = Reporter
