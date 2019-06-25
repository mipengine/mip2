const events = require("events")

jest.mock('execa', () => {
  return jest.fn(() => {
    return new events.EventEmitter()
  })
})

const { executeCommand } = require('../../src/utils/exec')
const execa = require('execa')

test('utils: execCommand', () => {
  let res = executeCommand('npm', ['install', 'a', 'b'], '')
  expect(execa).toHaveBeenCalledWith('npm', ['install', 'a', 'b'], {cwd: '', stdio: 'inherit'})
  expect(res).resolves.toBe({})
})
