# MIP.util.EventEmitter

```javascript
MIP.util.EventEmitter
window.MIP.util.EventEmitter
```

## 描述

`MIP.util.EventEmitter` 提供了一些 dom 的位置相关的检测方法


### 方法

### mixin

- 参数
  - {Object} obj
- 返回值：

  {Object}

- 用法：

  使输入的任意 `obj` 对象能够拥有 EventEmitter 的属性方法

  ```javascript
  MIP.util.EventEmitter.mixin(obj)
  ```

>info 以下方法可以在 mixin 的 obj 上直接调用

### on

- 参数
  - {string} name
  - {Function} handler
- 返回值：

  {Object}

- 用法：

  增加事件 `name` 的监听函数 `handler`

  ```javascript
  MIP.util.EventEmitter.on(name, handler)
  ```

### off

- 参数
  - {string} name
  - {Function} handler
- 返回值：

  {?Array}

  返回事件处理列表 或是 `null`

- 用法：

  移除事件 `name` 的监听函数 `handler`

  ```javascript
  MIP.util.EventEmitter.off(name, handler)
  ```


### once

- 参数
  - {string} name
  - {Function} handler
- 返回值：

  {Function}

  返回解绑函数

- 用法：

  增加事件 `name` 的监听函数 `handler`，且 `handler` 执行一次之后立刻被移除

  ```javascript
  MIP.util.EventEmitter.once(name, handler)
  ```

### trigger

- 参数
  - {string} name
- 返回值：

  `undefined`

- 用法：

  触发事件 `name`，执行监听函数

  ```javascript
  MIP.util.EventEmitter.once(name)
  ```

### setEventContext

- 参数：
  - {Function} context
- 返回值：

  `undefined`

- 用法：

  设置 `handler` 的执行环境

  ```javascript
  MIP.util.EventEmitter.setEventContext(context)
  ```




