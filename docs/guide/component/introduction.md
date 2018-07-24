# MIP 组件化介绍

## customElement 自定义标签

通过对 MIP 的了解我们知道了 MIP-HTML 中有两种标签，一种是 `<div>`, `<span>` 这种常规 HTML 标签，还有一种是类似于 `<mip-demo>` 这种 customElement(自定义标签)。[customElement](https://github.com/shawnbot/custom-elements) 标准还处于草案中，但是已经被绝大多数浏览器支持并实现，可以和常规的 HTML 标签一样被渲染。

但在 MIP 2.0 的目标和场景下，为了保证性能和体验，不允许在 JS 中用操作 DOM 的方式来通过 customElement 进行交互，但是为了保证 MIP 应用的体验， customElement 是需要做很多额外的交互和性能优化逻辑及业务逻辑的，所以这时候 MIP 需要让 customElement 自身在内部就定义或执行一些的交互和逻辑，然而这一切都是需要 JS 代码来完成。

在这个背景下，MIP 提出了基于 customElement 组件化概念，也就是说 MIP 需要自己渲染 customElement 并执行其内部的交互或业务逻辑。也就是说每一个 MIP customElement 其实都对应着一个 **MIP 组件**，而在组件内部去完成复杂 JS 逻辑。

## MIP 组件化应用构建

首先需要介绍一个概念：**组件系统** ，组件系统是一个重要概念，它是一种抽象，它允许我们使用小型、独立和通常可复用的 **组件** 构建大型应用。仔细想想，几乎任意类型的应用界面都可以抽象为一个组件树。

![参考 vue 的图](https://cn.vuejs.org/images/components.png)

所以在 MIP 方案中，MIP-HTML 中刨除没有逻辑的常规 HTML 标签，所有 customElement 标签也构成了一个组件树，所以前面就说到了：**每一个 MIP 标签都对应一个 MIP 组件**，MIP 可以通过 MIP 组件构建出复杂的 MIP 应用。

## MIP 组件

那么什么是 MIP 组件呢？每一个 customElement 对应一个组件实例，在 MIP-HTML 页面加载完成后，MIP-JS 会注册页面中所有的 customElement 对应的组件，也就是每个 customElement 会有对应的初始化一个组件实例。

当然，每个组件只有被注册了才可以在 MIP 中被使用。

### 组件名

在注册一个组件的时候，我们始终需要给它一个名字。

```js
mip.registerVueCustomElement('mip-demo', {/* options */});
```

该组件名就是 `mip.registerVueCustomElement` 的第一个参数，组件名就是你在 MIP-HTML 中使用的 customElement 标签名，我们强烈推荐遵循 [W3C 规范](https://www.w3.org/TR/custom-elements/#concepts) 中的自定义组件名 (字母全小写且必须包含一个连字符)。这会帮助你避免和当前以及未来的 HTML 元素相冲突。

### 组件注册

我们用 `MIP.registerVueCustomElement` 方法来创建组件：

```js
MIP.registerVueCustomElement('my-component-name', {
    // ... 选项 ...
});
```

这些组件是全局注册的。也就是说它们在注册之后在 MIP-HTML 中对应的 customElement 就会初始化一个实例，并开始渲染并执行实例生命周期回调：

```js
MIP.registerVueCustomElement('component-a', { /* ... */ });
MIP.registerVueCustomElement('component-b', { /* ... */ });
MIP.registerVueCustomElement('component-c', { /* ... */ });
```

```html
<div id="app">
  <component-a></component-a>
  <component-b></component-b>
  <component-c></component-c>
</div>
```

## 基于 Vue 实现

在 MIP 2.0 中，一个 MIP 组件本质上是一个拥有预定义选项的一个 Vue 实例。因为 MIP 2.0 的组件化方案是基于 Vue 实现的。

从前面的注册方式可以看到，`mip.registerVueCustomElement` 和 `Vue.component` 接受的参数是一样的， 详见 [Vue 的组件注册](https://cn.vuejs.org/v2/guide/components-registration.html)。

### 为什么选择 Vue

首先 Vue 本身就是一个非常完善的组件化方案，这是完全满足 MIP 的诉求的，当然还有其他的一些原因：

- 组件需要支持数据驱动，双向绑定，slot 机制，模版语法等
- Vue 社区和生态已经非常成熟，MIP 可以使用 Vue 一摸一样的方式开发组件，开发者介入成本低
- Vue 组件也有自己完善生命周期
- 很多 Vue 的组件可以直接拿到 MIP 中使用

## 如何使用

MIP 支持在 MIP-HTML 文档中使用 customElement 标签，customElement 标签和常规的 HTML 标签在用法上完全保持一致，下面是一个简单的 customElement 标签 `mip-hello-world` 在 MIP-HTML 文档中的用法。

```html
<mip-hello-world attr1="hello" attr2="world"></mip-hello-world>
```

注册 MIP 组件的方法如下：

```js
MIP.registerVueCustomElement(
  'mip-hello-world',
  /**
    * 这里传入的对象就是 Vue 的实例对象（先不要蒙，后面我们会讲为什么会是一个 Vue 的实例）。
    * 但 MIP 中组件是独立以 Vue 单文件开发发布的，所以注册这一步在 mip-cli 中已经自动完成
    */
  {
    // 由于 Mip 种的 Vue 不带 compiler，所以其实不支持 template 写法，只支持 render 方法，此处为示意代码
    template: `
      <div class="hello-world-wrap">
        {{ attr1 }}, {{ attr2 }}
      </div>
    `,
    props: ['attr1', 'attr2']
  }
);
```

当页面开始渲染的时候，会将 `mip-hello-world` 渲染为如下 HTML 片段：

```html
<mip-hello-world>
  <div class="hello-world-wrap">
    hello, world
  </div>
</mip-hello-world>
```

开发组件的时候既然是使用 Vue 的方式开发 Vue 组件，那如何和 MIP-HTML 中的 customElement 进行关联上呢？

MIP 会在注册 customElement 的时候约定，当开始渲染 MIP-HTML 中的 customElement 的时候，会创建一个对应的 Vue 实例，customElement 的内容都是通过对应的 Vue 组件的实例渲染出来的，当然由于 customElement 有自身标准的 API, 和 Vue 的生命周期还是有些出入，详见 [MIP 组件生命周期](./instance-life-cycle.md)，而 Vue 组件渲染是依赖数据的，customElement 是如何将数据传给组件呢？详见 [MIP 语法](./syntax.md)。
