/**
 * @file mip页面项目配置项
 * @author
 */

module.exports = {

  dev: {
    /**
     * 启动mip server调试的端口号
     *
     * @type {number}
     */
    port: 8111,

    /**
     * 启用调试页面自动刷新
     *
     * @type {boolean}
     */
    livereload: false,

    /**
     * server 启动自动打开页面
     *
     * @type {boolean}
     */
    autooopen: false
  },

  build: {
    proxy: {
      'http://www.baidu.com/**': function (str) {
        return str.replace('http://www.baidu.com', '/proxy-to-local-path')
      }
    }
  }
}
