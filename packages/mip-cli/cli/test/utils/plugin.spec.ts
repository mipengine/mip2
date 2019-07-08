import fs from 'fs'
import path from 'path'
import * as execUtil from '../../src/utils/exec'
import {
  installOrUpdatePlugin,
  getPluginPackages,
  isPluginFullName,
  isInstalled,
  resolvePluginName,
  resolveCommandFromPackageName,
  pad,
  loadModule,
  printDescription,
  showPluginCmdHelpInfo
} from '../../src/utils/plugin'

test('utils: installOrUpdatePlugin', async () => {
  const executeCommand = jest.spyOn(execUtil, 'executeCommand').mockImplementation(async () => {})

  await installOrUpdatePlugin('install', ['mip-cli-plugin-dev', 'mip-cli-plugin-build'], 'https://r.com')
  expect(executeCommand).toHaveBeenCalledWith(
    'npm',
    ['install', '--loglevel', 'error', 'mip-cli-plugin-dev', 'mip-cli-plugin-build', '--registry','https://r.com'],
    path.resolve(__dirname, '../../../')
  )

  await installOrUpdatePlugin('install', 'mip-cli-plugin-build', 'https://r.com')
  expect(executeCommand).toHaveBeenCalledWith(
    'npm',
    ['install', '--loglevel', 'error', 'mip-cli-plugin-build', '--registry','https://r.com'],
    path.resolve(__dirname, '../../../')
  )

})

test('utils: getPluginPackages', () => {
  jest.spyOn(fs, 'readdirSync').mockImplementationOnce((): any => {
    return [
      'mip-cli-plugin-add',
      'mip-cli-plugin-build',
      'mip-cli-plugin-init',
      'test-cli-plugin-sw',
      'some-other-packages'
    ]
  })

  expect(getPluginPackages()).toEqual([
    'mip-cli-plugin-add',
    'mip-cli-plugin-build',
    'mip-cli-plugin-init'
  ])
})

test('utils: isPluginFullName', () => {
  let testName1 = 'mip-cli-plugin-dev'
  expect(isPluginFullName(testName1)).toBe(true)

  let testName2 = 'build'
  expect(isPluginFullName(testName2)).toBe(false)
})

test('utils: isInstalled', () => {
  const mockPkg = 'cli-plugin-build'
  const mockInstalledPath = path.resolve(__dirname, '../../../')

  jest.spyOn(path, 'join').mockImplementationOnce(() => {
    return path.resolve(mockInstalledPath, mockPkg)
  })

  expect(isInstalled(mockPkg)).toBe(true)
})

test('utils: resolvePluginName', () => {
  let shortname = 'dev'
  expect(resolvePluginName(shortname)).toBe('mip-cli-plugin-dev')

  let fullname = 'mip-cli-plugin-build'
  expect(resolvePluginName(fullname)).toBe(fullname)
})

test('utils: resolveCommandFromPackageName', () => {
  let pkgName1 = 'mip-cli-plugin-validate'
  expect(resolveCommandFromPackageName(pkgName1)).toBe('validate')
})

test('utils: pad', () => {
  expect(pad('abcd', 5)).toBe('abcd ')
  expect(pad('ab cd', 8)).toBe('ab cd   ')
  expect(pad('abcd', 3)).toBe('abcd')
})

test('utils: loadModule', () => {
  expect(loadModule('fs')).toEqual(require('fs'))
})

test('utils: printDescription', () => {
  const mockConsole = jest.spyOn(console, 'log').mockImplementationOnce(() => {})

  printDescription('dev', 'description')

  expect(mockConsole).toHaveBeenCalledWith('  dev                                description')
})

test('utils: showPluginCmdHelpInfo', () => {
  // with no plugins found
  jest.spyOn(fs, 'readdirSync').mockImplementationOnce(() => {
    return []
  })

  expect(showPluginCmdHelpInfo()).toBeUndefined()

  // TOFIX
  // with some plugins found
  const mockConsole = jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(fs, 'readdirSync').mockImplementationOnce((): any => {
    return [
      'mip-cli-plugin-add'
    ]
  })

  showPluginCmdHelpInfo()

  expect(mockConsole).toHaveBeenCalled()
})
