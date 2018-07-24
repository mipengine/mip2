# MIP 组件和 Vue 的关系

MIP 组件化的核心是基于 Custom Elements（自定义元素）来实现的。Custom Elements 可以让浏览器识别我们自定义的 HTML 标签，并将我们预先定义的标签内容和结构在网页中渲染出来。Custom Elements 目前已经被纳入 W3C DOM 标准，MIP 采用的是 Custom Elements V1 规范，但考虑到目前并不是所有的浏览器都完全支持该标准，MIP 引入了相关的 [polyfill](https://github.com/WebReflection/document-register-element) 来兼容暂时不支持 Custom Elements 标准的浏览器。

## 定义自定义元素

如果浏览器支持 Custom Elements 标准，在 window 下就会有 customElements 对象，customElements 对象含有一个 `define()` 方法用来注册和定义一个 HTML 自定义元素，下面我们展示一段用来创建自定义元素的 JS 代码：

```js
window.customElements.define('custom-drawer', class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<p>Hello world.</p>'
  }
});
```

`define` 方法接收两个参数，第一个参数为需要创建的 HTML 自定义元素的名称，第二个参数为一个继承 `HTMLElement` 的类，通过重写 `HTMLElement` 的一些方法，就可以定制 HTML 自定义元素的内容，从而可以完全的从新创造一个自定义的 HTML 元素。

如果我们像上面的 JS 代码一样通过 `window.customElements.define()` 方法注册了一个名为 `custom-drawer` 的自定义元素，那对应的 HTML 自定义标签为 `<custom-drawer>`，在 HTML 文档中就可以直接像下面这样使用新的 HTML 自定义标签：

```html
  <!-- index.html -->
  <!-- 在使用的时候并没有指定 custom-drawer 的内容 -->
  <custom-drawer></custom-drawer>
</html>
```

HTML 文档通过浏览器的渲染，最终在浏览器渲染后的 DOM 结构如下所示：

```html
  <!-- 渲染之后 custom-drawer 就包含了内容 -->
  <custom-drawer>
    <p>Hello world.<p>
  </custom-drawer>
```

我们可以发现自定义标签 `<custom-drawer>` 被渲染出来了，并且我们在 JS 中定义的 `this.innerHTML` 的内容也被渲染在自定义元素 `<custom-drawer>` 的内部。

## MIP 组件

MIP 组件和 Custom Elements 是密不可分的，接下来我们看下 MIP 是如何利用 Custom Elements 实现 MIP 组件的，MIP 暴露了一个注册 MIP 组件的方法 `MIP.registerCustomElement()` 用来注册 MIP 组件，调用方式如下：

```js
MIP.registerCustomElement('mip-drawer', CustomElementClass, css)
```

和前面小节讲到的 `window.customElements.define` 方法用法类似，只是 `MIP.registerCustomElement` 接收三个参数，第一个参数也是指定一个 MIP 标签的名称，MIP 组件名称都是要求以 `mip-` 开头，第二个参数为也是一个继承于 `HTMLElement` 的类，第三个参数可选，为 CSS 代码字符串，可以给 MIP 组件通过注册的时候指定默认 CSS 样式。

`MIP.registerCustomElement()` 方法精简后的代码实现大体如下：

```js
class BaseElement extends HTMLElement {
  constructor (element) {
    super(element)

    let CustomElement = customElementsStore.get(this.tagName.toLowerCase(), 'mip2')
    let customElement = this.customElement = new CustomElement(this)
  }

  connectedCallback () {
    this.customElement.connectedCallback()
  }

  disconnectedCallback () {
    this.customElement.disconnectedCallback()
  }

  attributeChangedCallback () {
    this.customElement.attributeChangedCallback.apply(ele, arguments)
  }
  // 渲染自定义元素内部结构
  build () {
    if (this.isBuilt()) {
      return
    }
    this.customElement.build()
    this._built = true
  }

  isBuilt () {
    return this._built
  }
}

MIP.registerCustomElement = function (name, CustomElementClass, css) {
  // 检查是否已注册过该自定义元素，避免重复注册
  if (customElementsStore.get(name)) {
    return
  }
  customElementsStore.set(name, CustomElementClass, 'mip2')
  // 定义自定义元素
  window.customElements.define(name, class extends BaseElement {
    // 显式声明需要监听自定义元素属性变化的属性名
    static get observedAttributes () {
      return CustomElementClass.observedAttributes
    }
  })
}
```

由于 MIP 组件有些公共的逻辑要在生命周期钩子中执行，而自定义组件是通过继承的方式扩展的，如果直接继承 BaseElement 很容易造成自定义组件扩展在重载方法时忘记调用父类的方法，导致 MIP 对自定义元素失去控制，所以 MIP 提供了一个给开发者自定义元素的 `CustomElement` 实现类。MIP 的自定义元素基类 `CustomElement` 基类除了提供规范的定义的几个方法外，还提供了 `firstInviewCallback()`、`viewportCallback()` 之类的回调方法，详见 [MIP 生命周期](./instance-life-cycle.md)。

在引入 MIP 核心代码之后，在 JS 中我们可以通过如下的方式使用 `MIP.registerCustomElement()` 方法进行注册一个 MIP 组件：

```js
MIP.registerCustomElement('mip-drawer', class extends MIP.CustomElement {
    build() {
        this.element.innerHTML = '<p>Hello world.</p>'
    }
})
```

注册 MIP 组件 `mip-drawer` 之后，在 HTML 中就可以直接这样使用新的自定义标签 `<mip-drawer>`：

```html
<mip-drawer></mip-drawer>
```

MIP 标签在浏览器中渲染后的结果如下所示：

```html
<!-- mip-drawer 标签上会加一些 mip 相关的 class -->
<mip-drawer class="mip-element">
    <p>Hello world.<p>
</mip-drawer>
```

从渲染后的结果看，和 Custom Element 一样，最终渲染后的 MIP 标签中已经包含了我们在组件注册中指定的内容。

## 在 MIP 组件中使用 Vue

考虑到 MIP 组件内部的交互逻辑会非常复杂，通过拼接 HTML 的方式构造渲染后的内容过于繁琐，再遇上各种属性绑定，事件处理等问题就更麻烦了，代码也非常不好维护，于是 MIP 又在 Custom Element 的基础上又封装了一层 Vue，可以直接通过写 Vue 组件的方式来写 MIP 组件，MIP 暴露一个 `MIP.registerVueCustomElement()` 的方法用来注册 Vue 组件为 Custom Element, 用法如下:

```js
MIP.registerVueCustomElement(mipTagName, vueCompnentDefinition)
```

`MIP.registerVueCustomElement()` 方法包含两个参数，第一个参数，必填，MIP 标签名，必须以 `mip-` 开头，第二个参数为 Vue 组件定义对象，可以参考 [vue 文档](https://cn.vuejs.org/v2/guide/instance.html)

通过这个接口可以这么写 MIP 组件：

```js
MIP.registerVueCustomElement('mip-drawer', {
    template: '<p>Hello world.</p>'
})
```

在 HTML 中就可以直接使用 `<mip-drawer>` 标签：

```html
<mip-drawer></mip-drawer>
```

浏览器渲染后的结果如下：

```html
<!-- 内部多了一个 div 标签是因为 vue 实例必须要有一个根元素，而自定义标签不能作为 vue 实例的根元素 -->
<mip-drawer class="mip-element">
    <div>
        <p>Hello world.<p>
    </div>
</mip-drawer>
```

通过 mip-cli 工具，我们可以使用单文件的方式去开发 MIP 组件，假设我们的 `<mip-drawer>` 标签对应的 vue 组件文件名为 `mip-drawer.,vue`，下面是 `mip-drawer.vue` 文件的代码：

```html
<template>
  <p>Hello world.<p>
</template>
<script>
  export default {
    // vue 组件定义
  }
</script>
<style>
/* css style*/
</style>
```

通过 mip-cli 工具编译后会将 `mip-drawer.vue` 文件打包成 `mip-drawer.js` 文件， 并在构建的 JS 文件中自动通过 `MIP.registerVueCustomElement()` 方法完成了 vue 组件注册成 MIP 组件自定义元素的工作。

接下来我们可以看下 `MIP.registerVueCustomElement()` 方法是如何实现的，下面是精简后的代码。

```js
MIP.registerVueCustomElement = function (tag, vueComponent) {
  Vue.customElement(tag, vueComponent)
}
```

在 MIP 通过 vue 组件注册一个自定义元素的时候，只是仅仅调用了 `Vue.customElement()` 方法而已，而 `Vue.customElement()` 方法的实现代码精简后是如下这样的：

```js
Vue.customElement = (tag, componentDefinition) => {
  const props = getProps(componentDefinition)

  class VueCustomElement extends CustomElement {
    // 创建 vue 实例
    _build () {
      let vueInstance = this.vueInstance = createVueInstance(
        this.element, {
          Vue
        },
        componentDefinition,
        props
      )
      this.props = props
      this.vm = vueInstance.$children[0]
    }

    build () {
      this._build()
    }

    // 自动绑定自定义标签属性的变化，如果发生变化直接映射到 vue props 属性的变化
    attributeChangedCallback (name, oldValue, value) {
      if (this.vueInstance) {
        const nameCamelCase = camelize(name)
        const type = this.props.types[nameCamelCase]
        // 会根据 props 定义的 type 对字符串属性值自动解析
        this.vueInstance[nameCamelCase] = convertAttributeValue(value, type)
      }
    }

    // 根据 vue 组件定义 props 关联 CustomElement 的 observedAttributes
    static get observedAttributes () {
      return props.hyphenate || []
    }
  }

  registerElement(tag, VueCustomElement)
}
```

通过上面的代码，我们可以知道，实际上 vue 实例是在 MIP 组件 build 的回调里创建的，并通过和 Custom Elements 的相关回调钩子传递数据到 vue 实例内部。

通过以上对 MIP 组件核心源码解析，我们要注意使用 vue 语法写的 MIP 组件需要明确以下几点：

- 每个自定元素都创建了一个 vue 实例，只负责渲染自定义元素的内部结构，在 HTML 文档中，MIP 自定义元素跟 vue 是**毫无关系**的。
- MIP 组件定义的自定义元素在 HTML 上完全遵循 HTML 标准，**完全不支持 vue 的语法**，vue 语法只存在组件内部实现。
- 组件内部的 vue 组件语法和常规的 vue 语法完全一致。

## 使用 vue 组件方式开发的特性

虽然在 HTML 语法中不支持 vue 语法，但是 MIP 也提供了很多特性使开发者使用起来更加简单：

- Props 属性传递, 通过 HTML 自定义标签的属性和属性值定义，就可以将自定义标签的属性数据传递给 vue 组件，vue 组件通过 props 属性进行接收。
- [Slots 内容插槽/分发](./slots.md) 可以将 HMTL 自定义元素的内容直接分发到 vue 模板内部的 `<slot>` 标签
- [Events 事件绑定](./actions-and-events.md)， 可以通过 $emit 和 $on 方法替代 addEventAction 和 eventAction.execute
- [数据绑定](../interactive-mip/mip-bind.md)，HTML 自定义标签上的属性变化会实时反馈到 vue 内部
