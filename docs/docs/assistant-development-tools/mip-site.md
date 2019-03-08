# MIP 站点开发工具

*项目地址：[mip-cli-plugin-site](https://github.com/mipengine/mip-cli-plugin-site)*

## 为什么需要 mip2 site？

一般开发 MIP 页面需要两个部分：

* 开发 MIP 组件
  根据每个站点各自的业务需求，站长需要开发包含自身业务的 MIP 组件。

  例如某个博客站点可能需要开发一个组件 `<mip-blog-list>`，这个组件根据当前 URL 上的 ID 获取用户信息，从而展示他发过的博客的列表。

* 开发 MIP 页面
  根据已有的 MIP 组件（可能是内置组件，也可能是刚才自己开发的自定义组件）拼装成一个 HTML 页面。

开发组件时我们大多使用 MIP CLI 内置的 `mip2 dev` 启动服务器。其他还有例如 `mip2 add`, `mip2 build` 之类的专门针对组件开发的快捷方式。

但开发 MIP 页面目前并没有单独的工具，更多的是在开发组件的项目中，随便找一个 example，把拼装各个组件的最终页面写进去，之后预览效果。这就相当于 __在单测脚本中写集成测试用例__，是一种失配的现象。

此外，作为一个 MIP 页面，还应当考虑到搜索环境的 SuperFrame （简称 SF） 中显示是否正常。虽然我们额外提供了 `mip2 sf` 命令帮助本地调试，但 __需要同时打开两个 bash 并分别启动 `mip2 dev` 和 `mip2 sf` 也是反人类的__。

`mip2 site` 基于这些实际开发中的问题，主要解决了以下几个问题：

1. 将开发组件和开发页面融合到同一个项目中，我们称为 “MIP 站点项目”

2. 内置 SF 调试环境，不必额外启动命令

3. 保留 `mip2` 本身的全部功能，例如 `mip2 add`, `mip2 build` 等均有快捷命令一一对应，无需反复切换目录。

## 快速开始

作为 MIP CLI 的插件，首先要求开发者全局安装最新版本的 mip2。如果没有，请运行 `npm i mip2 -g` 进行全局安装。

1. `mip2 site init` 初始化项目

2. `cd` 到项目根目录并执行 `npm i`

3. `mip2 site dev` 启动初始项目

4. 访问 `http://localhost:8200/weather/shanghai` 查看初始项目的示例页面

5. 访问 `http://localhost:8200/sf` 查看 SF 线下调试环境

## 初始化项目

```bash
mip2 site init
```

初始化 MIP 站点项目模板，方便用户快速进入 MIP 开发。执行这条命令后，会被要求输入一些信息：

- 项目名称 (mip-site) xxx

- 项目描述 (A MIP site project) xxx

- 作者信息 (yourname) xxx

成功之后提示，`generate MIP project successfully!`。

接着 `cd` 到目录中，执行 `npm i` 安装所有的依赖，就算是初始化完成了。

## 启动开发服务器

```bash
mip2 site dev
```

在完成初始化（包含安装依赖）完成后，我们就可以进入开发状态了，这时候就需要启动开发服务器。MIP 站点开发服务器大体来说主要包含 3 个功能：

* 调试组件 - 官方的组件开发服务器，即 `mip2 dev`，可以对 MIP 组件进行调试
* 调试页面 - 简易 nodejs 服务和模板渲染引擎，可以在拼装 MIP 页面时进行一些稍微复杂的操作
* 调试 SF 环境 - SuperFrame 线下调试服务器，即 `mip2 sf`，可以使 MIP 页面在 SF 环境下预览

### 访问地址

原则上访问路径最大限度和官方内置命令的访问路径保持一致，只有端口号不同（因为端口号相同会有冲突）。

以下地址均采用默认端口 8200，如要改动，参见修改配置部分。

* 预览单个组件（和 `mip2 dev` 相同）：`http://localhost:8200/components/${组件名}/example/${组件名}.html`

    例如初始化的站点项目中默认包含一个名为 `mip-example` 的组件，那么它的预览地址是 `http://localhost:8200/components/mip-example/example/mip-example.html`

* 组件 JS 地址（和 `mip2 dev` 相同）：`http://localhost:8200/components/${组件名}/${组件名}.js`

    可以在各处 HTML 文件中引用，例如组件单测的 HTML，或者是最终拼装而成的集成测试页面。

* 预览整体页面：`http://localhost:8200/${自定义路由}`

    开发者可以运用一些简单的逻辑（发送请求获取数据，用数据和组件拼装模板）来自定义集成测试页面，把 MIP 组件拼装到一起组成 MIP 页面，而不再需要在某个组件的 example HTML 内进行这个工作，彻底摆脱“利用单测环境进行集成测试”的现状。

    这一部分会在文档后面的“拼接 MIP 页面”进行更详细的阐述。

* SF 线下调试环境（和 `mip2 sf` 相同）：`http://localhost:8200/sf`

    启动 SF 线下调试环境。这部分已经在上一篇介绍过了。

### 配置项

因为配置项较多，暂不支持命令行的配置项，采用配置文件的方式，位于根目录的 `mip.config.js`。配置项主要包括几个部分：

1. 组件开发服务器部分，和 `mip dev` 命令的参数一致，因此也可以参考 [mip cli 文档的 dev 部分](https://github.com/mipengine/mip2/blob/dev/docs/guide/mip-cli/cli-usage.md#mip2-dev-%E5%90%AF%E5%8A%A8%E8%B0%83%E8%AF%95%E6%9C%8D%E5%8A%A1%E5%99%A8)

  | 配置项  | 类型 | 默认值 | 说明 |
  | --- | --- | --- | --- |
  | port  | __number__  | `8200` | 服务器启动端口号 |
  | livereload  | __boolean__  | `true` | 是否开启热加载 |
  | autoopen  | __string\|boolean__  | `false` | 服务器启动成功后是否自动打开页面 |
  | ignore  | __string__  | `'sandbox,whitelist'` | 是否忽略沙盒注入或校验 |
  | asset  | __string__  | `''` | 静态资源 publicPath |

2. SF 线下调试环境部分，包含

  | 配置项  | 类型 | 默认值 | 说明 |
  | --- | --- | --- | --- |
  | enableSF  | __boolean__  | `true` | 是否开启线下 SF 调试环境 |

配置文件以 JSON 的格式存在，详情可以参考 `mip2 site init` 项目中的 `mip.config.js`，或者[在线版本](https://github.com/mipengine/mip-plugin-site-template/blob/master/mip.config.js)

### 拼接 MIP 页面

这一部分将重点讲述 `mip2 site dev` 新增的功能：自定义路由和模板拼装。它可以用来帮助开发者使用一些简单的逻辑拼接出一个完整的 MIP 页面从而进行集成测试。

这里主要有两部分需要开发者关注：

1. `actions` 目录，里面存放路由的配置及其处理函数。每个文件输出一个对象，包含一些固定的 key，由 `mip2 site dev` 全部加载并添加到路由规则中。

2. `templates` 目录，里面存放 `actions` 中每个处理函数可能会用到的模板文件。

`mip2 site init` 初始化的项目或者 [mip-plugin-site-template](https://github.com/mipengine/mip-plugin-site-template) 中存放着一个已经配置好的例子，我们可以参考它的写法。

#### Action

Action 本质是一个 JS 文件，使用 `module.exports` 暴露一个对象，位于 `actions` 目录。这个对象 __必须__ 包含以下这些内容：

* method

    类型：__string__，可选值：`'get'`, `'post'`, `'put'`, `'del'`, `'all'`。默认 `'get'`。

    配置当前的 Action 支持的 HTTP 协议方法。`'all'` 表示全部支持。

* pattern

    类型：__string__，__必填，没有默认值。__

    配置当前的 Action 支持的路由规则，内部使用 `path-to-regexp` 进行匹配，支持具名的动态参数，例如 `/weather/:city` 则能够匹配例如 `/weather/shanghai`, `/weather/london` 这些 URL。

* handler

    类型：__function__，__必填，没有默认值。__

    配置当前的 Action 在匹配了路由规则后对应的处理函数。

    可以接受两个参数 `handler (ctx, render) {...}`，支持 async/await，即 `async handler (ctx, render) {...}`。

    第一个参数 `ctx` 是 koa 内部的上下文对象，可以通过它获取很多请求相关的内容，例如通过 `ctx.params` 获取路由规则中的动态参数（例如上面例子中的 `city`），通过 `ctx.query` 获取 query 参数等等。此外最终的输出也可以通过设置 `ctx.body = ...` 来进行。更多用法可以参考 koa 的文档。

    第二个参数 `render` 是一个方法，用来使用模板文件 (tpl) 和数据渲染 HTML 页面，并通过 `ctx.body = ` 进行输出。如果您不想使用 `render` 方法，也可以直接使用字符串或者其他方法来输出，这是可选的。`render` 方法接受两个参数，第一个是模板文件的名字，第二个是数据。例如 `ctx.body = render('tplName', {data})`。模板 (包含 MIP 组件) + 数据 = HTML。

    在 `handler` 里面通常还可能需要发送请求。在初始的代码中我们默认使用了轻量级的请求工具 [got](https://github.com/sindresorhus/got)，并获取雅虎天气的数据。开发者可以自由选择其他发送请求的工具，例如 request, 或者内置的 http 和 https 模块。

#### Template

Template 是用来生成 HTML 的模板文件，是一个 __可选__ 的辅助工具，为的是帮助开发者更轻松地输出 HTML。再次重申，开发者可以选择不使用 Template。

使用 Template 的方式刚才在 Action 的 `handler` 的部分已经说过: `ctx.body = render('tplName', {data})`，这里主要集中于模板文件本身的写法。

Template 本质是 `.tpl` 结尾的模板文件，采用 HTML 语法。内部使用 `lodash.template` 进行模板替换，因此在插入变量时使用 `<%= ... %>` 这样的语法。

除了插入变量，其余部分和开发一个普通的 MIP 页面是相同的，都包含以下几个部分：

1. 必须是一个完整的 HTML 页面，即有 `<html>`, `<head>`, `<body>` 三个部分。并且必须有 `<html mip>` 进行标识。其余一切的整页规则都和 MIP 是一样的。

2. 可以自由使用 MIP 组件，尤其是项目中尚在开发状态的组件（其实也是最本质的功能）。使用时不要忘记在最后引用组件 JS，例如 `<script src="/mip-example/mip-example.js"></script>`

3. 在组件 JS 之前引用 MIP 核心 JS，即 `<script src="https://c.mipcdn.com/static/v2/mip.js"></script>`

#### 示例 & 流程

[mip-plugin-site-template](https://github.com/mipengine/mip-plugin-site-template) 是一个完整的例子。我们可以重点关注 `actions` 和 `templates` 两个目录。

* 初始情况下建立了一条路由 `/weather/:city`。因此我们访问 `http://localhost:8200/weather/shanghai` 可以命中这条路由规则，进入对应的 Action。（位于 `actions/weather.js`）

* 在 Action 中，使用 `ctx` 对象的各个属性来获取 URL 上的信息。例如当访问 URL 是 '/weather/shanghai?type=text' 时
    * `ctx.params` 等于 `{city: 'shanghai'}`
    * `ctx.query` 等于 `{type: 'text'}`

* 在 Action 中，可以发送请求获取数据，支持 async/await。

* 在 Action 中，使用 `render` 方法给模板提供数据并渲染 HTML，传递给 `ctx.body`。

* 在 Template 中，使用 `<%= ... %>` 输出变量

## 添加组件

```bash
mip2 site add-component
```

在开发普通的组件项目时，我们会使用 `mip2 add` 来自动添加一个默认的组件，然后再在这个基础上修改完成自定义的组件。但是因为一个站点项目的目录结构和组件项目并不相同，因此不能直接使用这条命令。不过我们也给开发者提供了替代的便捷命令，即 `mip2 site add-component`。使用方法也和 `mip2 add` 基本保持一致。

### 示例

``` bash

# 不写组件名时，默认添加 mip-example 组件
mip2 site add-component

# 添加特定名称的组件模板，注意组件命名规范，如：mip-xxx
mip2 site add-component  <component-name>

# 若添加组件名已存在时，可通过 -f 或 --force 参数强行覆盖原组件
mip2 site add-component <component-name> -f

```

注意：添加组件时，注意遵守组件开发的[命名及相关规范](https://mip-project.github.io/v2/guide/mip-standard/mip-components-spec.html)


### 开发调试

在添加新组件完成后，使用如下步骤就可以预览到它：

1. 启动 MIP 站点开发服务器 `mip2 site dev`

2. 预览新增组件链接：`http://localhost:8200/components/{组件名}/example/{组件名}.html`

## 编译组件

```bash
mip2 site build-component
```

和添加组件类似，组件项目包含的编译组件快捷命令在站点项目也同样支持。`mip2 site build-component` 可以将某个组件编译成单个文件，方便在页面中引入使用。它的使用方法也和 `mip2 build` 基本一致。

### 配置项

所有的配置项都和 `mip2 build` 一致，因此也可以参考[这篇文档](https://github.com/mipengine/mip2/blob/dev/docs/guide/mip-cli/component-deploy.md#%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E)

#### 指定静态资源 (asset)

asset 是一个指定静态资源 publicPath 的参数，为了让你在开发组件的时候可以直接通过相对路径的方式引入本地的静态资源，例如图片、字体文件、异步加载 js 文件等，默认的 asset 的值为 /。

静态资源的用法较多，可以设定为本地文件，也可以是 CDN 的远程地址，详情可以参考[这里](https://github.com/mipengine/mip2/blob/dev/docs/guide/mip-cli/component-deploy.md#asset)

```bash
# 示例
mip2 site build-component -a /dist
```

#### 指定组件目录 (dir)

默认情况，组件目录在站点项目根目录下的 `/mip-component/`。但如果开发者有自定义需求，也可以修改或者移动这个目录，并在这里进行配置。组件文件夹路径，可以是绝对路径，也可以是相对路径，相对路径指的是相对于项目根目录下的 mip-component 而言。

这个功能的目的在于如果您本地已经有一个组件项目存在，那在开发站点时，可以仅使用 `mip2 site` 的站点服务器，模板拼装和 SF 调试这几个功能，不必把组件重新复制进来了。

```bash
# 示例
mip2 site build-component -d /Users/xxx/to/your/project/mip-component
```

#### 指定产出目录 (output)

默认情况下，编译产出目录在 `/mip-component/dist`。如果要修改的话，可以使用这个配置项，可以是绝对路径，也可以是相对路径，相对路径指的是相对于项目根目录下的 mip-component 而言。

```bash
# 示例
mip2 site build-component -o ./dist
```

#### 先清空目录 (clean)

如果要在每次构建之前先清空 `/mip-component/dist` 目录，可以配置这个选项。否则（不配置）将不会清空，只会覆盖同名文件而已。

```bash
# 示例
mip2 site build-component -c
```

#### 忽略沙盒规则 (ignore)

`ignore` 参数是为了忽略 mip 的沙盒规则的参数，默认值为 `false`，当不指定 `ignore` 的时候，组件的代码会有 mip 安全[沙盒限制](https://github.com/mipengine/mip2/blob/dev/docs/guide/component/sandbox.md)，用来保证组件代码不会对 mip 页面产生负面影响，如果设置了 `ignore` 参数为 `true`，就不会对组件的代码做任何的沙盒安全处理。

但在开发普通组件时，我们不建议开发者使用这个参数忽略沙盒限制，因为正式上线时依然会有限制，可能会导致开发和上线状态不一致。

忽略沙盒注入或校验，可选参数为 `-i sandbox`, `-i whitelist`, `-i sandbox,whitelist`。 `-i` 默认为 `-i sandbox`, `-i all` 等价于 `-i sandbox,whitelist`

- 用法


```bash
# 示例
mip2 site build-component -i sandbox
```

#### 设置环境变量 (env)

可以用来设置 `NODE_ENV` 环境变量，在编译时进行替换。如果不设置，这个变量默认会被替换为 `"production"`

```bash
# 示例
mip2 site build-component -e production
```

#### 查看帮助 (help)

显示所有命令和参数的帮助使用信息

```bash
# 示例
mip2 site build-component -h
```
