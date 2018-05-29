# deps 目录说明

deps 目录均为第三方引用的 lib

有些 lib 有一些业务上的修改无法兼容，因此直接将源代码拷贝至此，而非通过 npm 来管理

## fetch

源文件：https://github.com/github/fetch/blob/master/fetch.js

主要修改点在于增加了 QQ 浏览器的判断，因为 QQ 浏览器的早起版本 fetch 实现有问题，发送请求会漏掉 cookie，因为在 QQ 浏览器中也通过 polyfill 的方式覆盖 fetch
