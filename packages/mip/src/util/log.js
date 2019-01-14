
const LIST = ['info', 'log', 'warn', 'error']

class Log {
  constructor (name) {
    LIST.forEach(item => {
      this[item] = function (log) {
        console[item](`[${name}] ${log}`)
      }
    })
  }
}

export default function instance (name) {
  return new Log(name)
}

