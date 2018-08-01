/**
 * @file test.js unit test
 * @author tracy(qiushidev@gmail.com)
 */

const fs = require('fs-extra')
const path = require('path')
const meta = require('../lib/utils/meta')
const {render} = require('../lib/utils/render')
const {expect} = require('chai')

describe('test meta', function () {
  it('it should read and modify meta.js correctly', function () {
    const mockDir = path.join(__dirname, 'mock/mock-default-template')
    const projectName = 'testInputProjectName'
    let options = meta(projectName, mockDir)
    expect(options).to.be.an('object')
    expect(options.prompts).to.be.an('object')
    expect(options.prompts.name).to.be.an('object')
    expect(options.prompts.description).to.be.an('object')
    expect(options.prompts.author).to.be.an('object')
    expect(options.prompts.name.default).to.be.equal(projectName)
  })

  it('it should render file correctly',  function () {
    const template = '<div>this is {{name}}</div>'
    let res = render(template, {name: 'test'})
    expect(res).to.be.equal('<div>this is test</div>')
  })
})

