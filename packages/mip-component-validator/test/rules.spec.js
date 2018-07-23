const chai = require('chai')
const expect = chai.expect
const validator = require('../src/validator')

/* globals describe, it */

describe('#rules', function () {
  const dirPath = './test/mip-cases/'
  it('disallowed-global-var', function () {
    const filePath = dirPath + 'mip-disallowed-global-var.vue'
    const result = validator.validate(filePath)
    const error = result.errors[0]
    expect(error.message).to.include('禁止的全局变量')
  })

  it('component-style-not-scoped', function () {
    const filePath = dirPath + 'mip-component-style-not-scoped.vue'
    const result = validator.validate(filePath)
    const error = result.errors[0]
    expect(error.message).to.include('组件样式必须使用 scoped')
  })

  it('component-style-no-fixed', function () {
    const filePath = dirPath + 'mip-component-style-no-fixed.vue'
    const result = validator.validate(filePath)
    const error = result.errors[0]
    expect(error.message).to.include('组件样式禁止使用 position: fixed')
  })
})
