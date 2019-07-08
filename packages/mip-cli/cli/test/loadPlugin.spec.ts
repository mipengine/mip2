import {
  load,
  checkAndInstall,
  parseOption,
  findIndex,
  parseArgs,
  setupCommand
 } from '../src/loadPlugin'
import * as plugin from '../src/utils/plugin'
import commandDefination from './commandDef'
import { logger } from 'mip-cli-utils'
import program from 'commander'

test('main command loaded correctly', () => {
  const loadModule = jest.spyOn(plugin, 'loadModule').mockImplementationOnce(() => {
    return commandDefination
  })
  load('dev')
  expect(loadModule).toHaveBeenCalledWith('mip-cli-plugin-dev')
})

test('function: checkAndInstall', () => {
  const mockInstalled = jest.spyOn(plugin, 'isInstalled').mockImplementationOnce(() => {
    return false
  })

  const mockInstallOrUpdatePlugin = jest.spyOn(plugin, 'installOrUpdatePlugin').mockImplementationOnce((): any => {})
  const mockLogger = jest.spyOn(logger, 'info').mockImplementation(() => {})

  checkAndInstall('dev')

  expect(mockInstalled).toHaveBeenCalledWith('mip-cli-plugin-dev')
  expect(mockInstallOrUpdatePlugin).toHaveBeenCalledWith('install', 'mip-cli-plugin-dev')
  expect(mockLogger).toHaveBeenCalled()
})

test('setup command correctly', () => {
  // mock program.command
  const mockProgramCommand = jest.spyOn(program, 'command').mockImplementationOnce(() => {
    return program
  })

  // mock program.option
  const mockProgramOption = jest.spyOn(program, 'option').mockImplementationOnce((): any => {})

  // mock program.description
  const mockProgramDescription = jest.spyOn(program, 'description').mockImplementationOnce((): any => {
    return program
  })

  // mock program.action
  const mockProgramAction = jest.spyOn(program, 'option').mockImplementationOnce((): any => {})

  setupCommand('dev', commandDefination as any)

  expect(mockProgramCommand).toHaveBeenCalledWith('dev <componentName>')
  expect(mockProgramOption).toHaveBeenNthCalledWith(1, '-p, --port ', '端口号')
  expect(mockProgramOption).toHaveBeenNthCalledWith(2, '-f, --file <value>', '文件名')
  expect(mockProgramOption).toHaveBeenNthCalledWith(3, '-r, --record [value]', '记录')
  expect(mockProgramDescription).toHaveBeenCalledWith('启动开发模式')
  expect(mockProgramAction).toHaveBeenCalled()
})


test('function: parseOption', () => {
  // flag type
  let flagOpt: any = commandDefination.options[0]
  expect(parseOption(flagOpt)).toEqual(['-p, --port ', '端口号'])

  // required type
  let requiredOpt: any = commandDefination.options[1]
  expect(parseOption(requiredOpt)).toEqual(['-f, --file <value>', '文件名'])

  // optional type
  let optionalOpt: any = commandDefination.options[2]
  expect(parseOption(optionalOpt)).toEqual(['-r, --record [value]', '记录'])

  // with option.fn & default value
  let fnOpt: any = commandDefination.options[3]
  expect(typeof parseOption(fnOpt)[2]).toEqual('function')
  expect(parseOption(fnOpt)[3]).toEqual('12345')
})

test('function: findIndex', () => {
  let testOpt: any = commandDefination.options[0]

  let testArgsArray1 = ['a', 'b', '--port', '8888']
  expect(findIndex(testOpt, testArgsArray1)).toEqual(2)

  let testArgsArray2 = ['a', 'b', 'c', '-p', '8888']
  expect(findIndex(testOpt, testArgsArray2)).toEqual(3)

  let testArgsArray3 = ['a', 'b', 'c']
  expect(findIndex(testOpt, testArgsArray3)).toEqual(-1)
})

test('function: parseArgs for main command', () => {
  Object.defineProperty(process, 'argv', {
    value: ['node', 'mip2', 'dev', 'a']
  })

  let cmd: any = Object.assign(commandDefination, {isSubcommand: false})

  let result = parseArgs(cmd)

  expect(result).toEqual({
    componentName: 'a'
  })
})

test('function: parseArgs for subcommand', () => {
  Object.defineProperty(process, 'argv', {
    value: ['node', 'mip2', 'dev', 'component', 'a', 'b']
  })

  let cmd: any = Object.assign(commandDefination.subCommands[0], {isSubcommand: true})

  let result = parseArgs(cmd)

  expect(result).toEqual({
    first: 'a',
    second: 'b'
  })
})

test('function: parseArgs for command with options which need to be filtered', () => {
  Object.defineProperty(process, 'argv', {
    value: ['node', 'mip2', 'dev', 'a', '-f', '123']
  })

  let cmd1: any = Object.assign(commandDefination, {isSubcommand: false})
  let result1 = parseArgs(cmd1)
  expect(result1).toEqual({
    componentName: 'a'
  })

  // different sequence
  Object.defineProperty(process, 'argv', {
    value: ['node', 'mip2', 'dev', '-f', '123', 'a']
  })

  let cmd2: any = Object.assign(commandDefination, {isSubcommand: false})
  let result2 = parseArgs(cmd2)
  expect(result2).toEqual({
    componentName: 'a'
  })

  // with flag option
  Object.defineProperty(process, 'argv', {
    value: ['node', 'mip2', 'dev', '-p', 'a']
  })

  let cmd3: any = Object.assign(commandDefination, {isSubcommand: false})
  let result3 = parseArgs(cmd3)
  expect(result3).toEqual({
    componentName: 'a'
  })
})


