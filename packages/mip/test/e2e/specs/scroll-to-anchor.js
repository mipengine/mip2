/**
 * @file scroll to anchor e2e test case (standalone 模式)
 * @author panyuqi
 * @description 测试流程：
 * 1. 打开 scroll-to-anchor.html
 * 2. 点击 <a id="anchor" href="./scroll-to-anchor.html#anchor"> 滚动到锚点处
 * 3. 在当前页面刷新，滚动到锚点处
 * 4. 打开 index.html 通过 mip-link 跳转到 scroll-to-anchor.html 验证 iframe 下的情况
 * 5. 点击 iframe 中的 <a id="anchor"> 滚动到锚点处
 *
 * fix ISSUE: https://github.com/mipengine/mip2/issues/125
 */

let INDEX_PAGE_URL
let SCROLL_PAGE_URL
let positionY = 0 // anchor's position in Yaxis
let positionY2 = 0
let positionY3 = 0

module.exports = {
  'open page': function (browser) {
    INDEX_PAGE_URL = `${browser.globals.devServerURL}/test/e2e/cases/index.html`
    SCROLL_PAGE_URL = `${browser.globals.devServerURL}/test/e2e/cases/scroll-to-anchor.html`

    browser
      // open index.html
      .url(SCROLL_PAGE_URL)
      // show mip-shell
      .waitForElementVisible('body', 2000)
  },
  'scroll to correct position when click an anchor': function (browser) {
    const anchor1 = '#anchor'
    const anchor2 = '#anchor-%E8%AE'
    const anchor3 = '#anchor-设置轮播时间间隔'
    const hashOfAnchor3 = '#anchor-%E8%AE%BE%E7%BD%AE%E8%BD%AE%E6%92%AD%E6%97%B6%E9%97%B4%E9%97%B4%E9%9A%94'

    browser
      // save anchor's position
      .getLocation(anchor3, function (result) {
        positionY2 = result.value.y
      })
      // click anchor
      .waitForClick(anchor3)
      .pause(1000)
      // hash changed
      .assert.urlContains(hashOfAnchor3)
      .execute(function () {
        // it should scroll to top
        this.assert.equal(window.MIP.viewport.getScrollTop(), positionY3)
      })
      // save anchor's position
      .getLocation('.encoded-anchor', function (result) {
        positionY2 = result.value.y
      })
      // click anchor
      .waitForClick('.encoded-anchor')
      .pause(1000)
      // hash changed
      .assert.urlContains(anchor2)
      .execute(function () {
        // it should scroll to top
        this.assert.equal(window.MIP.viewport.getScrollTop(), positionY2)
      })
      // save anchor's position
      .getLocation(anchor1, function (result) {
        positionY = result.value.y
      })
      // click anchor
      .waitForClick(anchor1)
      .pause(1000)
      // hash changed
      .assert.urlContains(anchor1)
      .execute(function () {
        // it should scroll to top
        this.assert.equal(window.MIP.viewport.getScrollTop(), positionY)
      })
  },
  'scroll to correct position when refresh': function (browser) {
    browser
      .refresh()
      // hash contains #anchor
      .assert.urlContains('#anchor')
      .pause(1000)
      .execute(function () {
        // it should scroll to top
        this.assert.equal(window.MIP.viewport.getScrollTop(), positionY)
      })
  },
  'open scroll page in iframe': function (browser) {
    browser
      // open index.html
      .url(INDEX_PAGE_URL)
      // open tree.html
      .waitForClick('.scroll-to-anchor-link')
      .enterIframe(SCROLL_PAGE_URL, () => {
        browser
          // click anchor
          .waitForClick('#anchor')
          .pause(1000)
          .execute(function () {
            // it should scroll to top
            this.assert.equal(window.MIP.viewport.getScrollTop(), positionY)
          })
      })
      .end()
  }
}
