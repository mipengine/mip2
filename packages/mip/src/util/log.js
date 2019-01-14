
const LIST = ['info', 'log', 'warn', 'error']

class Log {
  constructor (name) {
    LIST.forEach(item => {
      this[item] = log => {
        console[item](`[${name}] ${log}`)
      }
    })
  }
}

export default name => new Log(name)
