const chai = require('chai')
const expect = chai.expect
const Reporter = require('../src/reporter')

/* globals describe, it */

describe('reporter.js', function () {
  it('should status value is 0', function () {
    const reporter = new Reporter()
    const report = reporter.getReport()
    expect(report.status).equal(0)
  })

  it('should status value is 1 when errors', function () {
    const reporter = new Reporter()
    reporter.error('test/a.vue', 'no error here')
    const report = reporter.getReport()
    expect(report.status).equal(1)
  })

  it('should status value is 1 when warns', function () {
    const reporter = new Reporter()
    reporter.warn('test/a.vue', 'no warn here')
    const report = reporter.getReport()
    expect(report.status).equal(1)
  })

  it('should line/col value when has it', function () {
    const reporter = new Reporter()
    reporter.error('test/a.vue', 'no error here', 10, 5)
    reporter.warn('test/a.vue', 'test warn line/col', 15, 8)
    const report = reporter.getReport()
    expect(report.errors[0].line).equal(10)
    expect(report.errors[0].col).equal(5)
    expect(report.warns[0].line).equal(15)
    expect(report.warns[0].col).equal(8)
  })

  it('should line/col value is -1 when null', function () {
    const reporter = new Reporter()
    reporter.error('test/a.vue', 'no error here')
    const report = reporter.getReport()
    expect(report.errors[0].line).equal(-1)
    expect(report.errors[0].col).equal(-1)
  })
})
