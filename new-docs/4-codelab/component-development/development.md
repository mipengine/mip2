# 3. 开发组件

本节中，我们将实现一个简单的点击按钮隐藏图片的组件，以此为例，介绍开发自定义组件的流程。MIP 内部整合了 Vue 核心代码，因此可直接参考 Vue 的语法进行代码编写，我们建议以 .vue，即 Vue 单文件组件的形式去开发 MIP 组件，mip-cli 工具会在编译阶段自动将 .vue 文件自动编译成可供 MIP 运行的 JS 文件。

## 新增组件

在我们的 `example.com` 站点目录下，运行 `mip2 add` 命令，新增一个组件模板。假设我们要编写的组件名为 imagehider，我们可以命名为 `mip-example-imagehider`，中间加上站点名称来标识和区分。

``` bash
$ mip2 add mip-example-imagehider
```

可以在 `components` 目录下看到，新增组件结构如下：

```bash
── mip-example-imagehider
    ├── README.md
    ├── mip-example-imagehider.vue
    └── example
        └── mip-example-imagehider.html
```

这里的 `mip-example-imagehider.vue` 就是我们组件的源码文件。

## 功能实现

先准备我们所需要的图片 `mip.png`，将图片放置在 `example.com/static` 目录下。

`mip.png` 如下所示：

![mip.png](./images/mip.png)

编辑 `mip-example-iamgehider.vue` 文件，书写的语法 Vue 组件基本是一样的。如果对 Vue 不熟悉，可以先阅读 [Vue 文档](http://cn.vuejs.org/)进行了解。我们引入上述图片，并编码实现点击隐藏的简单功能，代码如下：

```html
<template>
  <div class="wrapper">
    <mip-img
      v-show="show"
      :src="url"/>
    <button
      type="button"
      @click="hideImage">点击隐藏图片</button>
    <p>从 MIP 标签中传递过来的数据 attr: {{ attr }}</p>
    <!-- 用 slot 来放置 mip 标签中的嵌套内容 -->
    <slot></slot>
  </div>
</template>

<style scoped>
.wrapper {
  margin: 0 auto;
  text-align: center;
}
button {
  padding: 5px;
  border: 1px solid #333;
  border-radius: 5px;
}
</style>

<script>
import img from '@/static/mip.png'
export default {
  // 从 MIP 标签的属性传过来的数据，都要在 props 进行定义后才可以在 Vue 组件中使用
  props: {
    attr: {
      type: String,
      default () {
        return ''
      }
    }
  },
  data () {
    return {
      url: img,
      show: true
    }
  },
  methods: {
    hideImage () {
      this.show = false
    }
  }
}
</script>
```

这样，我们就完成了一个组件的开发，示例的功能非常简单，我们这个示例的需求是「**点击按钮即隐藏图片**」。那么我们如何使用 MIP 组件呢？

在项目的组件 `mip-example-imagehider/example` 目录中可以编辑 `mip-example-imagehider.html` 文件

```html
<!DOCTYPE html>
<html mip>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <title>MIP page</title>
    <link rel="canonical" href="对应的原页面地址">
    <link rel="stylesheet" href="https://c.mipcdn.com/static/v2/mip.css">
    <style mip-custom>
    /* 自定义样式 */
    </style>
  </head>
  <body>
    <div>
      <mip-example-imagehider attr="some data">
        <p>mip-example-imagehider 标签嵌套的内容</p>
      </mip-example-imagehider>
    </div>
    <script src="https://c.mipcdn.com/static/v2/mip.js"></script>
    <script src="/mip-example-imagehider/mip-example-imagehider.js"></script>
  </body>
</html>
```

这样我们就完成了组件测试页面的开发，关于组件开发的更多信息，可以参考[组件开发章节](../../guide/mip-cli/component-development.md)，关于 MIP 组件机制详细的内容，可以参考 [MIP 组件机制](../../guide/component/syntax.md)。

接下来就需要验证我们的组件是不是能够正常工作了，下一节我们将介绍如何预览调试组件。
