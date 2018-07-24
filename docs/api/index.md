# API

MIP 提供的 API 主要是由 `MIP` 对象提供给开发者使用的，开发者可以直接通过 `MIP.util` 来调用 API

MIP API 主要包括两个部分

- MIP
- 自定义组件 API

## MIP

`MIP` 对象上挂了很多属性、方法和 Class

- MIP 对象本身
- utils
  - parseCacheUrl & makeCacheUrl & getOriginalUrl
  - fn
  - dom & event & rect & css
  - platform
  - hash
  - EventEmitter
  - Gesture
  - naboo
  - jsonParse
  - customStorage
- viewer & viewport & page & router
- MipShell

[**index.js**](./mip.md)

MIP 的入口文件，对外暴露 MIP 对象

## util/

[**index.js**](./util/index.md)

工具库的入口文件，除了暴露了 `fn` `dom` 等其他的工具库外，本身还提供了 `parseCacheUrl` 和 `makeCacheUrl` 函数

[**fn.js**](./util/fn.md)
