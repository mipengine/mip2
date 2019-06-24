const { install } = require('../src/install.ts')
const plugin = require('../src/utils/plugin')

test('the install command runs with single params as expected', () => {
  const installSinglePlugin = jest.spyOn(plugin, 'installOrUpdatePlugin').mockImplementationOnce(() => {})

  install(['dev'], {registry: 'https://test.com'})
  expect(installSinglePlugin).toHaveBeenCalledWith(
    'install',
    ['mip-cli-plugin-dev'],
    'https://test.com'
  )
})

test('the install command runs with multiple params as expected', () => {
  const installMultiplePlugin = jest.spyOn(plugin, 'installOrUpdatePlugin').mockImplementationOnce(() => {})

  install(['dev', 'validate'], {registry: 'https://test.com'})
  expect(installMultiplePlugin).toHaveBeenCalledWith(
    'install',
    ['mip-cli-plugin-dev', 'mip-cli-plugin-validate'],
    'https://test.com'
  )
})