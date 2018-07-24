# MIP 对象

```javascript
MIP
window.MIP
```

## 描述

`MIP` 对象是 MIP 对外暴露 API 的唯一方式，以前 AMD 的方式在 MIP2 中已经被废弃，MIP 对象提供了注册自定义组件、工具函数等

## 属性

**version**: `string`

等于 '2'

**standalone**: `boolean`

- 用法：

  常量，不能更改

  - `true`: 代表当前 MIP 运行在独立模式下，而非百度搜索结果页中
  - `false`: 代表当前不在独立模式下运行

**util**: `Object`

util 工具，参考[工具](./util/index.md)

**viewer**: `Object`

viewer，参考[viewer](./viewer.md)

**viewport**: `Object`

viewport，参考[viewport](./viewport.md)

**hash**: `Object`

hash 相关的工具，参考[hash](./hash.md)

**builtinComponents.MipShell**: `HTMLElement`

- 用法：

  `MipShell` 为 [MIP Shell](../guide/all-sites-mip/mip-shell.md) 的自定义标签，暴露出来方便开发者进行继承并进行修改。

  ```javascript
  class MipShellTest extends MIP.builtinComponents.MipShell {
    constructor () {
      super()
      // other
    }
  }
  ```



## 方法

**registerVueCustomElement**
- 参数：
  - {string} tag 自定义标签名
  - {*} component vue component
- 用法：

  注册用 Vue 编写的自定义组件，组件编写方式参考[使用 mip-cli 快速开始](../guide/mip-cli/start-writing-first-mip.md)

  ```javascript
  MIP.registerVueCustomElement('mip-test', {
    render() { console.log('mip-test') }
  })
  ```

**registerCustomElement**
- 参数：
  - {string} tag 自定义标签名
  - {BaseElement} clazz customElement v2 标准的自定义 Class
  - {string} css 自定义组件的 css
- 用法：

  注册原生 customElement v2 编写的组件，不推荐使用

  ```javascript
  MIP.registerCustomElement('mip-test', class MipTest {})
  ```

**prerenderElement**
- 参数：
  - {MIPElement} element 必须是 MIP 自定义标签，浏览器原生标签不起作用
- 用法：

  MIP 为了首屏性能，不在第一屏的元素不进行渲染，有的时候为了下一屏的效果，可以在合适的时机预渲染节点，这就需要 `prerenderElement`

  ```javascript
  // 获取 MIP 自定义标签
  let element = document.querySelector('#id')
  MIP.prerenderElement(element)
  ```
