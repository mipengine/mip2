/**
 * @file e2e test case for page API
 * @author wangyisheng@baidu.com (wangyisheng)
 */
let INDEX_PAGE_URL
let API_PAGE_URL

module.exports = {
  'open api.html and togglePageMask': function (browser) {
    INDEX_PAGE_URL = `${browser.globals.devServerURL}/test/e2e/cases/index.html`
    API_PAGE_URL = `${browser.globals.devServerURL}/test/e2e/cases/api.html`

    browser
      // open api.html
      .url(API_PAGE_URL)
      // click togglePageMask button
      .waitForClick('.toggle-page-mask', 3000)

      // MoreButtonWrapper & mask should not display in root page
      .assert.hidden('.mip-shell-more-button-mask')
      .assert.hidden('.mip-shell-more-button-wrapper')
      .assert.hidden('div[data-button-name="subscribe"]')
      .assert.hidden('div[data-button-name="chat"]')
      .assert.hidden('div[data-button-name="cancel"]')
  },
  'open index.html and jump to api.html': function (browser) {
    browser
      .url(INDEX_PAGE_URL)
      .waitForClick('.api-link', 3000)
      .assert.urlEquals(API_PAGE_URL)
  },
  'togglePageMask true': function (browser) {
    browser
      .enterIframe(API_PAGE_URL, () => {
        browser.waitForClick('.toggle-page-mask')
      })
      // show header mask
      .assert.visible('.mip-shell-header-mask')
  },
  'togglePageMask false': function (browser) {
    browser
      .enterIframe(API_PAGE_URL, () => {
        browser.waitForClick('.toggle-page-mask')
      })
      // hide header mask
      .assert.hidden('.mip-shell-header-mask')
  },
  'toggleDropdown true': function (browser) {
    browser
      .enterIframe(API_PAGE_URL, () => {
        browser.waitForClick('.toggle-drop-down')
      })
      // show more button
      .assert.visible('.mip-shell-more-button-mask')
      .assert.visible('.mip-shell-more-button-wrapper')
      .assert.visible('div[data-button-name="subscribe"]')
      .assert.visible('div[data-button-name="chat"]')
      .assert.visible('div[data-button-name="cancel"]')
  },
  'toggleDropdown false': function (browser) {
    browser
      .enterIframe(API_PAGE_URL, () => {
        browser.waitForClick('.toggle-drop-down')
      })
      // hide more button
      .assert.hidden('.mip-shell-more-button-mask')
      .assert.hidden('.mip-shell-more-button-wrapper')
      .assert.hidden('div[data-button-name="subscribe"]')
      .assert.hidden('div[data-button-name="chat"]')
      .assert.hidden('div[data-button-name="cancel"]')
      .end()
  }

}
