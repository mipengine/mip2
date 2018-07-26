# 3. 开发组件

本节中，我们将实现一个简单的点击按钮隐藏图片的组件，以此为例，介绍开发自定义组件的流程。MIP 内部整合了 Vue 核心代码，因此可直接参考 Vue 的语法进行代码编写，我们建议以 .vue，即 Vue 单文件组件的形式去开发 MIP 组件，mip-cli 工具会在编译阶段自动将 .vue 文件自动编译成可供 MIP 运行的 JS 文件。

## 新增组件

在我们的 `example.com` 站点目录下，运行 `add` 命令，新增一个组件模板。假设我们要编写的组件名为 imagehider，我们可以命名为 `mip-example-imagehider`，中间加上站点名称来标识和区分。

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

编辑 `mip-example-iamgehider.vue` 文件，书写的语法 Vue 组件基本是一样的。如果对 Vue 不熟悉，可以先阅读[文档](http://cn.vuejs.org/)进行了解。我们引入上述图片，并编码实现点击隐藏的简单功能，代码如下：

```html
<template>
  <div class="wrapper">
    <mip-img
      v-show="show"
      :src="url"/>
    <button
      type="button"
      @click="hideImage">hide image</button>
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
  data () {
    return {
      url: img,
      show: true
    }
  },
  methods: {
    hideImage: function () {
      this.show = false
    }
  }
}
</script>
```

示例的功能非常简单，点击按钮即隐藏图片。关于组件开发的更多信息，可以参考[组件开发章节](../../guide/mip-cli/component-development.md)。
