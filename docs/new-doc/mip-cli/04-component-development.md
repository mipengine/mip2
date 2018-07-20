# MIP组件开发的基本步骤

了解了 MIP 页面的开发步骤和 MIP 组件的开发注意点，接下来介绍MIP组件的开发步骤。通常情况下，从零开始开发一个 MIP 扩展组件并上线，需要经过下面几个步骤。

## 代码准备

代码准备主要介绍使用 GitHub 平台如何操作 MIP 组件的代码开发和提交。

1. Fork MIP 扩展组件仓库到自己的 GitHub 账号下；
2. Clone到本地；
3. 完成开发；
4. 将开发完成的扩展组件通过 Pull Request 进行提交。

### Fork

首先你需要有一个 GitHub 账号，并登录[https://github.com/login](https://github.com/login)。如果没有，可以注册一个。登录 GitHub 后，访问 MIP 扩展组件仓库 [https://github.com/mipengine/mip2-extensions](https://github.com/mipengine/mip2-extensions)，并点击右上方的 fork 按钮，就将 mip2-extensions fork 到你的个人账户了。想了解更多，可以查阅 GitHub 的文档。

### Clone

我们需要 clone 刚才 fork 的仓库，通常它的地址是 `https://github.com/[YOUR-USERNAME]/mip2-extensions`。通过一行命令就能完成：

```shell
$ git clone https://github.com/[YOUR-USERNAME]/mip2-extensions
```

Clone 完成后，你将在本地获得一个 mip2-extensions 目录，里面包含了所有的MIP扩展组件。到此我们就完成了开发前的准备工作。

## 创建 MIP 扩展组件结构

创建 MIP 扩展组件结构的方法很简单，利用 mip-cli 命令行工具可以自动实现标准的扩展组件结构。mip-cli 发布到 npm 上的名称为 `mip`，因此可以通过 npm 进行安装：

```shell
$ npm install -g mip

```

通过 mip-cli 提供的 `mip add` 命令即可实现创建标准的 MIP 扩展组件目录结构。`mip add` 命令需要在组件仓库的根目录下执行：

```shell
$ cd path/to/mip2-extensions
$ mip add mip-sample
```

其中参数 mip-sample 为所要新增的组件名称，在组件命名上，要求必须以 `mip-` 作为前缀标识。这样在 mip2-extensions 的 components 目录下新增如下结构：

```
components
└── mip-sample
    ├── README.md
    ├── example
    │    └── mip-sample.html
    └── mip-sample.vue
```

初始化的组件目录包含三块主要部分：

1. 组件入口文件

mip-cli 默认生成了 mip-sample.vue 作为入口文件，开发者需要对其进行修改补充以实现具体的组件功能。

2. 组件说明文档

该文件内容必须是UTF-8 编码格式，用于对当前 MIP 扩展组件进行详细说明：

① 组件描述、属性说明与示例对使用者有指导作用，可直接阅读；

② 组件描述、属性说明将被提取，进行自文档化；

③ 组件示例将被开发调试工具自动解析，生成调试页面。

README.md文件必须符合MIP扩展组件README.md规范（请查阅第3.4.2节），该文档详细描述了README.md文件中需要包含的内容与格式，请仔细阅读这篇文档。手写README.md 可能比较麻烦，默认提供的README.md文件给出了要求编写的段落格式，我们还可以通过模仿或复制README.md样例来创建README.md。

3. 组件使用示例

mip-cli默认生成了example文件夹，并默认生成了mip-sample.html文件。在通过`mip dev`命令启动调试服务器时，可以通过`http://127.0.0.1:8111/components/mip-sample/example/mip-sample.html`直接访问到example里的html文件，开发者在进行组件开发时，可以利用这一功能进行组件调试。建议example里的使用示例最好能涵盖组件的全部功能，在组件提交审核的时候，这些示例将作为组件审核的重要考察点之一。

这样有了组件目录之后，下面正式进入组件开发阶段。

## 开发组件

MIP 内部整合了 Vue 核心代码，因此可直接参考 Vue 的语法进行代码编写，我们建议以 `.vue`，即 Vue 单文件组件的形式去开发 MIP 组件，mip-cli 工具会在编译阶段自动将 `.vue` 文件自动编译成可供 MIP 运行的 JS 文件。

以 mip-sample.vue 为例，初始化生成的文件即为一个功能完整的 Vue 单文件，其代码如下所示：

```html
<template>
  <div class="wrapper">
    <h1>MIP component sample</h1>
    <h3>This is my first custom component !</h3>
  </div>
</template>

<style scoped>
.wrapper {
  margin: 0 auto;
  text-align: center;
}
</style>

<script>
export default {
  mounted () {
    console.log('This is my first custom component !')
  }
}
</script>
```

通过`mip dev`命令启动调试服务器后，通过浏览器访问`example/mip-sample.html`页面，页面效果如图所示：

![页面效果](https://gss0.baidu.com/9rkZbzqaKgQUohGko9WTAnF6hhy/assets/mip/doc/component-yulan-5f4389e3.png)

同时控制台将会显示“This is my first custom component !”的log信息，说明mip-sample组件的生命周期钩子mounted已经被执行。

接下来我们将在 mip-sample.vue 的基础上，进行一些常用功能点和开发注意事项的介绍。

### 组件样式开发

开发者可以直接在 style 标签对内进行样式开发，mip-cli 的编译模块内置了 less 编译器，因此可以根据自身开发习惯选择使用 less 或者直接写 css。在使用 less 的时候，需要在 style 标签添加 lang="less" 属性进行标明。同时 mip-cli 还内置了 autoprefixer 插件，对于 “transform” 等这类需要写浏览器私有属性优雅降级的，在编译时会自动补全。为了避免组件之间样式污染，因此在没有特殊需求的情况下，应该添加scoped属性限制组件样式作用范围。

总结一下，在组件样式构建方面，mip-cli 内置了以下 loader 辅助开发者进行样式开发：

1. less-loader
2. postcss-loader
  1. autoprefixer
3. css-loader
4. vue-style-loader

### 组件样式资源引入

假设开发者需要在组件样式中添加背景图片或者是添加字体文件，首先需要将资源放到与 components 目录平级的 static 目录当中，然后在样式表中引入该资源路径即可。默认支持 `.png|.jpg|.jpeg|.gif` 等图片资源和 `.otf|.ttf|eot|svg|woff|woff2` 等字体文件资源的引用，默认小于 1000b 的资源直接生成 base64 字符串。

#### css 引入资源

以引入 test.png 为例，假设需要将 .wrapper 的元素背景设置为图片，那么对应的 css 为：

```css
.wrapper {
  background: url(~@/static/test.png);
}
```

其中 mip-cli 将 `@` 设置为 mip2-extensions 根目录的别名，在写样式的时候使用相对路径可能会造成路径解析错误，因此建议利用 `@` 拼写引用资源的绝对路径。

#### js 引入资源

假设需要在 `<img>` 标签中显示 test.png，那么，可以通过 js 引入图片：

```javascript
import img from '@/static/test.png'
```

mip-cli 内置了 `url-loader`，所以通过上面的方式拿到的 img 变量其实就是图片资源在*编译*后的 url。因此在开发 MIP 组件的时候，可以这么显示 test.png：

```html
<template>
  <img :src="url">
</template>
<script>
  import img from '@/static/test.png' // 也可以使用相对路径，只要能 require 到图片就好
  export default {
    data () {
      return {
        // 需要将数据挂到组件上才能够跟模板绑定哦
        url: img
      }
    }
  }
</script>
```

### 代码资源管理

对于一些功能较为复杂的组件在开发过程中可能会遇到以下问题：

1. 将全部逻辑都写到同一个 .vue 文件中不利于代码维护，因此需要对组件代码进行适当拆分；
2. 多个MIP组件需要用到一些公共的函数进行运算，在组件目录里各自实现一份公共函数将造成代码的冗余；
3. 部分MIP组件需要用到诸如“echarts”、“mustache”之类的开源模块；

针对以上三种问题，我们提出了一套代码资源管理的方案：

1. 对于组件私有逻辑相关的代码，需要放在组件目录下；
2. 多个组件公用的公共函数代码，需要放在common目录下；
3. 开源模块通过 `npm install --save [组件包名]` 安装到本地。开源模块不建议将相关资源拷贝到 common 文件夹中使用，这样不利于开源模块的升级维护。假设担心开源模块升级可能会带来问题，那么可以在 package.json 里将模块的版本号写死；

以上三种代码资源，要求格式必须是 ES Module、CommonJS、AMD 中的其中一种，在没有特殊要求的情况下，建议采用 ES Module 实现。这样，就可以在需要用到相关代码的地方通过 `import` 或者 `require` 引入了。

#### 引用后缀省略

在进行资源引入的时候，默认允许省略的后缀有：`.js`、`.json`、`.vue`，更进一步，在满足后缀可省略的前提下，如果资源名称为 index，那么 index 也可以省略。比如以下三种写法都是正确的：

```javascript
// 完整路径
import '/common/utils/index.js'
// 省略后缀
import '/common/utils/index'
// 省略 index.js
import '/common/utils'
```

#### 别名

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

### 父子组件

原则上，一个 MIP 组件的代码能够注册一个对应名称的 Custom Element，比如 mip-sample，当 HTML 页面引入对应的script标签时，只有 `<mip-sample>`标签会生效。但是对于一些复杂组件来说，比如选项卡组件，假设选项卡为 mip-tabs，则需要对外暴露 `<mip-tabs>` 和 `<mip-tabs-item>` 两种组件，这样才能更加方便地通过标签对拼接出选项卡功能，比如：

```html
<!-- 通过标签嵌套实现选项卡功能 -->
<mip-tabs>
  <mip-tabs-item>
    Tab 1
  </mip-tabs-item>
  <mip-tabs-item>
    Tab 2
  </mip-tabs-item>
  <mip-tabs-item>
    Tab 3
  </mip-tabs-item>
</mip-tabs>
<!-- 只需要引入 mip-tabs.js 即可 -->
<script src="/mip-tabs/mip-tabs.js"></script>
```

我们将mip-tabs-item称为mip-tabs的子组件。子组件的判定必须满足以下条件：
1. 子组件文件必须为以.js或.vue结尾；
2. 子组件文件名必须包含父组件名，并在父组件名后加上子组件标识，如mip-tabs和mip-tabs-item；
3. 子组件文件必须与父组件入口文件放在同一级目录下；

这样mip-cli在进行组件代码编译的时候，会自动往入口文件注入子组件和子组件注册Custom Element的代码，从而实现上述功能。

### 模块异步加载

一般情况下，一个 MIP 组件所依赖的所有代码经过编译之后，会全部打包拼合到入口文件中。因此假设两个组件都引用了 mustache 那么编译完成后，这两个组件代码内部将各有一份 mustache，造成组件代码体积过大。因此 mip-cli 提供了异步加载机制，通过函数 `import()` 异步加载 mustache，那么在最终打包的时候，mustache 将生成独立文件，而不会这两个组件的代码中。举个例子，假设 mip-sample.vue 需要在 mounted 阶段异步加载 mustache，那么可以这么写：

```javascript
export default {
  mounted () {
    import('mustache').then(function (mustache) {
      console.log(mustache.version)
    })
  }
}
```

这样在 mustache 异步加载完毕后，将会在控制台输出 mustache 的版本号。假设多次调用`import('mustache')`，那么只会发送一次资源请求，其余的直接从缓存中读取。

至此，一个组件的开发已经完成，接下来需要对组件进行调试。

## 调试和预览组件

开发过程中，我们可以依赖 mip-cli 进行组件调试和功能预览：

```shell
$ mip dev [--port PORTNAME] [--asset ASSET-PUBLIC-PATH] [--livereload] [--autoopen]
```

mip dev命令可以指定以下参数：

1. --port，简写为-p，指定测试服务器的端口号，默认端口为8111。假设需要将端口号修改为8080，则启动命令为:

```shell
$ mip dev --port 8080
```

2. --asset，简写为 -a，指定编译好的静态资源上线后的公共路径，这个值将会透传到 webpack 的 output.publicPath 配置项中。默认为 `http://127.0.0.1:${PORTNAME}`。
3. --livereload，简写为 -l，是否开启页面自动刷新，默认为不开启。这个功能只有在写组件使用示例的 HTML 文件时生效，测试服务器会在接收到HTML资源请求时，动态注入livereload.js的代码，这样在开发过程中，组件代码或者 HTML 存在改动的时候，页面都会自动刷新；
4. --autoopen，简写为 -o，是否在启动 dev 服务器的时候自动打开某个网址，默认为空，即不打开任何页面。比如希望启动 dev 服务器的时候自动打开`http://127.0.0.1:8111/example/index.html`，则启动命令为

```shell
$ mip dev --autoopen http://127.0.0.1:8111/example/index.html
```

这些参数都可以通过 mip.config.js 传入，省去每次启动时都需要敲一长串的参数：

```javascript
module.exports = {
  dev: {
    port: 8080,
    asset: 'http://127.0.0.1'，
    autoopen: '',
    livereload: true
  }
}
```
默认配置、mip.config.js、命令行参数的优先级为：

*默认配置 < mip.config.js < 命令行参数*

## 组件提交

组件开发完毕后，可以通过 GitHub 向 mip2-extensions 项目提交 Pull Request，MIP 的值班同学 Review 好提交的代码，确认没问题后，就会将代码合入等待组件上线。组件代码合入和上线的过程在 [提交站长组件](./06-contribute-to-official-repo.md) 进行详细说明。

## 小节

本节主要介绍MIP组件开发的基本步骤，详细介绍了代码准备、创建组件结构、组件脚本和样式开发、预览调试组件等方面。通过对本节的学习，可以从无到有创建一个 MIP 组件。
