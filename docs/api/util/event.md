# MIP.util.event

```javascript
MIP.util.event
window.MIP.util.event
```

## 描述

`MIP.util.event` 事件代理工具函数


## 方法

### delegate

- 参数
  - {HTMLElement} element 指定元素
  - {string} selector 匹配选择器
  - {Object} event
  - {Function} handler
  - {boolean} capture 是否在事件捕获时执行

- 返回值

  {Function}

  返回移除代理的函数方法，直接调用即可

- 用法

  事件代理函数

  ```javascript
  // 代理所有 <a> 元素的 click 事件
  let undelegate = MIP.util.event.delegate(document, 'a', 'click', function (event) {
    // 具体处理
  }, true)

  // 移除代理事件
  undelegate()
  ```

### create

- 参数
  - {string} type Event name
  - {?Object} data Custom data
- 返回值

  {Event}

  返回一个 `Event` 对象

- 用法

  创建了 `event` 对象，`event.data = data`

  ```javascript
  MIP.util.event.create('click', data)
  ```


