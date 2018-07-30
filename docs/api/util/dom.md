# MIP.util.dom

```javascript
MIP.util.dom
window.MIP.util.dom
```

## 描述

`MIP.util.dom` 提供了一些 DOM 的相关工具函数


### 方法

### closest
- 参数：
  - {HTMLElement} element 指定元素
  - {string} selector 选择器
- 返回值：

	{?HTMLElement}

	匹配的元素节点 或 `null`

- 用法：

  检测返回 element 就近的父级 `<a>` 标签， 没有返回 `null`

  ```javascript
  MIP.util.dom.closest(element, 'a')
  ```

### contains
- 参数：
  - {HTMLElement} element 指定元素节点
  - {HTMLElement} child 子节点
- 返回值：

	{boolean}

	包含返回 true , 不包含返回 false

- 用法：

  // 判断 element 节点中是否含有传入的 childElement 节点

  ```javascript
  MIP.util.dom.contains(element, childElement)
  ```

### closestTo
- 参数：
  - {HTMLElement} element 指定元素
  - {string} selector 选择器
  - {HTMLElement} target 目标节点
- 返回值：

	{?HTMLElement}

	匹配的元素节点 或 `null`

- 用法：

  检测 targetElement 中是否存在，element 的就近父级 `<a>` 标签，有则返回该 `<a>`标签，没有返回 `null`

  ```javascript
  MIP.util.dom.closestTo(element, 'a', targetElement)
  ```

### matches
- 参数：
  - {HTMLElement} element 指定元素
  - {string} selector 选择器
- 返回值：

	{boolean}

- 用法：

  检测 element 元素是否匹配 `test` 类名

  ```javascript
  MIP.util.dom.matches(element, '.test')
  ```

### create
- 参数：
  - {string} str html 字符串
- 返回值：

  {?HTMLElement}

  返回一个元素节点 or 多个元素节点列表 or null

- 用法：

  将 html 字符串创建元素 `<span>` 节点

  ```javascript
  // 返回一个 span 元素节点
  MIP.util.dom.create('<span>test</span>')
  MIP.util.dom.create('<span><span>1</span></span>')

  // 返回一个长度为2的 span 节点数组
  MIP.util.dom.create('<span>test1</span><span>test2</span>')

  // 返回 null
  MIP.util.dom.create('1')
  ```

### insert
- 参数：
  - {HTMLElement} parent 指定元素节点
  - {Array} children 待插入的子节点列表
- 返回值：

  {boolean}

- 用法：

  将 childElement 节点列表依次插入 element 元素节点

  ```javascript
  MIP.util.dom.insert(element, [childElement0, childElement1])
  ```

### waitDocumentReady
- 参数：
  - {Function} cb 回调函数
- 返回值：

  `undefined`

- 用法：

  检测 `document.body` 存在后执行传入的回调函数

  ```javascript
  MIP.util.dom.waitDocumentReady(function() {
    console.log('document.body is ready!')
  })
  ```




