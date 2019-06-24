const fs = require('fs')
const path = require('path')
const execa = require('execa')
const {
  installOrUpdatePlugin,
  getPluginPackages,
  isPluginFullName,
  isInstalled,
  resolvePluginName,
  resolveCommandFromPackageName,
  pad,
  loadModule,
  showPluginCmdHelpInfo
} = require('../../src/utils/plugin.ts')

// test('utils: installOrUpdatePlugin', async () => {
//   const mockExec = jest.spyOn(require('../../src/utils/plugin.ts'), 'executeCommand').mockImplementationOnce(() => {})

//   await installOrUpdatePlugin('install', ['dev', 'build'], 'https://r.com')

//   expect(mockExec).toHaveBeenCalledWith(
//     'npm',
//     '--loglevel',
//     'error',
//     ['install', 'dev', 'build', 'https://r.com']
//   )

// })

test('utils: getPluginPackages', () => {
  jest.spyOn(fs, 'readdirSync').mockImplementationOnce(() => {
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
