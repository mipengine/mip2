/**
 * @file examples server using webpack
 * @author wangyisheng@baidu.com (wangyisheng)
 */

const express = require('express')
const proxy = require('http-proxy-middleware')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const WebpackConfig = require('../build/webpack.config.dev')
const serveIndex = require('serve-index')

const app = express()
const path = require('path')

process.env.NODE_ENV = 'development'

app.use(webpackDevMiddleware(webpack(WebpackConfig), {
  publicPath: '/dist/',
  stats: {
    colors: true,
    chunks: false
  }
}))

let staticDir = path.join(__dirname, '../')
app.use(
  express.static(staticDir, {
    index: false
  }),
  serveIndex(staticDir, {
    filter: function (file) {
      let extname = path.extname(file)
      return !extname || extname === '.html'
    },
    icons: true
  })
)

// wecoffee api proxy
app.use('/api/store', proxy({
  target: 'https://weecoffee-lighthouse.oott123.com',
  changeOrigin: true
}))

// app.use(express.static(path.join(__dirname, '../')))

const port = process.env.PORT || 8081

module.exports = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}, Ctrl+C to stop`)
  console.log(`View http://localhost:${port}/examples/page/index.html`)
})
