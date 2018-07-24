# mip2 命令行工具

mip2 CLI 是官方提供的命令行工具，它提供了脚手架、调试、预览、校验、构建等功能，方便开发者快速开发 MIP 页面及自定义组件。

## 依赖环境

mip2 CLI 使用 NPM 安装，依赖 Node 环境，推荐

- [Node.js](https://nodejs.org/) (>=8.x)

- [Git](https://git-scm.com/)

## 安装 mip2 CLI

打开命令行工具，输入：

``` bash
$ npm install -g mip2
```

输入 `mip2 -V`，若能正常显示版本号，说明已经安装成功。

## mip2 CLI 使用

### `mip2 init` 创建项目脚手架

```shell
$ mip2 init

? 项目名称（mip-project）my-project
? 项目描述 (A MIP project)
? 作者信息 (username (username@your-email.com))
INFO generate MIP project successfully!
```

根据提示输入项目名 `myproject`，生成项目结构如下

```bash
myproject
    ├── common                          // 组件公用代码，如 utils 等
    ├── components                      // 组件目录，编写组件代码
    │   └── mip-example
    │       ├── README.md               // 组件功能、属性说明
    │       ├── mip-example.vue         // 组件本身
    │       └── example
    │           └── mip-example.html    // 单个组件测试、预览
    ├── mip.config.js                   // 调试服务器配置
    ├── package.json
    ├── static                          // 静态资源，如图片、字体
    └── example
        └── index.html                  // 页面测试预览
```

我们可以在项目的 `components` 目录中开发站点所需的自定义组件，然后依据 `example/index.html` 页面模板，引用官方或自定义组件来实现 MIP 页面。

通常情况下，官方提供的[通用组件库](https://github.com/mipengine/mip2-extensions)已经能满足站点的基本需求。如果站点有使用复杂组件的场景，我们可以[编写站长自定义组件](./contribute-to-site-extensions-repo.md)，并通过[站长组件仓库](https://github.com/mipengine/mip2-extensions-platform)进行提交，通过审核上线后，即能使用。

同时，我们也欢迎开发者向官方通用组件库[贡献优秀的组件](./contribute-to-official-repo.md)。

### `mip2 add` 新增一个组件

在项目根目录运行 `mip2 add` 命令，即可快速添加一个新组件

```bash
# 快速添加名为 mip-new 的组件
$ mip2 add mip-hello-world

# 使用 -f 或 --force 参数强制覆盖同名组件
$ mip2 add mip-hello-world -f
```

可选参数：

```
-f, --force  是否覆盖
```

可以在 `components` 目录下看到，新增组件结构如下：

```bash
── mip-hello-world
    ├── README.md
    ├── mip-hello-world.vue
    └── example
        └── mip-hello-world.html
```

初始化的组件目录包含三块主要部分：

1. 组件入口文件

mip-cli 默认生成了 mip-hello-world.vue 作为入口文件，开发者需要对其进行修改补充以实现具体的组件功能。

2. 组件说明文档

该文件内容必须是UTF-8 编码格式，用于对当前 MIP 扩展组件进行详细说明：

① 组件描述、属性说明与示例对使用者有指导作用，可直接阅读；

② 组件描述、属性说明将被提取，进行自文档化；

③ 组件示例将被开发调试工具自动解析，生成调试页面。

README.md 文件必须符合 MIP 扩展组件 README.md 规范。手写README.md 可能比较麻烦，默认提供的 README.md 文件给出了要求编写的段落格式，我们还可以通过模仿或复制 README.md 样例来创建 README.md。

3. 组件使用示例

mip-cli 默认生成了 example 文件夹，并默认生成了 mip-hello-world.html 文件。在通过 `mip dev` 命令启动调试服务器时，可以通过`http://127.0.0.1:8111/components/mip-hello-world/example/mip-hello-world.html`直接访问到 example 里的 html 文件，开发者在进行组件开发时，可以利用这一功能进行组件调试。建议 example 里的使用示例最好能涵盖组件的全部功能，在组件提交审核的时候，这些示例将作为组件审核的重要考察点之一。

### `mip2 dev` 启动调试服务器

开发好的 MIP 组件需要经过编译之后才可以正常使用。命令行工具内置了编译器和简单的调试服务器，方便开发者调试组件和页面。在项目根目录运行：

```bash
$ mip2 dev
```

默认会将 components 目录下的组件编译好，同时在 `8111` 端口启动服务器，并自动调起浏览器打开 `example/index.html` ，实现预览和调试。在修改组件和页面的代码时，无需手动重启和刷新，服务器内部已经帮我们实现了这一功能。

可选参数：

```
-p, --port <n>          启动端口号
-d, --dir <value>       项目文件夹路径
-l, --livereload        启用调试自动刷新
-a, --asset <value>     静态资源 publicPath
-o, --autoopen <value>  自动打开网页
-i, --ignore            忽略沙盒注入
-c, --config <value>    mip-cli 配置文件路径
```

了解详细用法：[组件开发](./04-component-development.md)，[调试组件](./05-component-testing.md)

### `mip2 validate` 组件和页面校验

MIP 组件和页面都需要遵循特定的开发规范，开发者提交站点 url 和组件代码时，系统会进行审核和校验。命令行工具提供了校验功能，方便我们在开发阶段就能按照相关规范进行开发和调整。

```bash
# 校验 mip 组件，输入组件目录
$ mip2 validate -c ./components

# 校验 mip 页面，输入页面路径
$ mip2 validate -p page.html
```

我们可以根据校验结果，对不符合规范的组件/页面进行相应的改进，校验通过后再进行提交。

可选参数：

```
-c, --component  校验 mip 组件
-p, --page       校验 mip 页面
```

### `mip2 build` 构建组件

自定义组件开发完成后，可以使用 `mip2 build` 命令将组件代码打包成为对应的 `mip-组件名.js` 文件，供发布使用。

在项目根目录运行

```bash
$ mip2 build
```

默认将在 /dist 目录产出打包压缩后的组件资源。

可选参数：

```
-a, --asset <value>   静态资源 publicPath
-d, --dir <value>     项目文件夹路径
-o, --output <value>  编译代码输出路径
-c, --clean           构建前先清空输出目录
-i, --ignore          忽略沙盒注入
```

了解详细用法：[组件构建](./06-component-deploy.md)

### `mip2 sw` 生成 Service Worker

mip2 CLI 提供了 `sw` 命令，帮助开发者更简单快速地生成 Service Worker，支持离线可用等特性。

``` bash
# 在项目根目录运行
$ mip2 sw
```

默认情况下，将导出 Service Worker 文件到 `dist/sw.js`，并对静态资源(如 js,css)及 html 文档进行缓存，实现页面的离线可用。

可选参数：

```
-o, --output <value>  Service Worker 导出路径，如 mip2 -o output/service-worker.js
-c, --config <value>  mip-cli 配置文件路径，默认使用项目根目录 mip.config.js
```

除此之外，我们可以在 `mip.config.js` 中增加 `serviceWorker` 配置项，对 Service Worker 进行进一步的配置，如预缓存列表、动态缓存策略、`skipWaiting`、`clientsClaim` 等。

``` javascript
module.exports = {
  dev: {/*...*/},
  serviceWorker: {
    cacheId: 'mipuser',
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [],
    globPatterns: [],
    globIgnores: []
  }
}
```

更多的配置选项可以参考 [Workbox 配置项](https://developers.google.com/web/tools/workbox/modules/workbox-build#generateswstring_mode)
