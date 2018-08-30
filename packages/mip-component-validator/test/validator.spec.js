const chai = require('chai')
const expect = chai.expect
const validator = require('../src/validator')

/* globals describe, it */

describe('validator.js', function () {
  it('invalid', async function () {
    const result = await validator.validate('./test/mip-cases')
    expect(result.status).to.equal(1)
    expect(result.errors.length).to.above(0)
  })

  it('valid', async function () {
    const result = await validator.validate('./test/mip-cases/mip-valid.vue')
    expect(result.status).to.equal(0)
  })

  it('whitelist validate in same folder', async function () {
    const result = await validator.whitelist('./test/mip-cases/invalid-npm')
    expect(result.errors[0].message).to.include('babel-core')
  })

  it('whitelist validate in parent folder', async function () {
    const result = await validator.whitelist('./test/mip-cases')
    expect(result.errors[0].message).to.include('babel-core')
  })

  it('whitelist validate in child folder', async function () {
    const result = await validator.whitelist('./test/mip-cases/static')
    expect(result.errors.length).to.be.equal(0)
  })

  it('full validate', async function () {
    const result = await validator.validate('./test/mip-cases')
    let error = result.errors.map(e => e.message).join('\n')
    expect(error).to.include('babel-core')
    expect(error).to.include('组件名称不符合命名规范')
  })

  it('full validate with regex ignore', async function () {
    const result = await validator.validate('./test/mip-cases', {ignore: /package\.json$/})
    let error = result.errors.map(e => e.message).join('\n')
    expect(error).to.not.include('babel-core')
  })

  it('full validate with minimatch ignore', async function () {
    const result = await validator.validate('./test/mip-cases', {ignore: '**/package.json'})
    let error = result.errors.map(e => e.message).join('\n')
    expect(error).to.not.include('babel-core')
  })

  it('full validate with array ignore', async function () {
    const result = await validator.validate('./test/mip-cases', {ignore: ['**/package.json']})
    let error = result.errors.map(e => e.message).join('\n')
    expect(error).to.not.include('babel-core')
  })

  it('no dependencies run success', async function () {
    const result = await validator.whitelist('./test/mip-cases/no-dependencies-npm')
    expect(result.errors.length).to.be.equal(0)
  })
})
