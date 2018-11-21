# MIP 2.0 组件实例的生命周期和回调钩子

## 创建一个简单的 mip 组件

为了提升 mip 组件的开发效率，我们允许开发者使用 vue 开发 mip 组件，然后通过 mip-cli 工具编译成 mip 组件，下面是一个用 vue 写的 mip 组件 `mip-example`：

```html
<template>
  <div>
    <h1>MIP 2.0 component example</h1>
  </div>
</template>

<style scoped></style>

<script>
export default {
  // component options
}
</script>
```

然后使用 mip-cli 工具编译打包后大概是这样的：

```js
// 创建 style 标签，并为 css 加上 scope
// 将 template 编译成 render 函数

// 注册自定义组件
MIP.registerVueCustomElement(
  'mip-example',
  componentDefinition // component options
);
```

## mip 和 vue 的关系

mip 组件是基于[Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) 规范实现的一种用于创建自定义 HTML 元素。为了方便开发，mip2 支持开发者使用 vue 的方式开发 mip 组件，而隐藏了自定义元素注册和生命周期回调，开发者可以完全专注 vue 组件的开发。下面是 vue 和 mip 之间的关系示意图：

![vue 和 mip 关系示意图](./images/vue-and-mip-component.png)


## 组件实例生命周期

你可以定义以下的生命周期回调钩子,这些回调会在自定义元素的生命周期的不同点回调。所有的生命周期钩子自动绑定 this 上下文到 vue 实例中，因此你可以访问数据，对属性和方法进行运算。这意味着 你不能使用箭头函数来定义一个生命周期方法 (例如 created: () => this.fetchTodos())。这是因为箭头函数绑定了父上下文，因此 this 与你期待的 Vue 实例不同，this.fetchTodos 的行为未定义。

### beforeCreate

- 类型：Function
- Context: Vue 组件实例
- 详细：

    vue 实例生命周期，在 vue 实例初始化之后，数据观测 (data observer) 和 event/watcher 事件配置之前被调用。如果 prerenderAllowed() 为真，在自定义元素的 connectedCallback 中执行， 反之在 firstInviewCallback 中执行。

### created

- 类型：Function
- Context: Vue 组件实例
- 详细：

    vue 实例生命周期，在 vue 实例创建完成后被立即调用。在这一步，实例已完成以下的配置：数据观测 (data observer)，属性和方法的运算，watch/event 事件回调。然而，挂载阶段还没开始，$el 属性目前不可见。

### beforeMount

- 类型：Function
- Context: Vue 组件实例
- 详细：

    vue 实例生命周期，在挂载开始之前被调用：相关的 render 函数首次被调用。在自定义元素的 connectedCallback 钩子中执行。

### mounted

- 类型：Function
- Context: Vue 组件实例
- 详细：

    vue 实例生命周期，el 被新创建的 vm.$el 替换，并挂载到实例上去之后调用该钩子。如果 root 实例挂载了一个文档内元素，当 mounted 被调用时 vm.$el 也在文档内。在自定义元素的 connectedCallback 钩子中执行，connectedCallback 可能会因为元素从 DOM 结构上移动而触发多次执行，但是 mounted 只会执行一次。

### beforeUpdate

- 类型：Function
- Context: Vue 组件实例
- 详细：

    vue 实例生命周期，数据更新时调用，发生在虚拟 DOM 打补丁之前。这里适合在更新之前访问现有的 DOM，比如手动移除已添加的事件监听器。

### updated

- 类型：Function
- Context: Vue 组件实例
- 详细：

    vue 实例生命周期，由于数据更改导致的虚拟 DOM 重新渲染和打补丁，在这之后会调用该钩子。

### firstInviewCallback

- 类型：Function
- Context: Vue 组件实例
- 参数
    - element `{Element}` Element 实例
- 详细：

    自定义元素的生命周期钩子，在元素挂载到 DOM 上之后，首次出现在视口内上时执行。适合做懒加载之类的功能。

### connectedCallback

- 类型：Function
- Context: CustomElement
- 参数
    - element `{Element}` Element 实例
- 详细：

    自定义元素的生命周期钩子，元素挂载到 DOM 上之后执行，该钩子在执行 mounted 之后执行。

### disconnectedCallback

- 类型：Function
- Context: CustomElement
- 参数
    - element `{Element}` Element 实例
- 详细：

    自定义元素的生命周期钩子，元素从 DOM 上移除之后执行。

### 生命周期图示

下图展示了通过 vue 编写 mip 组件实例的生命周期，其中红色框暴露给开发者的生命周期钩子，可以看到除了 firstInviewCallback / connectedCallback / disconnectCallback 钩子，其他钩子都是 vue 的生命周期，这么做也是为了降低学习成本，提高开发效率。

![mip2 组件生命周期](https://boscdn.baidu.com/v1/assets/mip/mip2-component-lifecycle.png)
