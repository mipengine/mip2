/**
 * @file history e2e test case (standalone 模式)
 * @author panyuqi
 * @description 测试流程：
 * 1. 打开 index.html
 * 2. 点击 <a mip-link href="./tree.html"> 创建 iframe
 * 3. 浏览器后退 回到 index.html
 * 4. 浏览器前进 回到 tree.html
 * 5. 在当前页面刷新
 * 6. 点击 返回按钮 创建 iframe 后退到 index.html
 */

module.exports = {
  'open first page': function (browser) {
    browser
      // open index.html
      .url(`${browser.globals.devServerURL}/examples/page/index.html`)

      // show mip-shell
      .waitForElementVisible('.mip-shell-header-title', 3000)
      .assert.containsText('.mip-shell-header-title', 'MIP')
  },
  'click a <mip-link>': function (browser) {
    browser
      .waitForElementVisible('.tree-link', 3000)
      // open tree.html
      .click('.tree-link')

      // URL changed
      .assert.urlEquals(`${browser.globals.devServerURL}/examples/page/tree.html`)

      // mip header's title changed
      .assert.containsText('.mip-shell-header-title', 'MIP Tree')

      // create a new <iframe>
      .assert.elementPresent('iframe')
      .assert.elementCount('iframe', 1)
      .assert.visible('iframe')
      .assert.attributeContains('iframe', 'data-page-id', `${browser.globals.devServerURL}/examples/page/tree.html`)
      .assert.attributeContains('iframe', 'src', `${browser.globals.devServerURL}/examples/page/tree.html`)
      .assert.attributeContains('iframe', 'name', '{"standalone":true,"isRootPage":false,"isCrossOrigin":false}')

      // hide elements in root page
      .assert.hidden('.tree-link')
      .assert.hidden('.main-image')
  },
  'history back': function (browser) {
    browser
      .back()
      // URL changed
      .assert.urlEquals(`${browser.globals.devServerURL}/examples/page/index.html`)
      .assert.containsText('.mip-shell-header-title', 'MIP')

      // hide iframe
      .assert.hidden('iframe')

      // show root page
      .assert.visible('.tree-link')
      .assert.visible('.main-image')
  },
  'history forward': function (browser) {
    browser
      .forward()
      // URL changed
      .assert.urlEquals(`${browser.globals.devServerURL}/examples/page/tree.html`)
      .assert.containsText('.mip-shell-header-title', 'MIP Tree')

      // show iframe
      .assert.visible('iframe')

      // hide root page
      .assert.hidden('.tree-link')
      .assert.hidden('.main-image')
  },
  'refresh browser': function (browser) {
    browser
      .refresh()
      // show tree.html
      .waitForElementVisible('mip-page-tree', 3000)
      .assert.elementCount('iframe', 0)
      .assert.elementNotPresent('iframe')
  },
  'go back by clicking the `Back` button in mip header': function (browser) {
    browser
      .click('.back-button')
      // URL changed
      .assert.urlEquals(`${browser.globals.devServerURL}/examples/page/index.html`)
      .assert.containsText('.mip-shell-header-title', 'MIP')

      // open an iframe which contains index.html
      .waitForElementVisible('iframe', 3000)
      .assert.attributeContains('iframe', 'data-page-id', `${browser.globals.devServerURL}/examples/page/index.html`)
      .assert.attributeContains('iframe', 'src', `${browser.globals.devServerURL}/examples/page/index.html`)
      .assert.attributeContains('iframe', 'name', '{"standalone":true,"isRootPage":false,"isCrossOrigin":false}')

      // hide root page(tree.html)
      .assert.hidden('mip-page-tree')
      .end()
  }
}
