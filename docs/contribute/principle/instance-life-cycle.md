# MIP 组件实例生命周期

## 实例生命周期

你可以定义以下的生命周期回调钩子，这些回调会在自定义元素的生命周期的不同点回调。

### constructor
- 类型：Function
- Context: CustomElement
- 详细：
    自定义元素构造函数

### attributeChangedCallback

- 类型：Function
- Context: CustomElement
- 详细：
    自定义元素在初始化完成后，如果对应组件 class 定义了 observedAttributes 并且自定义元素上定义了对应的属性，那么 attributeChangedCallback 会在组件执行完 constructor 之后会立即执行。之后在监控的属性变更时会再次触发 attributeChangedCallback。

### connectedCallback

- 类型：Function
- Context: CustomElement
- 详细：
    自定义元素的生命周期钩子，元素挂载到 DOM 上之后执行。

### build

- 类型：Function
- Context: CustomElement
- 详细：
    自定义元素的生命周期钩子，开始渲染组件。

### layoutCallback

- 类型：Function
- Context: CustomElement
- 返回
  - Promise
- 详细：
    自定义元素的生命周期钩子，元素 layout 渲染完成的时机（保证了无抖动环境），该回调函数的返回值须为 Promise，主要用来处理一些异步耗时的操作，如资源的加载，复杂的渲染等。

### firstInviewCallback

- 类型：Function
- Context: CustomElement
- 详细：
    自定义元素的生命周期钩子，在元素挂载到 DOM 上之后，首次出现在视口内上时执行。适合做懒加载之类的功能。

### viewportCallback

- 类型：Function
- Context: CustomElement
- 参数：
  - inViewport `{Boolean}` 当前是否在视口内
- 详细：
    自定义元素的生命周期钩子，元素进入或者离开视窗的时机。

### unlayoutCallback

- 类型：Function
- Context: CustomElement
- 详细：
    自定义元素的生命周期钩子，元素从资源管理队列中移除（删除 DOM）的时候被调用。

### disconnectedCallback

- 类型：Function
- Context: CustomElement
- 详细：
    自定义元素的生命周期钩子，元素从 DOM 上移除之后执行。

## 生命周期图示

下图是 MIP 组件实例的生命周期的示意图，展示了每个生命周期钩子的执行时机。

![MIP 组件生命周期](https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mip/docs/lifecycle-d543b674.png)
