# MIP 组件通信

MIP 组件是页面的一个独立单元，组件和组件之间的功能相对独立，能够并列使用，也可以相互嵌套使用。现在，我们假设一个交互场景，当点击一个弹层组件 mip-lightbox 的触发按钮触发弹层的时候，我们同时需要去隐藏页面的所有悬浮组件元素，避免悬浮组件元素对这个弹层造成视觉干扰。这个场景如何实现呢？当然，我们可以在触发弹层的时候，给所有悬浮组件通信，告知需要对其进行隐藏操作。所以，了解组件之间如何通信，对设计MIP功能组件具有十分重要的意义。

MIP 的组件通信是通过 `EventEmitter` 方式来实现的，这里首先给大家介绍一下什么是 `EventEmitter`，让大家对这个技术点有一定的了解。

## EventEmitter 简介

`EventEmitter` 是一个对事件进行监听的对象，采用了发布—订阅(观察者)的方式，使用内部 events 列表来记录注册的事件处理器，说白了就是为事件写回调函数，当触发一个事件后，会执行该事件对应的回调函数。

既然是观察者模式，那它的基本 API 就包含了观察者的一些基本的特征，如下面代码所示。

```js
class EventEmitter {
  // 构造函数初始化
  constructor (opt) { ... }
  // 绑定事件
  on(name, handler) { ... }
  // 解绑事件
  off (name, handler) { ... }
  // 绑定只执行一次的事件
  once (name, handler) { ... }
  // 触发事件
  trigger (name) { ... }
  // 设置事件执行上下文
  setEventContext (context) { ... }
}
```

上面的代码是从 MIP 开源项目的源码中直接抽取出来，在 `EventEmitter` 的原型上，实现了四个方法：

- on：注册事件，返回值为 this
- off：撤销注册事件，返回值为该事件，没有则返回 null
- once：执行一次事件，执行完了撤销该事件
- trigger：触发事件。这个模块基础技术都是基于观察者的设计模式实现的，如果想更详细地分析全部源码，可以直接到 GitHub 上查看 `event-emiter.js` 文件。

## MIP组件事件机制具体实现

对 `EventEmitter` 有基本了解之后，我们接下来看看在 MIP 组件中具体是如何实现的。首先，我们还是从源码分析开始，如下面代码所示。

```js
//引入模块 event-emitter
import EventEmitter from './util/event-emitter'

// customElement的原型上增加 addEventAction 接口
class CustomElement {
  ...
  addEventAction (/* name, handler */) {
    let evt = this._actionEvent
    if (!evt) {
      evt = this._actionEvent = new EventEmitter()
      evt.setEventContext(this)
    }

    evt.on.apply(evt, arguments)
  }
  ...
}
```

由上面代码可见，在 `customElement` 里面封装 `addEventAction` API，这个 API 通过 `EventEmitter` 模块实现。
在 MIP 组件代码中，就可以使用这个 API 进行事件的注册，如下面代码所示。

```html
<template>
  <div class="wrapper">
    counter: {{num}}
  </div>
</template>

<script>
  export default {
    data() {
      return {
        num: 0
      }
    },
    mounted() {
      let customElement = this.$element.customElement
      let vm = this
      // 可以使用 this.$on('counter', function () {...}) 简写方式
      customElement.addEventAction('add', function (evt, str) {
        vm.num += 1
      })
    }
  }
</script>
```

上述代码暴露一个 add 的事件行为。如果其他组件想调用这个组件的 add 事件行为，通过如下方式即可，如下面代码所示。

```html
<mip-counter id="counter"></mip-counter>
<button on="tap:counter.add"> 点击 +1 </button>
```

如上所示，当点击 button 时，就会触发 add 事件行为。没错，起作用的正是 `on="tap:counter.add"` 这个属性，那 add 事件行为是如何触发的呢？同样，我们将用一段代码来解决大家的疑惑，如下面代码所示。

```js
import EventAction from './util/event-action'
/**
 * 处理`on="tap:xxx"` 这种事件绑定
 */
let viewer = {
  init () {
    this.setupEventAction()
  },
  // 处理`on="tap:xxx"` 这种事件绑定
  setupEventAction () {
    let hasTouch = fn.hasTouch()
    let eventAction = this.eventAction = new EventAction()
    if (hasTouch) {
      // 移动端
      this._gesture.on('tap', event => {
        eventAction.execute('tap', event.target, event)
      })
    } else {
      // 兼容 PC
      document.addEventListener('click', event => {
        eventAction.execute('tap', event.target, event)
      }, false)
    }
  }
}
```

上述代码来自 MIP 的 viewer 模块，前面章节有过介绍。这段代码专门处理 `on="tap:xxx"` 这种事件绑定的情况。`eventAction.execute` 会方法会执分析 tap 后面的语句，执行对应组件暴露的事件。

## 组件事件绑定语法

前面的例子展现如何在一个元素上利用 `on` 属性绑定一个 tap 事件，并触发特定组件的事件行为，接下来讲解下绑定事件的语法。
MIP 指定了通过on属性来绑定事件，on的值指定事件名称和事件触发后执行行为，具体的语法如下：

```js
on="eventName:targetId[.actionName[(args)]]"
```

其中 eventName 组件暴露的事件名，targetId 是 element 的 id 属性值，actionName 是事件触发后要执行的事件行为，args 为事件参数。

语法 `on` 支持监听多个事件，事件之间多个事件之间使用空格分开，例如：

```html
<mip-counter on="succ:id.close  err:id.show"></mip-counter>
```

注意：单个事件内部不能出现空格。

## 自定义组件行为和事件

前面我们已经讲了如何暴露一个行为，我们可以在组件内部回调钩子通过调用 customElement 的 `addEventAction` 来暴露组件内部的行为，具体的语法如下：

```js
this.$element.customElement.addEventAction(
  'actionName',
  function (event, str) {}
)

// 推荐使用简写方式
this.$on('actionName', function (event, str))
```

`addEventAction` 方法接收两个参数，第一个参数为行为名称，第二个参数为回调函数，回调函数的第一个参数为事件对象，由派发事件的传递过来，后续参数为 `on` 属性语法的参数传递过来，由于 HTML 属性值必须为 String 类型，所以这里的 str 参数也是 String 类型，使用时需要自行转换。

那如何自定义事件呢？我们通过在组件内定义派发事件来暴露事件，具体方法如下：

```js
MIP.viewer.eventAction.execute(eventName, element, event)

// 推荐使用简写方式
this.$emit(eventName, event)
```

`execute` 方法的第一个参数为事件名，第二个参数为组件元素实例，第三个参数是事件对象，可通过该参数传递数据给通过 `addEventAction` 注册的回调函数，通过第一个参数 event 获取。简写方式 `this.$emit` 省略了第二个参数 element，内部直接绑定当前组件对应的 element。

通过 `on` 属性语法，配合 `addEventAction` 和 `viewer.eventAction.execute` 我们就可以轻松实现两个组件之间的通信。下面代码给我们展示了一个命名为 `mip-counter.vue` 的计数器组件。

```html
<!-- mip-counter.vue -->
<tempalte>
  <div >
    counter: {{ count }}
  </div>
</template>
<script>
export {
  data() {
    return {
      count: 0
    }
  },
  mounted() {
    let vm = this
    // 添加 add 行为
    this.$on('add', function (event, num) {
      vm.add(parseInt(num, 10))
    })
  },
  methods: {
    add(num) {
      this.count += num
    }
  }
}
<script>
```

下面代码展示了一个命名为 `mip-content.vue` 的内容展示组件，我们将通过自定义组件事件方式的通信机制使得 `mip-content.vue` 和`mip-counter.vue` 组件进行通信。

```html
<!-- mip-content.vue -->
<tempalte>
  <div >
    <div @click="onClick">
      <span v-if="show">点击隐藏内容 counter +1</span>
      <span v-else>点击显示内容 counter +2</span>
    </div>
    <div v-if="show">
      MIP 提供了强大的组件 DOM 通信，组件间通信功能
    </div>
  </div>
</template>
<script>
export {
  data() {
    return {
      show: false
    }
  },
  methods: {
    onClick() {
      this.show = !this.show
      // 派发 show 事件或close事件
      this.$emit(this.show ? 'show' : 'close', {})
    }
  }
}
<script>
```

下面代码展示了最终在  MIP页面中的使用情况。

```html
<mip-counter id="counter"></mip-counter>
<mip-content on="show:counter.add(2) close:counter.add(1)"></mip-content>
```

当运行上面的 MIP 页面后，点击 mip-content 中的「显示内容」，mip-counter 中的 counter 值加 2，点击「隐藏内容」，mip-counter 中的 counter 值加 1。

## 特殊对象

前面提到的 `on` 属性语法的 targetId 除了组件 id，还可以是 MIP 对象，例如下面的用法：

```html
<button on="tap:MIP.setData({name:'mip'})"></button>
```

我们将 MIP 称之为特殊对象，因为对 targetId 为 MIP 字符串做了特殊处理，使得 MIP 引擎能识别，并可以识别 `setData` 和 `$set` 方法，具体可以参考前面 `MIP.setData` 的用法介绍。目前 MIP 暂时只有MIP一个特殊对象。
