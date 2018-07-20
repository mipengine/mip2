# 组件调试

开发过程中，我们可以依赖 mip-cli 进行组件调试和功能预览：

```shell
$ mip dev [--port PORTNAME] [--asset ASSET-PUBLIC-PATH] [--livereload] [--autoopen]
```

## 参数说明

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

**默认配置 < mip.config.js < 命令行参数**

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
      }
    }
  }
</script>

```

在 `test-proj/` 目录下敲入命令行并回车：

```shell
mip2 dev
```

此时会自动打开 `http://127.0.0.1:8222/example/index.html`，页面显示如下：

![mip-example.jpg](https://gss0.baidu.com/9rkZbzqaKgQUohGko9WTAnF6hhy/assets/mip/docs/mip-example-a6d1f6f5.jpg)
