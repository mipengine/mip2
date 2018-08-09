/**
 * @file a simple e2e test case for loading index.html
 * @author panyuqi
 */

module.exports = {
  'open index.html': function (browser) {
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer + '/test/e2e/cases/index.html')
      .assert.title('MIP Index Page')
      .waitForElementVisible('.main-image', 2000)
  },
  'show mip-img': function (browser) {
    browser
      .assert.attributeContains('mip-img > img', 'src', 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3010417400,2137373730&fm=27&gp=0.jpg')
  },
  'show mip-shell header': function (browser) {
    browser
      .assert.elementPresent('.mip-shell-header-wrapper > .mip-shell-header')
      .end()
  }
}
