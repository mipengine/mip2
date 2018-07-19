# 组件开发说明

## 内置编译工具

mip-cli 的组件编译模块使用 webpack4 实现，内置了以下 loader：

1. vue-loader: 默认将 `.vue` 文件编译成 `.js`，`<style>` 样式部分启用 scoped，往 `<head>` 动态注入样式，`<template>` 模板部分编译生成 render 函数；

2. babel-loader：默认支持所有 ES6 转 ES5，并支持 async/await 的 ES7 语法。注：由于 babel-polyfill 体积过大，因此默认没有开启，请开发者自行在需要 babel-polyfill 的文件地方自行引入相应的 polyfill 文件；

3. css-loader

4. less-loader：默认支持 `.vue` 单文件组件的 style 标签使用 `lang="less"`；

5. postcss-loader：默认支持 css autoprefixer

6. url-loader：默认支持 `.png|.jpg|.jpeg|.gif` 等图片资源和 `.otf|.ttf|eot|svg|woff|woff2` 等字体文件资源的引用，默认小于 1000b 的资源直接生成 base64 字符串。

## 资源引用

### 资源位置

mip-cli 允许开发者引入 npm 包，通过在项目根目录 `npm install --save [包名]` 安装 npm 包，可在组件代码中通过 `import '[包名]'` 或者是 `require('[包名]')` 的方式引入。同时，对于项目中多个组件公用的资源，可以放在 `common` 文件夹中。

### 后缀省略

在进行资源引用的时候，允许省略的后缀有：`.js`、`.json`、`.vue`。

比如 `/common/utils/index.js` 可以简写为 `/common/utils/index` 或 `/common/utils`；

### 别名

对于样式文件里的本地资源引用建议使用绝对路径，默认提供了 `@` 别名指向工程目录，假设项目目录结构为：

```bash
test-proj
... components/
....... mip-example/
........... mip-example.vue
... static/
....... mip.png
... mip.config.js
```

那么 mip-example.vue 文件的 style 标签内引用 mip.png 建议写成：

```html
<style scoped>
  .class-name {
    background: url(~@/static/mip.png);
  }
</style>
```

### 异步加载

`mip-cli@1.0.13` 以上版本支持模块异步加载，可通过 `import()` 或 `require.ensure()` 实现，这两个方法返回 Promise 对象，函数的具体说明可以查看 [webpack dynamic import](https://webpack.js.org/guides/code-splitting/#dynamic-imports)。

以 `import()` 举个例子，假设项目中需要用到 `mustache`，那么可以首先通过 npm 安装：

```shell
npm install --save mustache
```

然后在编写组件代码时可以通过以下方式异步加载：

```javascript
import('mustache').then(function (mustache) {
  // 搞点事情
})
```

对于项目组件需要使用到的一些非 npm 模块，建议放在 `common/` 目录下，这样也可以通过相对路径的形式引入该模块。假设项目目录结构为：

```bash
test-proj
... common/
....... utils.js
... components/
....... mip-example/
........... mip-example.vue
... static/
....... mip.png
... mip.config.js
```

假如需要在 mip-example.vue 中异步加载 utils.js，那么可以这么写：

```javascript
import('../../common/utils').then(function (utils) {
  // 搞点事情
})
```

需要注意的是，模块异步加载应该在组件的生命周期或者方法里调用，而不应该阻塞组件定义。举个例子，假设需要在 mip-example.vue 中异步加载 mustache，那么对应的 js 可以这么写：

```javascript
// 变量缓存
let mustache
// 加载 mustache 的方法
async function getMustache () {
  if (mustache) {
    return mustache
  }

  mustache = await import('mustache')
  return mustache
}

export default {
  // ...
  mounted() {
    getMustache().then(function (mustache) {
      // 搞点事情
    })
  }
}
```

## 沙盒机制

mip 在组件开发的时候限制使用 `window`、`document` 等对象或函数，在组件构建时，会将组件内使用诸如 `document.createElement()` 会被替换成 `mip.sandbox.document.createElement()`，在运行时会限制原有的能力，或者是直接抛出错误。

详情请阅读 [mip 沙盒机制](../util/sandbox.md) 进行了解。
