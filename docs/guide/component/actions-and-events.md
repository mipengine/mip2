# 事件通信

MIP 提供了强大的组件DOM通信，组件间通信功能，以解决在MIP组件开发中遇到的组件交互问题。可以通过 DOM 属性来触发某个 MIP 元素的自定义事件。

语法使用用一种简单特定的语言来表示：

```
eventName:targetId[.actionName[(args)]]
```

详细的语法描述如下：

- `eventName`: 必须， element 暴露的事件名
- `targetId`: 必须， event 被触发后将要作用的对象标识。targetId 可以是 id 选择器或者[特定对象](#特定对象), 如果是 id 选择器, 将执行指定的 mip 组件暴露的 action；如果特定对象，将触发特定对象的 action。
- `actionName`: 必须，event 被触发后将要执行的组件对象暴露的 action 名，或者特定对象的方法
- `args`: 可选，触发 event 附带的参数，所有参数必须是字符串

> 为了方便理解，组件内部注册的监听行为称之为 action， 组件内触发的事件称之为 event

## 处理多个事件

你可以在一个 element 上监听多个事件，多个事件之间使用空格分开， 例如：
```
<mip-example on="sucess:item-id.close error:item-id.show"></mip-example>
```

> 注意：单个事件内部不能出现空格

## 自定义组件事件 (event) 和行为 (action)

### 组件内注册监听行为（action）
```js
/**
 * 组件内部绑定事件行为
 *
 * @param  {Object} event 触发时透传的 event 对象
 * @param  {string} str   在 HTML `on` 属性中透传的参数，如：on="tap:id.click(test)"
 */
this.$element.customElement.addEventAction('actionName', function (event, str) {})
```

- 简写 (推荐使用)

```js
this.$on('actionName', function (event, str))
```

### 组件内触发事件（event）

```js
/**
 * 触发事件
 * @param {string} eventName 事件名称
 * @param {HTMLElement} element 触发的目标元素，注意：事件往递归的向上传播找到匹配 `on="eventName:xxx.xx` 并执行
 * @param {Object=} event 事件对象，原生的 Event 对象，如果没有事件对象可以为 {} 或不传 ，支持透传自定义参数，如：{userinfo: {}}
 */
MIP.viewer.eventAction.execute(eventName, element, event)
```

- 简写 (推荐使用)
```js
this.$emit(eventName, event)
```

### 例子

下面通过例子实现点击(tap) `<button>` 标签触发 `mip-a` 组件内部的 counter +2，`mip-b` 内容展现 (show) 触发 `mip-a` 组件内部的 counter +1

- HTML
```html
<mip-a id="counter"></mip-a>
<button on="tap:counter.add(2)"> 点击 +2 </button>
<hr>
<mip-b on="show:counter.add(1)"></mip-b>
```

- Extensions `mip-a`
```html
<template>
  <div >
    counter: {{count}}
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
    // this.$element.customElement.addEventAction('add', function (event, num) {
    //   vm.add(parseInt(num, 10))
    // })

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

- Extensions `mip-b`
```html
<template>
  <div >
    <div @click="onClick">
      <span v-if="show">点击隐藏内容</span>
      <span v-else>点击显示内容</span>
    </div>
    <div v-if="show">
      MIP 提供了强大的组件DOM通信，组件间通信功能，以解决在MIP组件开发中遇到的组件交互问题。可以通过 DOM 属性来触发某个 MIP 元素的自定义事件。
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
      // MIP.viewer.eventAction.execute(this.show ? 'show' : 'close', this.$element, {})

      // 触发 show 事件
      this.$emit(this.show ? 'show' : 'close', {})
    }
  }
}
<script>
```

从上述例子中 `mip-a` 向外暴露了 `add` 行为 (action)，`mip-b` 向外暴露了 `show` 事件 (event)

## 支持的事件（event）和行为 (action)

### 全部 HTML 元素都支持的事件

MIP 在所有 HTML 元素（包括 MIP 元素）暴露了 `tap` 事件， 所以你可以在任何一个 HTML 元素上监听 tap 事件，例如：

```
<div on="tap:id.custom_event">单击时触发</div>
```

### 组件可被监听的事件

组件可被监听的事件是指 mip 组件暴露给外部的事件，可以通过 `on` 属性监听事件

用法示例：
```
<mip-form on="submitSuccess:info.success">表单提交成功后触发 #info 组件的 success 行为</mip-form>
<mip-info id="info"></mip-info>
```

### 组件可被触发的行为（action）

组件可被触发的行为是指 mip 组件事件触发后触发执行的行为

### 特定对象

事件作用的行为对象不仅只有 mip 组件，还可以使 MIP 全局对象，语法 `on="eventName:targetId[.actionName[(args)]]"` 中的 targetId 可是 `MIP` 对象，针对 `MIP` 对象支持的行为有 `setData` 和 `$set`，关于这两个行为的用法可参考[mip-bind](../extensions/builtin/mip-bind.md)
