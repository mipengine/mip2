const chai = require('chai')
const expect = chai.expect
const validator = require('../src/validator')

/* globals describe, it */

describe('validator.js', function () {
  it('invalid', function () {
    const result = validator.validate('./test/mip-cases')
    expect(result.status).to.equal(1)
    expect(result.errors.length).to.above(0)
  })

  it('valid', function () {
    const result = validator.validate('./test/mip-cases/mip-valid.vue')
    expect(result.status).to.equal(0)
  })
})
