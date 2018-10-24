# MIP.util.rect

```javascript
MIP.util.rect
window.MIP.util.rect
```

## 描述

`MIP.util.rect` 提供了一些 DOM 位置相关函数


### 方法

### getElementRect

- 参数
  - {HTMLElement} element
- 返回值：

  {Object}

  返回对象包含属性:

  {
    left: XX,
    top: XX,
    with: XX,
    height: XX,
    right: XX,
    bottom: XX
  }

- 用法：

  ```javascript
  MIP.util.rect.getElementRect(element)
  ```

### getElementOffset

- 参数
  - {HTMLElement} element
- 返回值：

  {Object}

  返回对象包含属性:

  {
    left: XX,
    top: XX,
    with: XX,
    height: XX
  }

- 用法：

  ```javascript
  MIP.util.rect.getElementOffset(element)
  ```

### scrollingElement

- 参数

  无

- 返回值：

  {HTMLElement}

- 用法：

  获取滚动元素

  ```javascript
  MIP.util.rect.scrollingElement()
  ```

### getScrollTop

- 参数

  无

- 返回值

  {number} 获取滚动元素的 top 值

- 用法

  ```javascript
  MIP.util.rect.getScrollTop()
  ```

### getScrollHeight


- 参数

  无

- 返回值

  {number} 获取滚动元素的 height 值

- 用法

  ```javascript
  MIP.util.rect.getScrollHeight()
  ```
### getScrollWidth

- 参数

  无

- 返回值

  {number} 获取滚动元素的 width 值

- 用法

  ```javascript
  MIP.util.rect.getScrollWidth()
  ```


### setScrollTop

- 参数
  - {number} top  设置滚动元素的 top 值

- 返回值

    `undefined`

- 用法

  ```javascript
  MIP.util.rect.setScrollTop(60)
  ```


### overlapping

- 参数
  - {Object} rect1 rect1
  - {Object} rect2 rect2
- 返回值

  {boolean}

  判断 rect1、rect2 是否有重叠区域

- 用法

  ```javascript
  let rect1 = {
    left: 10,
    right: 20,
    top: 10,
    bottom: 20
  }

  let rect2 = {
    left: 10,
    right: 20,
    top: 15,
    bottom: 30
  }

  let rect3 = {
    left: 10,
    right: 20,
    top: 30,
    bottom: 40
  }

  MIP.util.rect.overlapping(rect1, rect2) // 返回 true

  MIP.util.rect.overlapping(rect1, rect3) // 返回 false
  ```


