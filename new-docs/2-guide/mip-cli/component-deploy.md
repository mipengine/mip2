# 组件部署

> 通常情况下，组件开发者是不需要进行部署工作的，因为最终的构建部署上线工作都是 MIP 官方完成。
> 但如果你是一名 MIP 组件测试工程是，在组件提交到 MIP 组件平台之前进行部署测试的话，还是需要对组件部署有一定的了解。

## 构建

### 构建命令

mip-cli 提供了 `build` 命令可以对 mip 组件项目进行打包构建。

```shell
$ mip2 build
```

#### 使用方式

该命令会将 `/comoponents` 目录下的下的 mip 组件进行编译，编译成功后会在 `/components` 同级目录生成一个包含所有构建后资源产物的 `/dist` 目录，如果需要将组件代码部署到指定的静态资源服务器进行测试，只需要将 `/dist` 内容部署到静态资源服务器即可。

#### dist 目录

在组件仓库项目的根目录执行了 `mip2 build` 命令之后，会在组件仓库项目根目录会生成一个 `/dist` 目录，`/dist` 目录的内容基本和 `/components` 目录的内容一一对应：

```shell
# dist 目录的示例
dist/
  |_ mip-demo-components1/
      |_ mip-demo-components1.js
  |_ mip-demo-components2/
      |_ mip-demo-components2.js
  |_ mip-components-webpack-helpers.js
```

这个 `/dist` 目录可以用来被部署到静态资源服务器，如 mip 线上部署 `/dist` 的静态资源服务器路径为 `https://m.mipcdn.com/static/v2/`，如果你是一名 mip 组件测试工程师，你就需要在提交组件仓库到 mip 官方上线之前，将 `/dist` 部署到自己的静态资源服务器相应的路径进行测试。

#### 参数说明

通过 `mip2 build -h` 命令可以查看构建命令的用法：

```shell
Usage: mip2-build [options]

  Options:

    -a, --asset <value>   静态资源 publicPath
    -o, --output <value>  编译代码输出路径
    -c, --clean           构建前先清空输出目录
    -i, --ignore          忽略沙盒注入
    -h, --help            output usage information
```

##### asset

`asset` 是一个指定静态资源 publicPath 的参数，为了让你在开发组件的时候可以直接通过相对路径的方式引入本地的静态资源，例如图片、字体文件、异步加载 js 文件等，默认的 `asset` 的值为 `/`。

为了更好的讲解清楚 `asset` 参数的作用，我们给一个具体的示例，假设 mip 组件项目的 `mip-demo-components` 组件源代码如下：

```shell
# mip 的组件代码仓库目录的部分结构
components/
  |_ mip-demo-components/
       |_ localpath-image.png
       |_ mip-demo-components.vue
```

如果在 `mip-demo-components.vue` 中的 `<style>` 中的某个样式使用了相对路径的静态资源的话：

```less
.bg-box {
    background: url(./localpath-image.png)
}
```

在执行 `mip2 build` 命令之后，`/dist` 文件夹下的代码目录结构为：

```shell
# 构建后的 dist 目录的部分结构
dist/
  |_ mip-demo-components/
       |_ localpath-image.png
       |_ mip-demo-components.js

```

如果你的组件被部署到的静态资源服务器路径为：`https://www.testcdn.com/static/mip-demo-components/mip-demo-components.js`
如果不指定 asset 参数进行构建的话，构建出的 css 代码为：

```css
.bg-box {
    background: url(./localpath-image.png);
}
```

这样组件在被 mip 站点使用的时候，相对路径是相对于访问 mip 页面的 url 的路径，假如 mip 页面的 url 为 `https://www.mippage.com/testpath/test.html`, 那在运行的时候会发现报错， `https://www.mippage.com/testpath/localpath-image.png` 404 NOT FOUND。

其实我们预期的 `localpath-image.png` 这个静态资源的 url 是 `https://www.testcdn.com/static/mip-demo-components/localpath-image.png`，所以这时候我们必须要借助于 `asset` 参数来指定 publicPath，从而指定正确的静态资源路径，具体用法如下：

```shell
mip2 build --asset https://www.testcdn.com/static/
# 或者可以使用 -a 简写
mip2 build -a https://www.testcdn.com/static/
```

只要将 `asset` 的值指定为 `/dist` 目录将要部署的静态资源目录，在我们这个示例中是将 `/dist` 目录部署到了 `https://www.testcdn.com/static/`，这时候我们会发现，构建出的 css 代码变成了绝对路径了：

```css
.bg-box {
    background: url(https://www.testcdn.com/static/mip-demo-components/localpath-image.png);
}
```

> 注意：
>
> 为了保证每次构建不会出现静态资源 NOT FOUND 的问题，在执行 `mip2 build` 命令的时候必须加上 `asset` 参数，毕竟你不知道到底仓库中哪个组件用了相对路径引入了静态资源。

##### output

默认情况下构建的产物会放在项目根目录的 `/dist` 目录，如果想要构建到别的目录，可以通过 `output` 参数进行指定，值为规范的 path 路径即可。

##### clean

`clean` 默认不指定值为 `false`，当指定参数后值为 `true`

- 如果为 `false`，在构建之前不会清空 `/dist` 目录，会在每次构建之后替换掉之前同名的文件。
- 如果为 `true`，在构建之前先清空 `/dist` 目录，然后再生成所有的构建后文件。

##### ignore

`ignore` 参数是为了忽略 mip 的沙盒规则的参数，默认值为 `false`，当不指定 `ignore` 的时候，组件的代码会有 mip 安全[沙盒限制](../component/sandbox.md)，用来保证组件代码不会对 mip 页面产生负面影响，如果设置了 `ignore` 参数为 `true`，就不会对组件的代码做任何的沙盒安全处理。

> 注意：
>
> 不建议使用此参数对沙盒验证进行忽略，不然就算代码测试通过也不会被 mip 官方上线。

### mip-components-webpack-helpers

你可能发现 mip 站点都会加载一个 `mip-components-webpack-helpers.js`，也许对这个文件有很多的疑问，由于 mip 的组件都是单独构建的，这样的话会导致组件构建后的文件有很多冗余的重复代码，`mip-components-webpack-helpers.js` 是为了把所有组件用到的重复的代码进行了整理封装，这样就能大大减少每个组件构建后的代码体积。

所有构建后的组件的代码都会在正式运行前去异步的去加载这个 `mip-components-webpack-helpers.js` 用来引入组件公共的工具模块， 所以如果查看构建后的组件代码会发现每个组件都会通过 amd 的方式引入这个 js。

```js
(function () {
    require.config({
        paths: {
            mipComponentsWepackHelpers: "https://c.mipcdn.com/static/v2/mip-components-webpack-helpers"
        }
    });
    require(['mipComponentsWepackHelpers'], function (__mipComponentsWebpackHelpers__) {
        /* 正常的 mip 组件逻辑 */
    });
}());
```

## mip.config.js

每次都要敲一大堆参数也许会给你的部署工作带来困扰，mip-cli 提供了一个配置文件，只要配置了一次 `build` 属性，后续只需要简单的使用 `mip2 build` 命令就可以完成正确的构建工作：

```js
// mip.config.js
module.exports = {
  dev: {
      // ...
  },
  build: {
    asset: 'https://www.testcdn.com/static/',
    clean: true
  }
}

```
