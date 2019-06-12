/**
 * @file index.spec.js
 * @author clark-t (clarktanglei@163.com)
 */

import plugin from '../src/index'

test('Hello World', async () => {
  jest.setTimeout(20000)
  plugin.run({
    compName: 'test',
    options: {
      force: true
    }
  })
  await new Promise(resolve => {
    setTimeout(resolve, 8000)
  })
})
