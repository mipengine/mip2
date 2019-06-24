const { checkNodeVersion, camelize, cleanArgs } = require('../../src/utils/cli.ts')

test('should check node version correctly', () => {
  let originalVersion = process.version;
  Object.defineProperty(process, 'version', {
    value: '7.0.0'
  })

  jest.spyOn(process, 'exit').mockImplementationOnce(() => {
    throw new Error('process exit called')
  })

  jest.spyOn(console, 'log').mockImplementationOnce(() => {})

  expect(() => {checkNodeVersion('>8.0.0')}).toThrow('process exit called')
  expect(checkNodeVersion('>6.0.0')).toBeUndefined()

  Object.defineProperty(process, 'version', {
    value: originalVersion
  })
})

test('should camelize correctly', () => {
  let str1 = 'foo-bar'
  let str2 = 'foo-bar-baz'

  expect(camelize(str1)).toBe('fooBar')
  expect(camelize(str2)).toBe('fooBarBaz')
})

test('should clear arguments correctly', () => {
  let cmd = {
    foo: {},
    bar: {},
    options: [
      {
        flags: '-r, --registry <url>',
        required: true,
        optional: false,
        bool: true,
        short: '-r',
        long: '--registry',
        description: '指定registry'
      },
      {
        flags: '-p, --port <portname>',
        required: true,
        optional: false,
        bool: true,
        short: '-p',
        long: '--port',
        description: '指定端口'
      },
    ],
    registry: 'xyz',
    port: 1234
  }

  expect(cleanArgs(cmd)).toEqual({
    registry: 'xyz',
    port: 1234
  })
})