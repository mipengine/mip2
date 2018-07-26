const chai = require('chai')
const expect = chai.expect
const validator = require('../src/validator')

/* globals describe, it */

describe('#rules', function () {
  const dirPath = './test/mip-cases/'
  it('disallowed-global-var', async function () {
    const filePath = dirPath + 'mip-disallowed-global-var.vue'
    const result = await validator.validate(filePath)
    const error = result.errors[0]
    expect(error.message).to.include('禁止的全局变量')
  })

  it('component-style-not-scoped', async function () {
    const filePath = dirPath + 'mip-component-style-not-scoped.vue'
    const result = await validator.validate(filePath)
    const error = result.errors[0]
    expect(error.message).to.include('组件样式必须使用 scoped')
  })

  it('component-style-no-fixed', async function () {
    const filePath = dirPath + 'mip-component-style-no-fixed.vue'
    const result = await validator.validate(filePath)
    const error = result.errors[0]
    expect(error.message).to.include('组件样式禁止使用 position: fixed')
  })

  it('component-npm-whitelist error', async function () {
    const filePath = dirPath + '/invalid-npm/package.json'
    const result = await validator.validate(filePath)
    const error = result.errors[0]
    expect(error.message).to.include('babel-core')
  })

  it('component-npm-whitelist success', async function () {
    const filePath = dirPath + '/valid-npm/package.json'
    const result = await validator.validate(filePath)
    expect(result.errors).to.be.deep.equal([])
  })
})
