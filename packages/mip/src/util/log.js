
const LIST = ['info', 'log', 'warn', 'error']

class Log {
  constructor (name) {
    LIST.forEach(item => {
      this[item] = (...args) => {
        console[item](`[${name}]`, ...args)
      }
    })
  }
}

export default name => new Log(name)
