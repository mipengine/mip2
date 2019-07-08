import { update } from '../src/update'
import * as plugin from '../src/utils/plugin'
import { logger } from 'mip-cli-utils'

test('run update command with specified plugin names', () => {
  const updateMultiplePlugin = jest.spyOn(plugin, 'installOrUpdatePlugin').mockImplementationOnce((): any => {})
  update(['dev', 'mip-cli-plugin-build'], { registry: 'https://test.com' })

  expect(updateMultiplePlugin).toHaveBeenCalledWith(
    'install',
    [
      'mip-cli-plugin-dev@latest',
      'mip-cli-plugin-build@latest',
    ],
    'https://test.com'
  )
})

test('run update command without specified plugin names', () => {
  jest.spyOn(plugin, 'getPluginPackages').mockImplementationOnce(() => {
    return [
      'mip-cli-plugin-add',
      'mip-cli-plugin-build',
      'mip-cli-plugin-init'
    ]
  })

  const updateMultiplePlugin = jest.spyOn(plugin, 'installOrUpdatePlugin').mockImplementationOnce((): any => {})

  update([], { registry: 'https://test.com' })

  expect(updateMultiplePlugin).toHaveBeenCalledWith(
    'install',
    [
      'mip-cli-plugin-add@latest',
      'mip-cli-plugin-build@latest',
      'mip-cli-plugin-init@latest',
    ],
    'https://test.com'
  )
})

test('run update command without specified plugin names and no plugins found', () => {
  jest.spyOn(plugin, 'getPluginPackages').mockImplementationOnce(() => {
    return []
  })

  const mockLogger = jest.spyOn(logger, 'info').mockImplementationOnce(() => {});
  const updateMultiplePlugin = jest.spyOn(plugin, 'installOrUpdatePlugin').mockImplementationOnce((): any => {})

  update([], { registry: 'https://test.com' })

  expect(mockLogger).toHaveBeenCalled()
  // 本次没有调用，一共2次
  expect(updateMultiplePlugin).toHaveBeenCalledTimes(2)
})

