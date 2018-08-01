/**
 * @file multi-page e2e test case (standalone 模式)
 * @author panyuqi
 * @description 测试流程：
 * 1. 打开 index.html
 * 2. 点击 <a mip-link href="./tree.html"> 创建 iframe
 * 3. 点击 <a mip-link href="./data.html"> 创建 iframe
 * 3. 浏览器后退 回到 tree.html
 * 4. 浏览器后退 回到 index.html
 * 5. 点击 <a mip-link href="./tree.html"> 创建新 iframe
 * 6. 点击 <a mip-link href="./index.html"> 创建新 iframe
 */

let INDEX_PAGE_URL
let DATA_PAGE_URL
let TREE_PAGE_URL

module.exports = {
  'open index.html': function (browser) {
    INDEX_PAGE_URL = `${browser.globals.devServerURL}/test/e2e/cases/index.html`
    DATA_PAGE_URL = `${browser.globals.devServerURL}/test/e2e/cases/data.html`
    TREE_PAGE_URL = `${browser.globals.devServerURL}/test/e2e/cases/tree.html`

    browser
      // open index.html
      .url(INDEX_PAGE_URL)

      // show mip-shell
      .waitForElementVisible('.mip-shell-header-title', 3000)
      .assert.containsText('.mip-shell-header-title', 'MIP')
  },
  'click a <mip-link> and goto tree.html': function (browser) {
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

      // hide elements in root page except for <mip-shell>
      .assert.hidden('.tree-link')
      .assert.hidden('.main-image')
      .assert.visible('.mip-shell-header-wrapper > .mip-shell-header')
  },
  'click a <mip-link> and goto data.html': function (browser) {
    browser
      .enterIframe(TREE_PAGE_URL, () => {
        browser
          .waitForElementVisible('mip-page-tree', 3000)
          .waitForClick('a[href="./data.html"]')
      })

      // there're 2 iframes now
      .assert.elementCount('iframe', 2)
      .assert.visible(`iframe[data-page-id*="${DATA_PAGE_URL}"]`)
      .assert.hidden(`iframe[data-page-id*="${TREE_PAGE_URL}"]`)
      .assert.visible('.mip-shell-header-wrapper > .mip-shell-header')

      .enterIframe(DATA_PAGE_URL, () => {
        browser.waitForElementVisible('mip-data', 3000)
      })
  },
  'go back to tree.html': function (browser) {
    browser
      .back()
      // URL changed
      .assert.urlEquals(TREE_PAGE_URL)

      .assert.elementCount('iframe', 2)
      .assert.visible(`iframe[data-page-id*="${TREE_PAGE_URL}"]`)
      .assert.hidden(`iframe[data-page-id*="${DATA_PAGE_URL}"]`)
      .assert.visible('.mip-shell-header-wrapper > .mip-shell-header')
  },
  'go back to index.html': function (browser) {
    browser
      .waitForClick('.back-button')
      // URL changed
      .assert.urlEquals(INDEX_PAGE_URL)

      // hide all iframes
      .assert.elementCount('iframe', 2)
      .assert.hidden(`iframe[data-page-id*="${TREE_PAGE_URL}"]`)
      .assert.hidden(`iframe[data-page-id*="${DATA_PAGE_URL}"]`)

      // show root page(index.html)
      .assert.visible('.main-image')
      .assert.visible('mip-page-index')
      .assert.visible('.mip-shell-header-wrapper > .mip-shell-header')
  },
  'recreate an iframe contains tree.html': function (browser) {
    browser
      .waitForElementVisible('.tree-link', 3000)
      // open tree.html
      .waitForClick('.tree-link')

      // URL changed
      .assert.urlEquals(TREE_PAGE_URL)

      .enterIframe(TREE_PAGE_URL, () => {
        browser.waitForElementVisible('mip-page-tree', 3000)
      })

      // hide elements in root page
      .assert.elementCount('iframe', 2)
      .assert.visible(`iframe[data-page-id*="${TREE_PAGE_URL}"]`)
      .assert.hidden(`iframe[data-page-id*="${DATA_PAGE_URL}"]`)
      .assert.hidden('.tree-link')
      .assert.hidden('.main-image')
  },
  'recreate an iframe contains index.html': function (browser) {
    browser
      .enterIframe(TREE_PAGE_URL, () => {
        browser.waitForElementVisible('mip-page-tree', 3000)
        browser.waitForClick('a[href="./index.html"]')
      })

      // create a new iframe for index.html
      .assert.elementCount('iframe', 3)
      .assert.visible(`iframe[data-page-id*="${INDEX_PAGE_URL}"]`)
      .assert.hidden(`iframe[data-page-id*="${TREE_PAGE_URL}"]`)
      .assert.hidden(`iframe[data-page-id*="${DATA_PAGE_URL}"]`)

      // delete elements in root page except for <mip-shell>
      .assert.elementNotPresent('.tree-link')
      .assert.elementNotPresent('.main-image')
      .assert.elementNotPresent('mip-page-index')

      .enterIframe(INDEX_PAGE_URL, () => {
        browser
          .assert.elementPresent('.tree-link')
          .assert.elementPresent('.main-image')
          .assert.elementPresent('mip-page-index')
      })
      .end()
  }
}
