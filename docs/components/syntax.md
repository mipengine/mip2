# MIP-HTML 语法和对应 MIP 组件开发介绍

MIP-HTML 中就是一些 HTML 标签，其中包含常规的 HTML 标签和 customElement 自定义标签，在这里重点介绍一下 customElement 的用法以及 customElement 对应的 MIP 组件对应的开发需要有哪些注意点。主要涉及到两个方面：**customElement 对 MIP 组件的数据传入** 以及 **customElement 嵌套内容的渲染** 。

## HTML 中使用 custom Element

在 MIP-HTML 可以直接写 customElement，和常规 HTML 标签一样。

可以是单独的一个空标签：

```html
<mip-img src="https://somecdn.baidu.com/xxx/xxx.png" width="200" height="300" />
```

也可以是一个标签对，其中可以插入内容：

```html
<mip-content>
  <div class="header">
    i am header
  </div>
  <div class="footer">
    i am footer
  </div>
</mip-content>
```

customElement 也可以互相嵌套使用：

```html
<mip-carousel
  width="970"
  height="696"
  autoplay
  indicatorId="mip-carousel-example"
  indicator
  defer="5000"
  layout="responsive"
>
  <mip-img src="https://somecdn.baidu.com/xxx/xxx.png" />
  <mip-img src="https://somecdn.baidu.com/xxx/xxx.png" />
  <mip-img src="https://somecdn.baidu.com/xxx/xxx.png" />
  <mip-img src="https://somecdn.baidu.com/xxx/xxx.png" />
<mip-carousel>
```

## 数据传入

customElement 其实就是和我们一直熟悉的 HTML 标签是一样的，但是我们怎么保证 customElement 对应的组件能够明确的执行正确的逻辑呢？说白了，怎么让 MIP 组件实例对象能够顺利的拿到 customElement 的数据呢？

### props

从技术上角度，在 MIP 1.0 中，MIP 组件实例是通过 DOM 操作读取 customElement 的属性值的方式来获取数据（这符合常规的 HTML 标签书写方式），然后在组件实例内部使用这些 customElement 属性值进行一系列的逻辑处理。

那么在 MIP 2.0 中，同样还是通过 customElement 的属性值的方式来传递数据，但是在组件中，我们不需要再通过 DOM 操作的方式来读取属性值获取数据了，我们借助了 Vue 组件的 props 机制：

我们看一下下面的例子：

```html
<!--mip.html-->
<mip-hello-world attr1="hello" attr2="world"></mip-hello-world>
```

而对应的组件如下：

```html
<!--mip-hello-world.vue-->
<template>
  <div class="mip-hello-world-wrap">
    {{ greeting }}, {{ name }}
  </div>
</template>
<script>
  export default {
    // 如果开发自定义组件的时候，任何要用到的数据都需要在 props 这里预定义
    props: ['attr1', 'attr2'],
    computed: {
      greeting() {
        return this.attr1;
      },
      name() {
        return this.attr2;
      }
    }
  }
</script>
```

渲染出来的内容就是我们所希望看到的：

```html
<mip-hello-world>
  <div class="mip-hello-world-wrap">
    hello, world
  </div>
</mip-hello-world>
```

从上面的例子看，如果要在组件中接收 customElement 传递的数据，就必须在组件的 props 配置项中预先定义好数据的 key。
另外，如果熟悉 Vue 的开发方式，以上的组件形态是不是很眼熟？:P

customElement 属性传值的方式很方便以及毫无违和感，但是属性值仅仅只能传字符串、数字、布尔值这样的简单类型的数据，如果一个复杂的组件需要结构化的数据就不好弄了，MIP 2.0 提供了两种方式来解决这个问题：**props 传 JSON 串** 或者 **借助 script 标签**。

### props 传 JSON

例如有一个列表组件，需要展现的数据对应的是一个数组：

```json
[
  {
    "name": "Tom",
    "age": 23
  },
  {
    "name": "Jerry",
    "age": 10
  }
]
```

那么在 customElement 中可以直接通过传入 JSON 串的方式将数据传递给组件，如下所示：

```html
<mip-demo-list listdata='[{"name":"Tom","age":23},{"name":"Jerry,"age":10}]'></mip-demo-list>
```

### 借助 script 标签

除了通过 props 传递 JSON 的方式，MIP 2.0 还提供了使用 script 标签的方式传递复杂数据，毕竟 JSON 串非常不直观，如下所示：

```html
<mip-demo-list>
  <script type="application/json">
  {
    listdata: [
      {
        "name": "Tom",
        "age": 23
      },
      {
        "name": "Jerry",
        "age": 10
      }
    ]
  }
  </script>
</mip-demo-list>
```

> warn
> 注意：这个 script 标签必须是 `type="application/json"` 的

无论是 props 传递 JSON 的方式，还是 script 标签的方式，组件接收的方式都是一样的，都是通过 props 属性来接受数据：

```html
<!--mip-demo-list.vue-->
<template>
  <div class="mip-demo-list-wrap">
    <div class="item" v-for="item in listdata">
      <div class="item-name">{{ item.name }}</div>
      <div class="item-name">{{ item.age }}</div>
    </div>
  </div>
</template>
<script>
  export default {
    props: ['listdata']
  }
</script>
```

最后渲染出来的结果都是：

```html
<div class="mip-demo-list-wrap">
  <div class="item">
    <div class="item-name">Tom</div>
    <div class="item-name">23</div>
  </div>
  <div class="item">
    <div class="item-name">Jerry</div>
    <div class="item-name">10</div>
  </div>
</div>
```

## 嵌套标签

在 MIP-HTML 中还有一种常见的使用方式就是嵌套标签了:

```html
<mip-demo>
  <div class="header">i am header</div>
  <div class="footer">i am footer</div>
</mip-demo>
```

在 customElement 标签用法上，这种用法太常见了，但是如果将 customElement 和 MIP 组件对应上，在组件开发的时候需要考虑一些问题，假如 `mip-demo` 对应的组件如下：

```html
<!--mip-demo.vue-->
<template>
  <div class="mip-demo-wrap">
    default component content
  </div>
</template>
```

那最终渲染出来的内容如下：

```html
<mip-demo>
  <div class="mip-demo-wrap">
    default component content
  </div>
</mip-demo>
```

这显然不符合我们的预期，customElement 中的嵌套的内容全丢掉了，如果需要让 customElement 中嵌套的内容也展现出来，需要借助 slot 插槽机制，可以在 MIP 组件模版中假如一个匿名的 slot 标签，这个 slot 就可以控制 customElement 中内容需要最终渲染在什么地方，假设，我们需要将组件的默认内容渲染在 customElement 嵌套内容前面，只需要改动一下 `<mip-demo>` 组件的模版：

```html
<!--mip-demo.vue-->
<template>
  <div class="mip-demo-wrap">
    default component content
    <slot></slot>
  </div>
</template>
```

这样就会渲染出我们想要的内容了：

```html
<mip-demo>
  <div class="mip-demo-wrap">
    default component content
    <div class="header">i am header</div>
    <div class="footer">i am footer</div>
  </div>
</mip-demo>
```

如果我们想实现下面的效果呢？

```html
<mip-demo>
  <div class="mip-demo-wrap">
    <div class="header">i am header</div>
    default component content
    <div class="footer">i am footer</div>
  </div>
</mip-demo>
```

这时候需要对 customElement 稍微做一下改动，这里需要引入具名 slot 的概念：

```html
<mip-demo>
  <div class="header" slot="header">i am header<div>
  <div class="header" slot="footer">i am header<div>
</mip-demo>
```

而 MIP 组件中，则需要有对应的具名 slot 在正确的位置：

```html
<!--mip-demo.vue-->
<template>
  <div class="mip-demo-wrap">
    <slot name="header"></slot>
    default component content
    <slot name="footer"></slot>
  </div>
</template>
```

这样就能渲染出我们预想的结果了。

通过了解了 customElement 对应的 MIP 2.0 组件之后，其实可以发现，就是借助 Vue 的组件的一些特性来解决 customElement 复杂交互逻辑的问题。

## 常见问题

### Q: 能不能在 MIP2 组件的单 Vue 文件中使用其他的 Vue 组件？

答：可以的，可以直接通过 component import 的方式直接引入使用，如果不需要通过 customElement 渲染，引入的 Vue 组件可以不通过 `mip2 add` 添加，可以直接拷贝过去使用，注意：现在 MIP 组件不支持通过 `Vue.use()` 方式引入组件库。

### Q: 是不是必须写 Vue 单文件开发 MIP2 组件呢？

答：是的，必须要求每个组件都是 Vue 单文件，不允许出现 `template` 字段：

```html
<!--bad case-->
<!--mip-demo.vue-->
<script>
  export default {
    // ...
    template: `
      <div class="wrap">
        <!-- ... -->
      </div>
    `
    // ...
  }
</script>
```

而应该在单文件的 `template` 标签中写模版，因为 MIP 集成的 Vue 是不包含 compiler 的 runtime 版本，所以不能编译 template 属性，只能执行通过组件 cli 工具编译 `template` 标签之后的 `render()` 方法，所以如果想要组件模版顺利渲染，必须按照以下单文件的方式书写模版：

```html
<!--good case-->
<!--mip-demo.vue-->
<template>
  <div class="wrap">
    <!-- ... -->
  </div>
</template>
<script>
export default {
  // ...
}
</script>
```

### Q：除了单文件，我还有没有别的方式引入别的组件

如果你有方法拿到一个 Vue 的 Component 对象，那可以直接引入这个 Component 对象，然后就可以通过 customElement 渲染这个 Vue 的 Component，可以借助于 `MIP.registerVueCustomElement()` 方法：

```js
let aVueComponentObject = require('./a-vue-component-object');
// 假设 aVueComponentObject 是一个完整的 Vue Component 对象

registerVueCustomElement('mip-demo-vue-component', aVueComponentObject);
```

这样就可以直接使用 `<mip-demo-vue-component>` customElement 标签啦。

> PS: 目前常见问题还在持续更新中。。
