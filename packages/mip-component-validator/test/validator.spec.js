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
    expect(result.errors[0].message).to.include('babel-core')
  })
})
