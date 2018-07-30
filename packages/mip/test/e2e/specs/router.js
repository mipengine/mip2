/**
 * @file router e2e test case (standalone 模式)
 * @author panyuqi
 * @description 测试流程：
 * 1. 打开 index.html
 * 2. 点击 <a mip-link href="./tree.html"> 创建 iframe
 * 3. 浏览器后退 回到 index.html
 * 4. 浏览器前进 回到 tree.html
 * 5. 调用page.back 回到 index.html
 * 6. 调用page.forward 回到 tree.html
 * 7. 在当前页面刷新
 * 8. 点击 返回按钮 创建 iframe 后退到 index.html
 */

let INDEX_PAGE_URL
let TREE_PAGE_URL

module.exports = {
  'open first page': function (browser) {
    INDEX_PAGE_URL = `${browser.globals.devServerURL}/test/e2e/cases/index.html`
    TREE_PAGE_URL = `${browser.globals.devServerURL}/test/e2e/cases/tree.html`

    browser
      // open index.html
      .url(INDEX_PAGE_URL)

      // show mip-shell
      .waitForElementVisible('.mip-shell-header-title', 3000)
      .assert.containsText('.mip-shell-header-title', 'MIP')
  },
  'click a <mip-link>': function (browser) {
    browser
      // open tree.html
      .waitForClick('.tree-link')

      // URL changed
      .assert.urlEquals(TREE_PAGE_URL)

      // mip header's title changed
      .assert.containsText('.mip-shell-header-title', 'MIP Tree')

      // create a new <iframe>
      .assert.elementPresent('iframe')
      .assert.elementCount('iframe', 1)
      .assert.visible('iframe')
      .assert.attributeContains('iframe', 'data-page-id', TREE_PAGE_URL)
      .assert.attributeContains('iframe', 'src', TREE_PAGE_URL)
      .assert.attributeContains('iframe', 'name', '{"standalone":true,"isRootPage":false,"isCrossOrigin":false}')
      .enterIframe(TREE_PAGE_URL, () => {
        browser.waitForElementVisible('mip-page-tree', 3000)
      })

      // hide elements in root page
      .assert.hidden('.tree-link')
      .assert.hidden('.main-image')
  },
  'router back': function (browser) {
    browser
      .back()
      // URL changed
      .assert.urlEquals(INDEX_PAGE_URL)
      .assert.containsText('.mip-shell-header-title', 'MIP')

      // hide iframe
      .assert.hidden('iframe')

      // show root page
      .assert.visible('.tree-link')
      .assert.visible('.main-image')
  },
  'router forward': function (browser) {
    browser
      .forward()
      // URL changed
      .assert.urlEquals(TREE_PAGE_URL)
      .assert.containsText('.mip-shell-header-title', 'MIP Tree')

      // show iframe
      .waitForElementVisible('iframe', 3000)
      .enterIframe(TREE_PAGE_URL, () => {
        browser.waitForElementVisible('mip-page-tree', 3000)
      })

      // hide root page
      .assert.hidden('.tree-link')
      .assert.hidden('.main-image')
  },
  'page back': function (browser) {
    browser
      .enterIframe(TREE_PAGE_URL, () => {
        browser.waitForElementVisible('mip-page-tree', 3000)
        browser.waitForClick('.page-back')
      })

    browser
      .waitForElementVisible('.tree-link', 3000)
      // URL changed
      .assert.urlEquals(INDEX_PAGE_URL)
      .assert.containsText('.mip-shell-header-title', 'MIP')

      // hide iframe
      .assert.hidden('iframe')

      // show root page
      .assert.visible('.tree-link')
      .assert.visible('.main-image')
  },
  'page forward': function (browser) {
    browser
      // open tree.html
      .waitForClick('.page-forward')
      .waitForElementVisible(`.mip-page__iframe[data-page-id="${TREE_PAGE_URL}"]`, 3000)
      // URL changed
      .assert.urlEquals(TREE_PAGE_URL)
      .assert.containsText('.mip-shell-header-title', 'MIP Tree')

      // show iframe
      .waitForElementVisible('iframe', 3000)
      .enterIframe(TREE_PAGE_URL, () => {
        browser.waitForElementVisible('mip-page-tree', 3000)
      })

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
      .waitForClick('.back-button')
      // URL changed
      .assert.urlEquals(INDEX_PAGE_URL)
      .assert.containsText('.mip-shell-header-title', 'MIP')

      // open an iframe which contains index.html
      .waitForElementVisible('iframe', 3000)
      .assert.attributeContains('iframe', 'data-page-id', INDEX_PAGE_URL)
      .assert.attributeContains('iframe', 'src', INDEX_PAGE_URL)
      .assert.attributeContains('iframe', 'name', '{"standalone":true,"isRootPage":false,"isCrossOrigin":false}')
      .enterIframe(INDEX_PAGE_URL, () => {
        browser.waitForElementVisible('.main-image', 3000)
      })

      // hide root page(tree.html)
      .assert.hidden('mip-page-tree')
      .end()
  }
}
