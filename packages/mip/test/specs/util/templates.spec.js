/**
 * @file util templates spec file
 * @author sekiyika(pengxing@baidu.com)
 */

/* global describe, it, expect, before */
/* eslint-disable no-unused-expressions */

import templates from 'src/util/templates'

describe('templates', function () {
  before(function () {
    let MipTestTemplate = templates.inheritTemplate()
    MipTestTemplate.prototype.cache = function (html) {
      return html
    }
    MipTestTemplate.prototype.render = function (html, data) {
      return html.replace('{{title}}', data.title)
    }
    templates.register('mip-test-template', MipTestTemplate)
  })

  it('templates inheritTemplate, isTemplateClass', function () {
    let MIPTestTemplate = templates.inheritTemplate()
    expect(templates.isTemplateClass(MIPTestTemplate)).to.be.true
    expect(templates.isTemplateClass(Object.create({}))).to.be.false
  })

  it('templates render', async function () {
    let element = document.createElement('div')
    element.innerHTML = `
      <template type="mip-test-template">
        {{title}}
      </template>
    `

    let res = await templates.render(element, {title: 'mip'})
    res = res.trim()
    expect(res).to.equal('mip')

    res = await templates.render(element, {title: 'mip'}, true)
    res.should.be.an('object')
    expect(res.element).to.equal(element)
    expect(res.html.trim()).to.equal('mip')
  })

  it('templates render array', async function () {
    let element = document.createElement('div')
    element.innerHTML = `
      <template type="mip-test-template">
        {{title}}
      </template>
    `

    // 测试空数组的情况
    let res = await templates.render(element, [])
    expect(res).to.have.lengthOf(0)

    // 测试数据是数组的情况
    let data = [{title: 'mip'}, {title: 'pim'}]
    res = await templates.render(element, data)
    expect(res).to.have.lengthOf(2)
    for (let i = 0; i < res.length; i++) {
      expect(data[i].title).to.be.equal(res[i].trim())
    }
  })

  it('templates render falied', function () {
    expect(templates.render('', {})).to.be.equal(undefined)
    expect(templates.render(document.createElement('a'), {})).to.be.equal(undefined)
    expect(templates.render(document.createElement('div'), {})).to.be.equal(undefined)
  })
})

/* eslint-enable no-unused-expressions */
