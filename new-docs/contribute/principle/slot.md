# 插槽

> 这部分内容和 [vue 组件插槽](https://cn.vuejs.org/v2/guide/components-slots.html#%E5%85%B7%E5%90%8D%E6%8F%92%E6%A7%BD) 几乎一致，因为我们的目标就是要保持一致以达到比较好的开发体验

## 插槽内容

为了保持和 Vue 开发体验一致，MIP 组件机制实现了和 Vue 几乎一致的内容分发 API， 将 MIP 组件内模板的 <slot> 元素作为承载分发内容的出口。

你可以这样组合组件

```html
<mip-link url="/profile">
  Your Profile.
<mip-link>
```

然后你在 `<mip-link>` 的模板中可能会这样写：

```html
<a
  v-bind:href="url"
  class="nav-link"
>
  <slot></slot>
</a>
```

当组件渲染的时候，这个 <slot> 元素将会被替换为“Your Profile”。插槽内可以包含任何模板代码，包括 HTML：

```html
<mip-link url="/profile">
  <!-- 添加一个 Font Awesome 图标 -->
  <span class="fa fa-user"></span>
  Your Profile
</mip-link>
```

甚至其它的组件：

```html
<mip-link url="/profile">
  <!-- 添加一个图标的组件 -->
  <mip-awesome-icon name="user"></mip-awesome-icon>
  Your Profile
</mip-link>
```

如果 <mip-link> 没有包含一个 <slot> 元素，则任何传入它的内容都会被抛弃。

## 具名插槽

有些时候我们需要多个插槽。例如，一个假设的 <mip-layout> 组件多模板如下：

```html
<div class="container">
  <header>
    <!-- 我们希望把页头放这里 -->
  </header>
  <main>
    <!-- 我们希望把主要内容放这里 -->
  </main>
  <footer>
    <!-- 我们希望把页脚放这里 -->
  </footer>
</div>
```

对于这样的情况，<slot> 元素有一个特殊的特性：name。这个特性可以用来定义额外的插槽：

```html
<div class="container">
  <header>
    <slot name="header"></slot>
  </header>
  <main>
    <slot></slot>
  </main>
  <footer>
    <slot name="footer"></slot>
  </footer>
</div>
```

在向具名插槽提供内容的时候，我们可以在一个父组件的 `<template>` 元素上使用 slot 特性：

```html
<mip-layout>
  <template slot="header">
    <h1>Here might be a page title</h1>
  </template>

  <p>A paragraph for the main content.</p>
  <p>And another one.</p>

  <template slot="footer">
    <p>Here's some contact info</p>
  </template>
</mip-layout>
```

另一种 slot 特性的用法是直接用在一个普通的元素上：

```html
<mip-layout>
  <h1 slot="header">Here might be a page title</h1>

  <p>A paragraph for the main content.</p>
  <p>And another one.</p>

  <p slot="footer">Here's some contact info</p>
</mip-layout>
```

我们还是可以保留一个未命名插槽，这个插槽是默认插槽，也就是说它会作为所有未匹配到插槽的内容的统一出口。上述两个示例渲染出来的 HTML 都将会是：

```html
<div class="container">
  <header>
    <h1>Here might be a page title</h1>
  </header>
  <main>
    <p>A paragraph for the main content.</p>
    <p>And another one.</p>
  </main>
  <footer>
    <p>Here's some contact info</p>
  </footer>
</div>
```

## 插槽的默认内容

有的时候为插槽提供默认的内容是很有用的。例如，一个 <mip-submit-button> 组件可能希望这个按钮的默认内容是“Submit”，但是同时允许用户覆写为“Save”、“Upload”或别的内容。

你可以在 <slot> 标签内部指定默认的内容来做到这一点。

```html
<button type="submit">
  <slot>Submit</slot>
</button>
```

如果父组件为这个插槽提供了内容，则默认的内容会被替换掉。

## 和 Vue 插槽的区别

1. MIP 不支持编译作用域(Compilation Scope)，不支持以下写法：
```
<mip-link url="/profile" slot-scope="{user}">
  Logged in as {{ user.name }}
</mip-link>
```

因为 HTML 的内容不在 Vue 模板里，线上 Vue 没有编译器 compiler，无法做到运行时编译。

如果要组件要支持传入模板，可以通过过以下方式实现：

```html
<!-- 在 HTML 中使用 -->
<mip-link url="/profile" slot-scope="{user}">
  <template type="mip-mustache">
    Logged in as {{ user.name }}
  </template>
</mip-link>
```

```html
<template>
  <div>
    <span v-html="itemContent"></span>
  </div>
</template>
<script>
export default {
  connectedCallback(element) {
    let template = element.querySelector('template[type=mip-mustache]')
    element.itemTemplate = template && template.innerHTML
  },
  created() {
    this.itemContent = render(this.$element.itemTemplate, this.resp)
  }
}
</script>
```

2. MIP 组件内部使用通过实例获取的 `this.$slots[name]` 获取的 slots 数组元素是 HTML Node 节点（不是 HTMLElement，因为包含一些 Text Node），而 Vue 获取到的是 VNode 节点。
