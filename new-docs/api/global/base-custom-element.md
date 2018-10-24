# 自定义元素实现接口

MIP.CustomElement 是所有 MIP 自定义组件的基类，该基类提供如下生命周期钩子。所有 CustomElement 的生命周期钩子自动绑定 `this` 上下文到实例中，因此你可以访问数据，对属性和方法进行运算。

## 实例 / 属性

### element

- **类型**：`HTMLElement`

- **详细**：

  MIP 自定义元素的真实 element 实例。在 build 钩子执行之前，可以通过该实例获取原始的子元素及属性。

- **示例**

  ``` js
  class MIPExample extends MIP.CustomElement {
    constructor (element) {
      super(element)

      // <div class="item1"></div>
      console.log(this.element.querySelector('.item1'))

      // <div class="wrap"></div>
      console.log(this.element.firstChild)
    }
  }
  ```

  ```html
  <mip-example>
    <div class="wrap">
      <div class="item1"></div>
    </div>
  </mip-example>
  ```

## 实例 / 方法

### addEventAction

- **类型**：`Function`

- **参数**
  - name `{String}` 行为（action）名称
  - handler `{Function}` 行为对应的回调函数
    - 参数：
      - event `{Object}` 事件触发时传递的事件对象
      - args `{String}` 通过 on 属性提取出来的参数原始字符串

- **详细**：

  添加一个事件行为，该事件行为可以通过组件外部触发。

- **示例**

  ``` js
  class MIPExample extends MIP.CustomElement {
    connectedCallback () {
      this.addEventAction('show', function (event, args) {
        console.log('show', event, args)
        // 'show' eventObject '1,2'
        // 注意参数 `1,2` 未经过任何处理
      })
    }
  }
  ```

  ```html
  <mip-example id="example"></mip-example>
  <button on="tap:example.show(1,2)"></button>
  ```

- **参考**：[事件通信](../../guide/component/actions-and-events.html)

## static 方法

### observedAttributes

- **类型**：`Function`

- **详细**：

  定义需要观察标签属性值变化的属性名列表。如果列表返回的属性值发生将会触发  [attributeChangedCallback](#attributeChangedCallback)

- **示例**

  ``` js
    static get observedAttributes () {
      return ['name', 'src']
    },
    attributeChangedCallback(name, oldVal, newVal) {
      console.log(name, oldVal, newVal)
    }
  ```

  ``` html
    <mip-a name="a" data="a"></mip-a>
  ```

  上述例子中标签 `mip-a` 属性 name 的值由 a 变成 b 会触发`attributeChangedCallback` 回调，并输出 `name, a, b`, 标签属性 data 值由 a 变成 b 将不会触发 `attributeChangedCallback` 回调。

## 生命周期钩子

生命周期钩子，即组件可重写的方法，自定义组件会在适当的时机调用钩子。

### constructor

- **类型**：`Function`

- **参数**
  - element `{Element}` Element 实例

- **详细**：

CustomElement 构造函数，MIP 组件在扩展基类如果要重写 constructor 记得调用 `super(element)`

### connectedCallback

- **类型**：`Function`

- **详细**：

  MIP 自定义元素挂载到 DOM 上时执行。

  > 注意和使用 Vue 组件提供的 connectedCallback **钩子参数和上下文**不一致。

### disconnectedCallback

- **类型**：`Function`

- **详细**：

  元素从 DOM 上移除时执行。

  > 注意和使用 Vue 组件提供的 disconnectedCallback **钩子参数和上下文**不一致。

### firstInviewCallback

- **类型**：`Function`

- **详细**：

  自定义元素的生命周期钩子，在元素挂载到 DOM 上之后，首次出现在视口内上时执行。适合做懒加载之类的功能。

  > 注意和使用 Vue 组件提供的 firstInviewCallback **钩子参数和上下文**不一致。

### attributeChangedCallback

- **类型**：`Function`

- **参数**：
  - name `{String}` 发生变化的属性名
  - oldVal `{String}` 变化前的属性值
  - newVal `{String}` 变化后的属性值

- **详细**：

  依赖 [`observedAttributes`](#observedAttributes) 方法指定的属性值列表，当列表中的属性值发生改变时触发该回调。

### viewportCallback

- **类型**：`Function`

- **参数**：
  - inViewport `{Boolean}` 当前是否在视口内

- **详细**：

  当自定义元素从视口内消失或者重新进入视口时触发改回调。

### build

- **类型**：`Function`

- **详细**：

  自定义元素内部结构渲染时执行。该执行实际根据 `prerenderAllowed` 返回值决定执行时机。如果返回 true，则在 `connectedCallback` 钩子中执行，为 false 则在 `firstInviewCallback` 中执行。

  建议将页面结构的渲染逻辑放到 build 钩子中执行，让 MIP 检测自定义组件第一次进入视口时执行 build。避免页面一开始执行大量 JS 逻辑。


