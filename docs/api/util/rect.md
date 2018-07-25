# MIP.util.rect

```javascript
MIP.util.rect
window.MIP.util.rect
```

## 描述

`MIP.util.rect` 提供了一些 DOM 位置相关函数


### 方法

**getElementRect**

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

**getElementOffset**

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
 
 **scrollingElement**

- 返回值：

  {HTMLElement}

- 用法：
  
  获取滚动元素

  ```javascript
  MIP.util.rect.scrollingElement()
  ```

**getScrollTop**

- 返回值

  {number} 获取滚动元素的 top 值

**getScrollHeight**

- 返回值

  {number} 获取滚动元素的 height 值

**getScrollWidth**

- 返回值

  {number} 获取滚动元素的 width 值

**setScrollTop**

- 参数
  - {number} top  设置滚动元素的 top 值


**overlapping**

- 参数
  - {Object} rect1 rect1
  - {Object} rect2 rect2
- 返回值

  {boolean}

  判断rect1、rect2 是否有重叠区域


 
 
