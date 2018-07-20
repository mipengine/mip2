# 使用 mip-cli 快速开始

- [编写第一个 MIP 页面](#编写-mip-页面)
- [编写第一个 MIP 组件](#编写-mip-组件)

## 编写 MIP 页面

下面的步骤将带我们使用 [mip2 CLI](./01-cli-usage.md) 来快速创建一个 MIP 页面

### 1. 安装 mip2 CLI

打开终端输入

```bash
$ npm install -g mip2
```

### 2. 项目初始化

```bash
$ mip2 init
```

根据提示，输入项目名称等信息

### 3. 编辑页面模板

进入项目目录，使用编辑器打开 `example/index.html`，生成的模板已经为我们写好了 MIP 页面所需的最基本元素，如 `mip.js` 运行时，默认样式 `mip.css` 等。下面我们在页面中写入简单的内容，并使用内置 `mip-img` 组件。注意，如果使用其他非内置组件，需要在页面底部使用 `script` 标签引入相应的脚本文件。

```html
<!DOCTYPE html>
<html mip>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <title>MIP page</title>
  <link rel="canonical" href="对应的原页面地址">
  <link rel="stylesheet" href="https://bos.nj.bpc.baidu.com/assets/mip/projects/mip.css">
  <style mip-custom>
    /* 自定义样式 */
    .wrapper {
      padding: 20px;
    }
    p {
      line-height: 24px;
      padding: 10px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <h2>Hello World</h2>
    <p>This is my first MIP page.This is my first MIP page.This is my first MIP page.This is my first MIP page.This is my first MIP page.This is my first MIP page.This is my first MIP page.This is my first MIP page.</p>
    <mip-img popup src="https://i3.meishichina.com/attachment/recipe/2014/10/27/c640_20141027211913820385989.jpg@!c640"></mip-img>
  </div>
  <script src="http://bos.nj.bpc.baidu.com/assets/mip/projects/mip.js"></script>
</body>
</html>
```

### 4. 启动调试服务器预览

在项目根目录运行

```bash
$ mip2 dev
```

服务启动后，打开浏览器访问 `http://127.0.0.1:8111/example`，就能看到上面我们编写的页面的效果了。

## 编写 MIP 组件

下面的步骤将带我们使用 [mip2 CLI](./01-cli-usage.md) 来快速创建一个 MIP 自定义组件

### 初始化项目

同上面的步骤类似，安装 `mip2 CLI` 工具后，我们运行 `mip2 init`，并创建一个名为 `my-project` 的项目。

### 新建一个自定义组件

在项目根目录运行 `mip2 add` 命令，即可快速添加一个新组件

```bash
# 快速添加名为 mip-hello-world 的组件
$ mip2 add mip-hello-world

# 使用 -f 或 --force 参数强制覆盖同名组件
$ mip2 add mip-hello-world -f
```

可以在 `components` 目录下看到，新增组件结构如下：

```bash
── mip-hello-world
    ├── mip-hello-world.md
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

mip-cli默认生成了example文件夹，并默认生成了mip-sample.html文件。在通过`mip dev`命令启动调试服务器时，可以通过`http://127.0.0.1:8111/components/mip-hello-world/example/mip-hello-world.html`直接访问到 example 里的 html 文件，开发者在进行组件开发时，可以利用这一功能进行组件调试。建议 example 里的使用示例最好能涵盖组件的全部功能，在组件提交审核的时候，这些示例将作为组件审核的重要考察点之一。

编辑器打开 `mip-hello-world.vue`，进行一定的修改

```html
<template>
  <div class="wrapper">
    <h1>MIP 2.0 component example</h1>
    <h3>This is my first custom component !</h3>
  </div>
</template>

<style scoped>
  .wrapper {
    margin: 0 auto;
    text-align: center;
    color: red;
  }
</style>

<script>
  export default {
    mounted() {
      console.log('This is my first custom component !');
    }
  }
</script>

```

### 3. 引用组件脚本

编辑器打开 `example/index.html`, 修改 `body` 部分的代码，引用组件脚本

```html
...
<body>
    <div class="wrapper">
        <h2>Hello World</h2>
        <mip-hello-world></mip-hello-world>
    </div>
    <script src="http://bos.nj.bpc.baidu.com/assets/mip/projects/mip.js"></script>
    <script src="/mip-hello-world/mip-hello-world.js"></script>
</body>

...
```

### 4. 启动服务器预览

在项目根目录运行

```bash
$ mip2 dev
```

服务启动后，打开浏览器访问 `http://127.0.0.1:8111/example`，可以看到，刚才编写的组件已经运行在页面中。开发工作完成后，可以根据组件类型，选择将组件提交至第三方组件仓库(TODO)或[官方组件仓库](./07-contribute-to-official-repo.md)。
