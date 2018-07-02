# 组件调试

## 命令

mip-cli 提供了 `dev` 命令进行组件调试。

```shell
$ mip2 dev
```

## 引用方式

该命令会自动将当前目录下的 `components/` 下的 mip 组件进行编译并且进行改动监听，同时启动 node 服务器，默认端口为 `8111`，这样就可以通过以下方式去使用编译好的组件啦：

```html
<script src="http://127.0.0.1:8111/组件名/组件名.js"></script>
```

您可以在自己的项目里通过引入 script 标签的方式去查看组件的实际使用效果。

同时，mip-cli 的 `dev` 命令也提供了一个静态服务器，允许开发者在 `test/` 目录和 `components/组件名/test/` 目录下写 `.html` 文件去进行组件调试。

比如文件路径为 `test/mip-example.html` 的页面，可以通过 `http://127.0.0.1:8111/example/mip-example.html` 进行访问，而 `components/mip-example/example/test-property.html` 则通过 `http://127.0.0.1:8111/components/mip-example/example/test-property.html` 进行访问。

在这种调试模式下，mip-cli 会自动注入 `livereload` 的脚本，让页面在开发时能够自动刷新网页。

## 参数说明

`mip2 dev` 可以传入以下参数去修改默认配置：

1. `-p --port`: 静态服务器的监听的端口号，默认为 8111；
2. `-d --dir`: 项目根目录，默认为 `process.cwd()`；
3. `-l --livereload`: 是否启动自动刷新，默认为 false；
4. `-a --auto`: 静态服务器启动后默认打开的网页，默认为空，即不打开任何页面；
5. `-c --config`: 读取 mip-cli 配置文件，默认为 `process.cwd()/mip.config.js`;

mip-cli 允许通过配置 `mip.config.js` 去修改默认配置，比如：

```javascript
// mip.config.js
const path = require('path');

module.exports = {
    // dev 命令配置
    dev: {
        port: 8222, // 默认端口从 8111 变更为 8222
        livereload: true, // 启动自动刷新
        autoopen: '/example/index.html' // 默认打开 http://127.0.0.1:8222/test/index.html
    }
}
```

默认配置、mip.config.js、命令行参数的优先级为：

```bash
默认配置 < mip.config.js < 命令行参数
```

## 例子

假设通过 mip-cli init 出来的项目结构如下：

```bash
test-proj/
... components/
....... mip-example/
........... example/
............... index.html
........... mip-example.vue
... example/
....... index.html
... mip.config.js
```

其中 `mip.config.js` 的配置为：

```javascript
module.exports = {
    dev: {
        port: 8222,
        dir: './components',
        livereload: true,
        autoopen: '/example/index.html'
    }
};
```

`test/index.html` 的内容为：

```html
<!DOCTYPE>
<html mip>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
        <title>MIP page</title>
        <link rel="canonical" href="对应的原页面地址">
        <!-- 引入默认 mip 样式 -->
        <link rel="stylesheet" href="https://bos.nj.bpc.baidu.com/assets/mip/projects/mip.css">
    </head>
    <body>
        <!-- 使用 mip-example 标签 -->
        <mip-example></mip-example>
        <!-- 引入 mip 脚本 -->
        <script src="http://bos.nj.bpc.baidu.com/assets/mip/projects/mip.js"></script>
        <!-- 引入 mip-example 脚本 -->
        <script src="http://127.0.0.1:8222/mip-example/mip-example.js"></script>
    </body>
</html>
```

`components/mip-example/mip-example.vue` 的内容为：

```html
<template>
    <div class="mip-example">{{ word }}</div>
</template>

<style scoped>
    .mip-example {
        color: red;
    }
</style>

<script>
    export default {
        data() {
            return {
                word: 'this is my first mip component!'
            };
        }
    };
</script>

```

在 `test-proj/` 目录下敲入命令行并回车：

```shell
mip2 dev
```

此时会自动打开 `http://127.0.0.1:8222/example/index.html`，页面显示如下：

![mip-example.jpg](https://gss0.baidu.com/9rkZbzqaKgQUohGko9WTAnF6hhy/assets/mip/docs/mip-example-a6d1f6f5.jpg)
