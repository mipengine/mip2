/**
 * @file examples server
 * @author wangyisheng@baidu.com (wangyisheng)
 */

const express = require('express');
const rewrite = require('express-urlrewrite');

const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, '../')));

const port = process.env.PORT || 8080
module.exports = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}, Ctrl+C to stop`);
  console.log(`View http://localhost:${port}/examples/page/index.html`);
});
