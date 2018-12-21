# 组件写法

## 创建一个 MIP 组件

每一个 MIP 组件都是一个继承自 `MIP.CustomElement` 的类，并使用 `export default` 导出。
一个简单的 MIP 组件是这样的：

```js
class MIPGreeting extends MIP.CustomElement {
  build () {
    const name = this.element.getAttribute('name')

    this.element.innerHTML = `<div>Hello <span id="greeting-name">${name}</span>!</div>`
  }
}

export default MIPGreeting
```

随后，在 HTML 中这样使用：

```html
<mip-greeting name="world"></mip-greeting>
```

组件中通过 `this.element.getAttribute` 可以获取元素的属性。这样在组件实例化后，HTML 会渲染成：

```html
<mip-greeting name="world">
  <div>
    Hello <span id="greeting-name">world</span>!
  </div>
</mip-greeting>
```

## 响应数据更新

当 MIP 组件需要相应属性变更时，需要实现 `attributeChangedCallback`：

```js
class MIPGreeting extends MIP.CustomElement {
  build () {
    const name = this.element.getAttribute('name')

    this.element.innerHTML = `<div>Hello <span id="greeting-name">${name}</span>!</div>`
  }

  attributeChangedCallback (name, oldValue, value) {
    if (name === 'name') {
      this.element.querySelector('#greeting-name').innerText = value
    }
  }
}

export default MIPGreeting
```

## 实例生命周期

MIP 组件实例在创建时会经历一系列初始化的过程，包括预渲染、挂载到 DOM、进入视口、属性变更等情况。在这个过程中会运行一些实例上的 **生命周期** 函数。

详细的 **生命周期** 介绍详见 [实例生命周期](../principle/instance-life-cycle.md)。
