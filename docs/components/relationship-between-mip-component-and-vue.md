# MIP 组件和 Vue 的关系

MIP 组件的核心是 Custom Element 自定义元素，即可以让浏览器识别自定义 HTML 标签，并根据我们定义的结构渲染到页面。MIP 使用的是 Custom Element V1 规范的实现，虽然浏览器的支持度不高，但是这是未来的趋势，MIP 引用了相关的 [polyfill](https://github.com/WebReflection/document-register-element) 来兼容低端的浏览器。

## 定义自定义元素

利用 Custom Element V1 规范提供的接口 `window.customElements`, 可以让浏览器识别新的元素。我们可以这么创建一个自定义元素：

```js
window.customElements.define('mip-drawer', class extends HTMLElement {
    connectedCallback() {
        this.innerHTML = '<p>Hello world.</p>'
    }
});
```

在 HTML 中就可以直接这样使用新元素：

```html
<mip-drawer></mip-drawer>
```

渲染后的结果：

```html
<mip-drawer>
    <p>Hello world.<p>
</mip-drawer>
```

## MIP 组件

接下来我们看下 MIP 是如何利用 CustomElements 实现 MIP 组件的，MIP 暴露了一个注册 MIP 组件的接口

```js
MIP.registerCustomElement(tag, CustomElementClass, css)
```

精简后的代码实现如下：

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

function registerElement (name, CustomElementClass, css) {
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

由于 MIP 组件有些公共的逻辑要在生命周期钩子中执行，而自定义组件是通过继承的方式扩展的，如果直接继承 BaseElement 很容易造成自定义组件扩展在重载方法时忘记调用父类的方法，导致 MIP 对自定义元素失去控制，所以这里提供了一个给开发者自定义元素的 `CustomElement` 实现类。MIP 的自定义元素基类 CustomElement 基类除了提供规范的定义的几个方法外，还提供了 firstInviewCallback、viewportCallback 之类的回调方法。那现在写 MIP 组件可以这样写：

```js
MIP.registerCustomElement('mip-drawer', class extends MIP.CustomElement {
    build() {
        this.element.innerHTML = '<p>Hello world.</p>'
    }
})
```

在 HTML 中就可以直接这样使用新元素：

```html
<mip-drawer></mip-drawer>
```

渲染后的结果：

```html
<!-- mip-drawer 标签上会加一些 mip 相关的 class -->
<mip-drawer class="mip-element">
    <p>Hello world.<p>
</mip-drawer>
```

## 在 MIP 组件中使用 Vue

考虑到组件内部的交互逻辑越来越复杂，手写拼接 HTML 太原始了，遇上各种属性绑定，事件处理什么的就更麻烦了，代码也不好维护，于是 MIP 又在 CustomElement 的基础上又封装了一层 Vue，可以直接使用写 Vue 的方式来写 MIP 组件，MIP 暴露一个方法:

```js
MIP.registerVueCustomElement(tag, vueCompnentDefinition)
```

通过这个接口可以这么写 MIP 组件：

```
MIP.registerVueCustomElement(tag, {
    template: '<p>Hello world.</p>'
})
```

在 HTML 中就可以直接这样使用新元素：

```html
<mip-drawer></mip-drawer>
```

渲染后的结果：

```html
<!-- 内部多了一个 div 标签是因为 vue 实例必须要有一个根元素，而自定义标签不能作为 vue 实例的根元素 -->
<mip-drawer class="mip-element">
    <div>
        <p>Hello world.<p>
    </div>
</mip-drawer>
```

通过 mip-cli 工具的配合，最终我们是这样写 MIP 组件，下面是 mip-drawer.vue 文件的代码：

```html
<template>
  <p>Hello world.<p>
</template>
<script>
  export default {
    // vue 定义
  }
</script>
<style>
/* css style*/
</style>
```

mip-cli 编译后会将 vue 文件打包成 mip-drawer.js 文件， 并自动加上 `MIP.registerVueCustomElement('mip-drawer', component)`。

下面我们来看下 `registerVueCustomElement` 是如何实现的，下面是精简后的代码。

```js
function registerVueCustomElement (tag, component) {
  Vue.customElement(tag, component)
}
```

然后，Vue.customElement 精简后是样的：

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

通过上面的代码，我们可以知道，实际上 vue 实例是在 MIP 组件 build 的回调创建 vue 的实例。并通过和自定义元素的相关回调钩子传递数据到 vue 实例内部。

通过以上源码解析，我们要注意使用 vue 写的 MIP 组件需要明确以下几点：

- 每个自定元素创建一个 vue 实例，只负责渲染自定义元素的内部结构，在 HTML 文档中，MIP 自定义元素之间的关系跟 vue 是**毫无关系**的；
- MIP 组件定义的自定义元素在 HTML 上完全遵循 HTML 标准，**完全不支持 vue 的语法**，vue 语法只存在组件内部；
- 组件内部的 vue 组件语法和普通的 vue 语法完全一致

## 使用 vue 组件方式开发的特性

虽然在 HTML 语法中不支持 vue 语法，但是我们也提供了很多酷炫的特性来使开发者使用起来更加简单：

- Props 属性传递
- [Slots 内容插槽/分发](./slots.md) 可以将 HMTL 自定义元素的内容直接分发到 vue 模板内部的 <slot> 标签
- [Events 事件绑定](../basic/actions-and-events.md)， 可以通过 $emit 和 $on 方法替代 addEventAction 和 eventAction.execute
- [数据绑定](./data-and-method.md)，HTML 自定义标签上的属性变化会实时反馈到 vue 内部
