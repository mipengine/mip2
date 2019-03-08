# MIP 组件资源管理

这篇文章主要介绍在开发 MIP 组件时样式资源的引入、静态资源（如图片、字体文件、SVG等等）的使用、第三方库引入等方面的管理方案。

## 样式资源引入

MIP CLI 内置了以下 Loader 辅助组件开发者进行样式开发：

1. less-loader
2. postcss-loader
  1. autoprefixer
3. css-loader

因此开发者可以使用 LESS 写样式，并且在开发时不需要在意部分浏览器私有属性的优雅降级问题，编译时会通过 autoprefixer 进行自动补全。写好的样式资源只需要在组件入口文件通过相对路径 `import` 的方式引入即可，css-loader 会自动生成 style 标签将样式注入到网页当中：

```js
import('./mip-example.less')
```

## 静态资源引入

MIP CLI 内置了 Webpack 的相关静态资源的 url-loader 来确保一些常用的静态资源的使用，目前支持的静态资源包括：

1. `.png`、`.jpg`、`.jpeg`、`.gif` 为后缀的图片资源
2. `.otf`、`.ttf`、`.svg`、`.woff`、`woff2` 等字体文件的字体资源

这些静态资源可以在 CSS（CSS/LESS）代码里通过 `url()` 函数引入，也可以在 JS 代码里通过 `import` 的方式引入。引入的路径要求必须为**相对路径**，相应的引入方法如下所示：

CSS 引入

```css
.wrapper {
  background: url(../../static/test.png);
}
```

JS 引入

```js
import img from '../../static/test.png'
```

当这个 test.png 大于 1000b（约为 1kb）时，img 返回的值为图片经过编译重命名之后的可访问 URL，小于 1kb 时直接返回的 base64 字符串。

这些静态资源文件在 mip2-extensions 组件仓库当中需要按照一定的规则放置：

1. 当这些静态资源存在多个组件共用的情况，需要放置在仓库根目录下的 `static` 目录当中；
2. 当静态资源仅有单个组件使用，可以直接放置在组件目录下的 static 文件夹当中 `components/[组件名]/static`。

## 第三方库引入

### npm 安装

MIP 建议通过 npm 包的形式引入第三方库，比如项目中需要使用 lodash，那么需要在项目目录下通过 `npm install` 进行安装：

```shell
npm install --save lodash
```

这些 npm 包一定要通过 `--save` 参数将组件安装到 `dependencies` 中，MIP 组件在上线的时候只会通过 `npm install --production` 进行依赖安装。然后在项目里 `import` 相应的包名即可：

```js
import _ from 'lodash'
```

对于通过 npm 安装的第三方库存在以下限制：

1. 包名必须在 MIP 所规定的白名单内；
2. 第三方库必须为 esModule、CommonJS、AMD 的模块，UMD 和 IIFE 定义的模块无法正常使用；

MIP 必须严格把控组件编写质量，因此也需要对第三方库的使用采用白名单的方式进行限制，只有经过 MIP 认可的第三方库才能够安装使用。在通过 MIP CLI 启动开发模式的情况下，CLI 工具会动态监听 package.json 文件的改动并且判断当前使用的第三方库是否在白名单中，如果不存在，则会在控制台打印 WARNING 进行提示，如下图所示（假设开发者安装了一个名叫 `the-answer` 的第三方库）：

![npm whitelist warning](https://gss0.baidu.com/9rkZbzqaKgQUohGko9WTAnF6hhy/assets/mip2/docs/the-answer-a29a059f.png)

这时组件开发者需要考虑更换符合要求的第三方库或者是向 MIP 工作组提交 npm 白名单申请，申请的地址为：[https://github.com/mipengine/mip2/issues/new?template=npm_whiltelist_request.md](https://github.com/mipengine/mip2/issues/new?template=npm_whiltelist_request.md)，开发者需要按照格式填写相应内容并且说明清楚该 npm 包的必要性。

### common 文件夹

除开 npm 安装之外，MIP 在组件仓库目录下提供了 `common` 文件夹来放置一些不经过 npm 安装的第三方库，比如 echarts 的在线定制版本等等。

但需要注意的是，由于 common 文件夹放置的就是第三方库的源码，开发者是拥有修改这些文件的能力的，因此 common 文件夹下的第三方库文件也需要经过代码规范检查、沙盒检查与注入等处理。因此 MIP 并不推荐这种引入第三方库的方案。

假如组件开发必须通过 common 文件夹的方式引入第三方组件，那么在组件代码中直接通过相对路径进入即可：

```js
import echarts from '../../common/echarts'
```













