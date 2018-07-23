# MIP 组件机制详解

自定义组件功能是组件运行的核心部分，MIP会在该模块进行组件注册、组件资源列表管理，并提供对应的工具函数。

## MIP 组件注册机制

自定义标签组件注册是组件运行机制最基础的部分，所有组件的注册都会经过该模块的处理，下面通过简单的示例和摘取出部分关键代码来讲解组件注册的具体流程。

### 编写组件

开发者在开发 MIP 组件时编写的实际上是 Vue 组件，在开发组件过程中甚至感觉不到这是在开发 MIP 组件，这正是我们想要达到的效果。我们通过巧妙的设计让 mip-cli 工具配合 MIP runtime 产出自定义标签，如下代码是组件 `mip-example` 的代码。

```html
<template>
  <div class="wrapper">
    <h1>MIP 2.0 component example</h1>
  </div>
</template>

<style scoped>
  .wrapper {
    margin: 0 auto;
    text-align: center;
    color: red;
  }
</style>

<script>
  export default {
    mounted() {
      console.log('This is my first custom component !');
    }
  }
</script>
```

### 组件编译

开发者的组件在上线前均会通过 mip-cli 的编译，将 Vue 文件编译打包成一个 JS 文件，并在最后加入一段注册 MIP 自定义标签的代码，主要作用就是调用核心功能的注册功能，以获得组件生命周期等，以上面提到的 `mip-example` 组件为例，为了方便理解，这里精简掉了一些 webpack 编译后产生的代码依赖，编译后的代码如下所示：

```js
(function () {
  // <template> 标签内的模板被编译成了 render 和 staticRenderFns 函数
  var render = function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _vm._m(0)
  }
  var staticRenderFns = [
    function () {
      var _vm = this
      var _h = _vm.$createElement
      var _c = _vm._self._c || _h
      return _c("div", {
        staticClass: "wrapper"
      }, [
        _c("h1", [_vm._v("MIP 2.0 component example")])
      ])
    }
  ]
  render._withStripped = true

  // __mip_component__ 是用户编写的 vue 组件的定义，通过 webpack 打包导出
  var __mip_component__ = {
    render: render,
    staticRenderFns: staticRenderFns,
    mounted: function () {
      console.log('This is my first custom component !');
    }
  }

  // 编译打包时加入的代码
  __mip_component__ = __mip_component__.default || __mip_component__
  MIP.registerVueCustomElement(
    'mip-example',
    __mip_component__
  );
}())
```

首先，mip-cli 通过 vue-loader 将 Vue 文件编译成 JS，并将 `<template>` 编译为 render 函数，导出 Vue 组件的定义，最后在底部增加一段代码调用全局变量 MIP 提供注册组件的方法 `MIP.registerVueCustomElement()` 方法注册自定义标签。

### 组件注册

`MIP.registerVueCustomElement()` 接口实际调用的是 `Vue.customElement()` 方法，代码如下所示：

```js
function registerVueCustomElement (tag, component) {
  Vue.customElement(tag, component)
}
```

下面代码是 `Vue.customElement()` 的实现。

```js
Vue.customElement = (tag, componentDefinition) => {
  const props = getProps(componentDefinition)

  class VueCustomElement extends CustomElement {
    prerenderAllowed () {
      if (typeof componentDefinition.prerenderAllowed === 'function') {
        return componentDefinition.prerenderAllowed()
      }
      return false
    }

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
      if (this.prerenderAllowed()) {
        this._build()
      }
    }

    connectedCallback () {
      callLifeCycle(this, 'connectedCallback', this.element)
    }

    disconnectedCallback () {
      callLifeCycle(this, 'disconnectedCallback', this.element)
    }

    firstInviewCallback () {
      if (!this.prerenderAllowed()) {
        this._build()
      }

      callLifeCycle(this.vm, 'firstInviewCallback', this.element)
    }

    attributeChangedCallback (name, oldValue, value) {
      if (this.vueInstance) {
        const nameCamelCase = camelize(name)
        const type = this.props.types[nameCamelCase]
        this.vueInstance[nameCamelCase] = convertAttributeValue(value, type)
      }
    }

    static get observedAttributes () {
      return props.hyphenate || []
    }
  }

  registerElement(tag, VueCustomElement)
}
```

从代码上面代码可以看到函数内部实际是声明了一个继承 `CustomElement` 的 `VueCustomElement` 类，而 `CustomElement` 是自定义元素接口的实现，提供了 `connectedCallback`、`disconnectCallback`、`attributeChangedCallback` 等自定义元素生命周期的回调，并在最后调用 `registerElement()` 函数注册自定义组件。下面代码是 `registerElement()` 函数的实现。

```js
function registerElement (name, elementClass, css) {
  if (customElementsStore.get(name)) {
    return
  }

  // store the name-clazz pair
  customElementsStore.set(name, elementClass, 'mip2')

  loadCss(css, name)
  window.customElements.define(name, class extends BaseElement {
    static get observedAttributes () {
      return elementClass.observedAttributes
    }
  })
}
```

MIP 在注册自定义元素时会先通过判断 `customElementsStore.get(name)` 是否存在来检查组件是否已经被注册，避免重复注册组件，如果第一次注册，则将 CustomElement 存到 customElementsStore 中，最终调用 `window.customElements` 上的 `define` 方法进行标签的注册。`customElements` 是 Custom Element V1 规范实现的接口，`customElements` 是 MIP 可以在 HTML 中实现自定义标签的关键。但由于目前customElemets 有一定的兼容性问题，MIP 已在核心代码中引入了相关 polyfill，开发者无需担心兼容性问题。

看到这里，你可能会感到疑惑，前面提到的 CustomElment 是怎么和 BaseElement 关联的，接下来我们继续深入了解 BaseElement 的实现，具体代码如下所示：

```js
class BaseElement extends HTMLElement {
  constructor (element) {
    super(element)
    let name = this.tagName.toLowerCase()
    // 通过标签名获取对应自定义标签的CustomElement 类
    let CustomElement = customElementsStore.get(name, 'mip2')
    this._inViewport = false
    this._firstInViewport = false
    this._resources = resources
    this.__innerHTML = this.innerHTML
    // 实例化挂载到当前实例的元素上
    let customElement = this.customElement = new CustomElement(this)
    if (customElement.hasResources()) {
      performance.addFsElement(this)
    }
  }

  connectedCallback () {
    this.classList.add('mip-element')
    this._layout = layout.applyLayout(this)
    this.customElement.connectedCallback()

    this._resources && this._resources.add(this)
  }

  disconnectedCallback () {
    this.customElement.disconnectedCallback()
    this._resources && this._resources.remove(this)
  }

  attributeChangedCallback () {
    let ele = this.customElement
    ele.attributeChangedCallback.apply(ele, arguments)
  }

  build () {
    if (this.isBuilt()) {
      return
    }
    try {
      this.customElement.build()
      this._built = true
    } catch (e) {
      console.warn('build error:', e)
    }
  }

  isBuilt () {
    return this._built
  }

  inViewport () {
    return this._inViewport
  }

  viewportCallback (inViewport) {
    this._inViewport = inViewport
    if (!this._firstInViewport) {
      this._firstInViewport = true
      this.customElement.firstInviewCallback()
    }
    this.customElement.viewportCallback(inViewport)
  }

  executeEventAction (action) {
    this.customElement.executeEventAction(action)
  }

  prerenderAllowed () {
    return this.customElement.prerenderAllowed()
  }
}
```

BaseElement 继承了 `HTMLElement` 原生的 HTML 元素类，并重写了生命周期钩子，在自定义标签实例化创建 DOM 会首先调用 `constructor()` 方法，在这里会将前面 `registerElement` 保存的标签名对应的 `CustomElement` 类取出实例化挂载在自定义标签实例上。在自定义标签的每一个生命周期执行过程中都会调用组件重载的钩子进行执行，如下面代码所示:

```js
this.customElement.connectedCallback()
this.customElement.disconnectedCallback()
this.customElement.build()
this.customElement.attributeChangedCallback()
```

### Vue 组件和 CustomElement 的绑定

考虑到性能问题，内置组件就是直接使用 `CustomElement` 实现的，只需要在组件中重写生命周期钩子达到定义组件的目的。那么，基于 Vue 的组件又是怎么和 CustomElement 绑定工作的呢？我们再回过头来看 `VueCustomElement` 的实现，提取 `_build` 的关键代码如下面代码所示：

```js
class VueCustomElement extends CustomElement {
  // ...
  _build() {
    // 创建 Vue 实例并挂载到自定义元素上
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

  build() {
    // 是否直接渲染
    if (this.prerenderAllowed()) {
      this._build()
    }
  }

  // 第一次进入视口的回调钩子
  firstInviewCallback() {
    if (!this.prerenderAllowed()) {
      this._build()
    }
    callLifeCycle(this.vm, 'firstInviewCallback', this.element)
  }

  // 将自定义元素属性和 vue 实例的 props 关联
  attributeChangedCallback(name, oldValue, value) {
    if (this.vueInstance) {
      const nameCamelCase = camelize(name)
      const type = this.props.types[nameCamelCase]
      this.vueInstance[nameCamelCase] = convertAttributeValue(value, type)
    }
  }
  // ...
}
```

实际上，MIP 是在 CustomElement 的 `_build` 方法里调用 `createVueInstance()`函数创建一个 Vue 的实例进行内容渲染的，而 `_build` 方法是根据情况在 `build` 或 `firstInviewCallback` 回调钩子中执行。

MIP 核心代码也是在这里分析 Vue 组件定义的 props 和自定义元素 attributes 进行绑定, 并通过 `attributeChangedCallback` 实现自定义标签属性变化实时反映到 Vue 组件 prop 变化。由于 HTML 标签属性的值都是字符串，针对传递非字符串的 prop 问题，下面代码根据 Vue 组件定义的 props 调用 `convertAttributeValue()` 方法做数据转换。

```js
attributeChangedCallback(name, oldValue, value) {
  if (this.vueInstance) {
    const camelName= camelize(name)
    const type = this.props.types[nameCamelCase]
    this.vueInstance[camelName] = convertAttributeValue(value, type)
  }
}
```

因为要做数据转换，所以在编写 Vue 组件的 props 声明时，针对一个 prop 类型只能是一种，如果写了多种类型会默认取第一个类型进行解析转换。

## MIP 组件和 Vue 的关系

前面提到了用 Vue 组件的方式写 MIP 组件，实际上 MIP 组件就是自定义元素，组件的内部布局、样式和交互是开发者在自定义元素类的回调钩子中通过 JavaScript 实现，MIP 组件内部通过 Vue 来渲染组件 UI，MIP 组件在这里充当容器的角色，如下面代码所示，通过`MIP.registerVueCustomElement()` 接口将自定义元素与 Vue 组件结合在一起。

```js
MIP.registerVueCustomElement('mip-example, {
  template: '<p>Hello world.</p>'
})
```

在 HTML 中就可以直接使用 `<mip-example>` 标签:

```html
<mip-example></mip-example >
```

浏览器渲染后的结果如下所示：

```html
<!-- 内部多了一个 div 标签是因为 Vue 实例必须要有一个根元素，而自定义标签不能作为 vue 实例的根元素 -->
<mip-example class="mip-element">
  <div>
    <p>Hello world.<p>
  </div>
</mip-example >
```

通过前面的介绍，我们很容易总结出以下一些特点：

- 每个自定元素都创建了一个 Vue 实例，Vue 实例只负责渲染自定义元素的内部结构，在 HTML 文档中，MIP 自定义元素跟 Vue 语法没有关系，换句话说，你不能在使用 MIP 组件时使用 Vue 语法绑定事件和数据；
- MIP组件定义的自定义元素在 HTML 上完全遵循 HTML 标准，父子自定义元素直接的关系是 DOM 直接的父子关系，不是 Vue 的父子组件关系；
- MIP 组件之间的通信不能直接使用 Vue 的通信机制，需要使用 MIP 的 on 语法的事件和行为的通信机制；
- 组件内部的 Vue 组件语法和标准的 Vue 语法完全一致，Vue 模板内使用 MIP 自定义元素完全被当成 HTML 元素处理，由浏览器识别，而不会当成该 Vue 的子组件处理。

虽然在HTML语法中不支持Vue语法，但是MIP也提供了很多特性使开发者使用起来更加简单：

- **Props 属性传递**：通过 HTML 自定义标签的属性和属性值定义，就可以将自定义标签的属性数据传递给 Vue 组件，Vue 组件通过 props 属性进行接收；
- **Slots 内容插槽/分发**：可以将 HMTL 自定义元素的内容直接分发到 Vue 模板内部的 `<slot>` 标签；
- **Events 事件绑定**：可以通过 `$emit` 和 `$on` 方法替代 `addEventAction` 和 `eventAction.execute`；
- **数据绑定**：HTML 自定义标签上的属性变化会实时反馈到 Vue 内部。

### 自定义元素生命周期

MIP 组件是基于 Web Component 机制的，所以也天然地继承了这套机制的生命周期，同时MIP也对生命周期不同阶段采用了不同策略，并扩展额外的钩子函数。但开发者在使用 Vue 组件方式开发的 MIP 组件时，实际上是以 Vue 组件的生命周期为主的，MIP 核心机制刻意隐藏了自定义标签的生命周期回调钩子，目的是让开发者拥有沉浸式的开发体验，但是由于一些特殊的需求，MIP 核心机制还是暴露了部分自定义标签回调。
在 Vue 组件定义中暴露了3个回调钩子，这里需要注意下生命周期回调钩子的上下文，由于 `connectedCallback` 和 `disconnectedCallback` 在回调时还没创建 Vue 实例，所以，上下文为 `CustomElement` 实例，代码如下面所示：

```js
function callLifeCycle (ctx, name) {
  // componentDefinition 为 vue 组件定义项
  if (typeof componentDefinition[name] === 'function') {
    return componentDefinition[name].apply(ctx, [].slice.call(arguments, 2))
  }
}

class VueCustomElement extends CustomElement {
  connectedCallback () {
    callLifeCycle(this, 'connectedCallback', this.element)
  }
  disconnectedCallback () {
    callLifeCycle(this, 'disconnectedCallback', this.element)
  }
  firstInviewCallback () {
    if (!this.prerenderAllowed()) {
      this._build()
    }
    callLifeCycle(this.vm, 'firstInviewCallback', this.element)
  }
}
```

下面的流程图展示了 Vue 组件在 MIP 中生命周期。
![MIP 组件生命周期图](./images/components-life-cycle.png)
