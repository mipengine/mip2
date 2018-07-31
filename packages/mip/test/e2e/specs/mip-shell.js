/**
 * @file mip-shell e2e test case (standalone 模式)
 * @author panyuqi
 * @description 测试流程：
 * 1. 打开 index.html
 * 2. 点击右上角 “更多” 按钮，展现 mask 和底部菜单
 * 3. 点击底部菜单 “取消” 按钮，隐藏 mask
 * 4. 重新展现 mask 和底部菜单
 * 5. 点击 mask，隐藏底部菜单
 */

module.exports = {
  'open index.html and click `More` button': function (browser) {
    const INDEX_PAGE_URL = `${browser.globals.devServerURL}/test/e2e/cases/index.html`

    browser
      // open index.html
      .url(INDEX_PAGE_URL)

      // show mip-shell header
      .waitForElementVisible('.mip-shell-header', 3000)

      // click `More` button
      .waitForClick('.mip-shell-header-button-group-standalone.more')

      // show mask
      .assert.visible('.mip-shell-more-button-mask')

      // show bottom buttons
      .assert.visible('.mip-shell-more-button-wrapper')
      .assert.visible('div[data-button-name="subscribe"]')
      .assert.visible('div[data-button-name="chat"]')
      .assert.visible('div[data-button-name="cancel"]')
  },
  'click `Cancel` button and close mask & button group': function (browser) {
    browser
      .waitForClick('div[data-button-name="cancel"]')
      // hide mask
      .assert.hidden('.mip-shell-more-button-mask')

      // hide bottom buttons
      .assert.hidden('.mip-shell-more-button-wrapper')
  },
  'click mask and close mask & button group': function (browser) {
    browser
      // click `More` button
      .waitForClick('.mip-shell-header-button-group-standalone.more')
      // show mask
      .assert.visible('.mip-shell-more-button-mask')

      // show bottom buttons
      .assert.visible('.mip-shell-more-button-wrapper')

      // click `More` button
      .waitForClick('.mip-shell-more-button-mask')

      // hide mask
      .assert.hidden('.mip-shell-more-button-mask')

      // hide bottom buttons
      .assert.hidden('.mip-shell-more-button-wrapper')
      .end()
  }
}
