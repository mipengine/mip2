const { list } = require('../src/list.ts')
const plugin = require('../src/utils/plugin')
const { logger } = require('mip-cli-utils')

let consoleArray
let mockConsole

beforeEach(() => {
  consoleArray = []
  mockConsole = jest.spyOn(console, 'log').mockImplementation((content) => {
    consoleArray.push(content)
  })
})

afterEach(() => {
  mockConsole.mockRestore()
})

test('the list command runs with params as expected', () => {
  jest.spyOn(plugin, 'getPluginPackages').mockImplementationOnce(() => {
    return [
      'mip-cli-plugin-add',
      'mip-cli-plugin-build',
      'mip-cli-plugin-init'
    ]
  })

  list()

  expect(consoleArray.indexOf('当前使用的插件:')).toBeGreaterThan(-1)
  expect(consoleArray.indexOf('mip-cli-plugin-add')).toBeGreaterThan(-1)
  expect(consoleArray.indexOf('mip-cli-plugin-build')).toBeGreaterThan(-1)
  expect(consoleArray.indexOf('mip-cli-plugin-init')).toBeGreaterThan(-1)
})

test('the list command runs with no plugins found', () => {
  jest.spyOn(plugin, 'getPluginPackages').mockImplementationOnce(() => {
    return []
  })

  const mockLogger = jest.spyOn(logger, 'info')
  list()

  expect(mockLogger).toHaveBeenCalled()
  expect(consoleArray.indexOf('当前使用的插件:')).toBe(-1)
})