/**
 * @file monitor spec
 * @author liwenqian(liwenqian@baidu.com)
 */

/* globals describe, it, expect, sinon */

import viewer from 'src/viewer'
import firstSceenLabel from 'src/log/firstscreen-label'

describe('firstscreen-label', () => {
  let div
  before(() => {
    div = document.createElement('div')
    div.innerHTML = `
      <div class="test-img1">
        <mip-img firstscreen="1" src="https://www.mipengine.org/static/img/sample_01.jpg"></mip-img>
      </div>
      <div class="test-img2">
        <mip-img mip-firstscreen-element src="https://www.mipengine.org/static/img/sample_02.jpg"></mip-img>
      </div>
    `
    document.body.appendChild(div)
  })

  it('correct firstsceen label log', function (done) {
    let spy = sinon.stub(viewer, 'sendMessage').callsFake(function (eventName, data = {}) {
      expect(eventName).to.be.equal('performance-analysis-log')
      expect(data).to.be.a('object')
      expect(data.type).to.be.equal('fslabel')
      expect(data.info).to.be.equal('html.1/body.1/div.10/div.2/mip-img.1!!html.1/body.1/div.10/div.1/mip-img.1')
      done()
      spy.restore()
    })
    firstSceenLabel.sendLog()
  })

  after(() => {
    document.body.removeChild(div)
  })
})
