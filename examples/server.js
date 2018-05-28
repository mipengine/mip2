/**
 * @file examples server using webpack
 * @author wangyisheng@baidu.com (wangyisheng)
 */

const express = require('express');
const rewrite = require('express-urlrewrite');
const proxy = require('http-proxy-middleware');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware')
const WebpackConfig = require('../build/webpack.config.dev');


const app = express();
const path = require('path');

app.use(webpackDevMiddleware(webpack(WebpackConfig), {
    publicPath: '/dist/',
    stats: {
        colors: true,
        chunks: false
    }
}));

app.use(express.static(path.join(__dirname, '../')));

// wecoffee api proxy
app.use('/api/store', proxy({
    target: 'https://weecoffee-lighthouse.oott123.com',
    changeOrigin: true
}));

const port = process.env.PORT || 8080;

module.exports = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}, Ctrl+C to stop`);
  console.log(`View http://localhost:${port}/examples/page/index.html`);
});
