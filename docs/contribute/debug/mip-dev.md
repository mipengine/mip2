# 基于 MIP CLI 开发调试组件

MIP CLI 提供了调试服务器来方便组件开发者开发与调试组件。

## 启动调试服务器

对于官方组件（mip2-extensions）开发者，首先我们需要在命令行窗口 cd 到 mip2-extensions 的根目录下，通过如下命令启动调试服务器：

```shell
mip2 dev -i
```

对于第三方站长组件（mip2-extensions-platform）开发者，需要 cd 到各自站点的目录下（`sites/[站点名]`）通过以下命令启动调试服务器：

```shell
mip2 dev
```

在启动调试服务器前，首先会检查当前最新的 MIP CLI 版本，当前版本过老时，会在命令行窗口打印如下提示：

![版本过低提示](https://gss0.baidu.com/9rkZbzqaKgQUohGko9WTAnF6hhy/assets/mip2/docs/too-old-a9fcbcba.png)

开发者在看到这个版本过低的提示时，建议最好顺手将 CLI 工具升级一下，因为组件在提交上线的时候会拉最新版本的 MIP CLI 进行代码编译，保持 CLI 工具为最新版本能够保证开发与编译上线时组件代码的一致性。

调试服务器启动完成，命令行窗口会打印如下提示：

![命令行启动完毕](https://gss0.baidu.com/9rkZbzqaKgQUohGko9WTAnF6hhy/assets/mip2/docs/mip2-dev-start-6b55f270.png)

默认参数条件下启动调试服务器，默认监听的 8111 端口，在浏览器访问 `127.0.0.1:8111` 可以直接在页面上访问到组件仓库目录，如下图所示：

![组件目录预览](https://gss0.baidu.com/9rkZbzqaKgQUohGko9WTAnF6hhy/assets/mip2/docs/localhost-look-26156466.png)

可以通过点击对应的目录打开组件示例进行功能预览和调试，比如点击 components - mip-accordion - example - mip-accordion1.html，就可以打开对应的示例页面：

![组件示例](https://gss0.baidu.com/9rkZbzqaKgQUohGko9WTAnF6hhy/assets/mip2/docs/accordion-example-621d3e09.png)

如果组件开发者需要在实际的网站项目里面调试 MIP 组件，那么只需要在网站项目生成的 HTML 页面底部通过增加以下 script 标签引入：

 ```html
 <script src="http://127.0.0.1/mip-accordion/mip-accordion.js"></script>
 ```

这样就能够在实际的项目里面使用这个开发中的 MIP 组件来进行调试了！

### mip2 dev 参数说明

在启动调试服务器的时候，我们可以传入以下参数（部分）：

```
-p, --port <n>        启动端口号，默认为 8111
-l, --livereload      启动组件示例页面自动刷新，默认为 true
-a, --asset <value>   静态资源的 publicPath，默认为 http://127.0.0.1
-i, --ignore <value>  忽略沙盒注入，默认为 false，即对代码进行沙盒注入
```

下面对这些参数做个说明：

#### port

指定启动端口号。例如：

```shell
mip2 dev -p 8848
```

#### livereload

在使用组件示例进行代码调试的时候，MIP CLI 会默认在组件示例的页面注入页面自动刷新的脚本代码，方便开发者在调试过程中只需要修改好组件代码并且保存，浏览器打开的网页就会自动刷新并获取到最新修改并且编译好的组件代码。通过以下命令可关闭自动刷新：

```shell
mip2 dev -l false
```

#### asset

对于需要在调试过程中将组件示例页面分享给其他人，或者是网站项目开发服务器与组件开发服务器不在同一台机器上，那么需要在启动调试服务器的时候通过传入 asset 参数指定当前 IP。假设当前 MIP 组件开发的机器局域网 IP 为 `192.168.0.23`，开发者想要把当前的 mip-accordion 组件的示例分享给同一局域网下的其他同学，那么在启动的时候需要这么指定 asset 参数：

```shell
mip2 dev -a http://192.168.0.23
```

这样其他同学才能够通过 `http://192.168.0.23:8111/components/mip-accordion/example/mip-accordion1.html` 这样的链接访问到 mip-accordion 的示例页面。

在这里简单解释一下原因，就是组件所依赖的外部资源（比如大图、字体文件、异步加载的 JS 模块），这些外部资源的 URL 如果缺少 hostname，那么会获取当前的 HTML 页面的 URL hostname 进行补全。举个例子，比如 HTML 页面内容如下所示：

```html
<!DOCTYPE html>
<html>
<head>
  <title></title>
</head>
<body>
  <script src="http://192.168.0.23/mip-accordion/mip-accordion.js"></script>
</body>
</html>
```

假设这个页面的 URL 为 `http://192.168.11.23`，这个 mip-accordion 组件依赖了一张图片 `/img/test.png`，这个图片 URL 缺少 hostname 和 port，那么图片的 URL 就会被浏览器默认补全为：`http://192.168.11.23/img/test.png`，这明显是错的。

因此 MIP CLI 在处理组件的外部资源依赖的时候，都会对这些 URL 进行补全，因此需要 asset 参数来指定补全的 hostname。

#### ignore

大家可能注意到了再开发官方组件和开发第三方站长组件的时候在启动命令上存在一个 `-i` 参数的区别。这是因为官方组件在代码提交的时候，会经过 MIP 项目组仔细并且严格的代码 review，因此在开发的时候允许使用全量的 JS 原生 API 和 MIP API；而站长组件则只能使用白名单上的 MIP API 和 JS 原生 API 在一定程度上来确保开发出来的组件的性能。

白名单通过 mip-sandbox 这个模块来进行维护，一般来说白名单上提供的函数基本上满足了组件开发的需求，开发者只需正常开发即可，一旦使用到了白名单之外的 API 或者对象，会在控制台提示报错，并且在运行组件的时候，对应的方法会返回 undefined。这时开发者可以考虑更换其他的实现方式。如果必须使用这个 API 或者对象，则需要向 MIP 项目组进行白名单申请：[https://github.com/mipengine/mip2/issues/new?template=feature_request.md](https://github.com/mipengine/mip2/issues/new?template=feature_request.md)。

关于白名单和 mip-sandbox 的相关内容，可以参考 mip-sandbox 主页 [https://www.npmjs.com/package/mip-sandbox](https://www.npmjs.com/package/mip-sandbox)，或者是查看沙盒注入相关的文章。

除了在开发过程中 MIP CLI 提供的调试服务器会时时监控组件修改并校验组件是否满足组件规范之外，还可以通过 `mip2 validate -c ./components` 。在下一篇组件校验的文章里面会专门对 `mip2 validate` 命令做更为详细的说明。

### mip.config.js

在组件仓库根目录下（`mip2-extensions/` 或 `mip2-extensions-platform/sites/[站点名]/`） 可以添加 mip.config.js 配置文件来省去每次都在命令行敲参数：

```js
module.exports = {
  dev: {
    port: 8848,
    asset: 'http://192.168.0.11'
  }
}
```

默认配置、mip.config.js、命令行参数的优先级如下所示：

```
默认配置 < mip.config.js < 命令行参数
```



