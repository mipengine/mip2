const { executeCommand } = require('../../src/utils/exec')

test('utils: execCommand with command executed successfully', async () => {
  let expectedRes = await executeCommand('echo', ['exec.spec.js', 'echo', 'successfully'])
  expect(expectedRes).toBeUndefined()
})

test('utils: execCommand with wrong command executed ', async () => {
  try {
    await executeCommand('some-wrong-cmd', ['-t', 'abc'])
  }
  catch (e) {
    expect(e).toEqual(new Error('command failed: some-wrong-cmd -t abc'))
  }
})
