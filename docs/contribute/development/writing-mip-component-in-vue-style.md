# 使用 Vue 单文件语法来开发 MIP 组件

MIP 允许开发者使用 Vue 单文件的形式去开发 MIP 组件，MIP CLI 内置了插件将 Vue 单文件转换成 MIP 组件。

[notice]以 Vue 单文件的形式开发 MIP 组件仅仅降低了组件开发成本，在**性能**上远不如 MIP 推荐的 Custom Element 的书写方式所开发出来的组件，因此对于 MIP 官方组件要求**必须**完全采用 Custom Element 的方式进行开发，同时希望第三方站长组件也**强烈建议**使用 Custom Element 的方式开发。

## 创建一个简单的 MIP 组件

采用 Vue 单文件写法开发 MIP 组件，在写法上基本与普通的 Vue 单文件相一致，在组件文件命名上首先需要满足 MIP 的组件命名规范，要求以 `mip-` 作为组件前缀，对于第三方站长组件需要以 `mip-[第三方组件标识]-` 的格式进行命名，同时要求以 `.vue` 作为文件后缀。比如 `mip-example.vue`、`mip-baidu-example.vue` 等等，创建好文件之后，我们可以简单编写这个组件的内容，以 `mip-example.vue` 为例：

```html
<template>
  <div>
    <h1>MIP component example</h1>
  </div>
</template>

<style scoped>
  mip-example h1 {
    color: red;
  }
</style>

<script>
export default {
  // component options
}
</script>
```

与 Vue 单文件基本一致。其中 `<style>` 标签块可以写 less 和 stylus，只需要跟普通的 Vue 组件那样规定好 `lang` 属性就好。

## 生命周期

使用 Vue 单文件写法开发 MIP 组件与普通的 Vue 组件存在着一定区别，区别之一就是组件的生命周期。MIP 组件扩展了 Vue 组件的生命周期钩子，同时限制了部分 CustomElement 生命周期钩子，生命周期示意图如下所示：

![mip2 组件生命周期](https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mip/mip2-component-lifecycle.png)

> 由于 vue 组件实例化比较消耗性能，所以 mip 对 vue 组件做了延迟实例化，只有组件执行 firstInviewCallback 后才会执行组件的实例化。如果需要强制组件在初始化时执行 vue 组件实例化，需要通过声明 prerenderAllowed() 为 true 实现。

> 由于 vue 组件的生命周期属于 CustomElement 生命周期的一部分，所以在部分 CustomElement 生命周期钩子（如 connectedCallback）中 vue 实例还未实例化，无法获取 vue 实例，在 vue 组件的扩展钩子里无法通过 this 获取到 vue 实例，element 实例则通过钩子的最后一个参数传入，具体请参考下面的生命周期钩子参数说明。

允许调用的生命周期钩子如下所示：

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

### viewportCallback

- 类型：Function
- Context: Vue 组件实例
- 参数
    - element `{Element}` Element 实例
- 详细：

    当组件滚动入和滚出视口时触发。

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

## 属性的接收

与正常的 Vue 组件一样，通过 props 属性来获取从 HTML 标签上获取属性，比如在页面上这样传入数据：

```html
<mip-example
  name="李雷"
  age="18"
  info='{"school": "SJTU", "grade": 1}'
></mip-example>
```

那么，可以通过 props 这么去定义：

```html
<script>
export default {
  props: {
    name: String,
    age: Number,
    info: Object
  }
}
</script>
```

然后就可以在组件代码里通过 `this.name`、`this.info.school` 的方式去获取属性了。

## 事件触发

使用 Vue 单文件的方式定义的 MIP 组件也可以对外发射事件，比如 `mip-example` 组件在挂载之后，对外抛出事件 `mounted`，那么可以通过 `this.$emit()` 方法来实现：

```html
<script>
  export default {
    mounted () {
      this.$emit('mounted')
    }
  }
</script>
```

这样就可以对 mip-example 使用 `on` 语法来监听这个 mounted 事件了：

```html
<mip-example on="mounted:btn.click()"></mip-example>
```

关于 on 语法监听事件属于 MIP 组件的使用，可以参考文档 [可交互 MIP](../../docs/interactive-mip/event-and-action.md) 进行学习，这里就不做赘述。

this.$emit() 方法可以传入第二个参数，该参数要求类型为一个对象，这样就能够在触发事件的同时向外传递数据：

```js
this.$emit('mounted', {count: 1})
```

## 事件监听

组件使用者可以通过 `on` 语法进行组件的事件监听，同样也可以通过 `on` 语法对组件进行事件触发。在 Vue 单文件写法的 MIP 组件里面，可以通过 `this.$on()` 方法对外部触发组件内部的事件进行监听：

```html
<script>
  export default {
    mounted () {
      let that = this
      this.$on('hello', function (event, name) {
        console.log(`hello ${name}`)
      })
    }
  }
</script>
```

这样可以通过 `on` 语法来触发这个 `hello` 事件：

```html
<button on="tap:example.hello('lilei')">click me</button>
<mip-example id="example"></mip-example>
```

这样在点击按钮的时候，就会触发 mip-example 所监听的 hello 事件并且在控制台输出 "hello lilei"。监听的事件可以传入多个参数，也可以不传参数。

## 子组件

在写 Vue 组件的时候，可以使用 Vue 本身的组件机制来使用子组件，组件开发者只需通过 components 属性把子组件引入并且定义好名称即可：

```html
<template>
  <div>
    <child-component/>
  </div>
</template>
<script>
import ChildComponent from './child-component'
export default {
  components: {
    ChildComponent
  }
}
</script>
```
Vue 组件里面也可以直接使用其他 MIP 组件，只需要在组件的 README 文档里说明好组件依赖脚本即可，比如 `mip-example` 依赖了 `mip-fit-text` 这个官方组件，那么只需要在 mip-example 的 template 模板里面如同使用 `<img>`、`<video>` 这些标签一样直接写入即可：

```html
<template>
  <div>
    <mip-fit-text width="200" height="200" layout="responsive">MIP（Mobile Instant Pages - 移动网页加速器），是一套应用于移动网页的开放性技术标准。通过提供 MIP-HTML 规范、MIP-JS 运行环境以及 MIP-Cache 页面缓存系统，实现移动网页加速。</mip-fit-text>
  </div>
</template>
```

然后页面上在使用 mip-example 这个组件的时候，还需要引入 mip-fit-text 的组件 script：

```html
<body>
  <mip-example></mip-example>
  <script src=" https://c.mipcdn.com/static/v2/mip-fit-text/mip-fit-text.js"></script>
  <script src=" https://c.mipcdn.com/static/v2/mip-example/mip-example.js"></script>
</body>
```

需要注意的是，虽然 MIP 支持这种 MIP 组件之间相互依赖的写法，但是并不推荐，请尽量保持组件的相对独立和功能完整。

## 组件插槽 slot

> 这部分内容和 [vue 组件插槽](https://cn.vuejs.org/v2/guide/components-slots.html#%E5%85%B7%E5%90%8D%E6%8F%92%E6%A7%BD) 几乎一致，因为我们的目标就是要保持一致以达到比较好的开发体验

### 插槽内容

为了保持和 Vue 开发体验一致，MIP 组件机制实现了和 Vue 几乎一致的内容分发 API， 将 MIP 组件内模板的 `<slot>` 元素作为承载分发内容的出口。

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

当组件渲染的时候，这个 `<slot>` 元素将会被替换为 “Your Profile”。插槽内可以包含任何模板代码，包括 HTML：

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

如果 `<mip-link>` 没有包含一个 `<slot>` 元素，则任何传入它的内容都会被抛弃。

### 具名插槽

有些时候我们需要多个插槽。例如，一个假设的 `<mip-layout>` 组件多模板如下：

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

对于这样的情况，`<slot>` 元素有一个特殊的特性：name。这个特性可以用来定义额外的插槽：

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

### 插槽的默认内容

有的时候为插槽提供默认的内容是很有用的。例如，一个 `<mip-submit-button>` 组件可能希望这个按钮的默认内容是“Submit”，但是同时允许用户覆写为“Save”、“Upload” 或别的内容。

你可以在 `<slot>` 标签内部指定默认的内容来做到这一点。

```html
<button type="submit">
  <slot>Submit</slot>
</button>
```

如果父组件为这个插槽提供了内容，则默认的内容会被替换掉。

### 和 Vue 插槽的区别

1. MIP 不支持编译作用域(Compilation Scope)，不支持以下写法：

```html
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
