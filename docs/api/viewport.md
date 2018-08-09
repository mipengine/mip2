# viewport

在开发自定义组件的过程中，经常会出现获取当前视口信息的需求。例如开发一个向上滑动加载的长列表，需要实时获取当前视口的滚动距离。viewport 封装了一系列视口相关的 API 供组件开发者方便地使用，大致可以分成获取视口尺寸和获取、设置滚动位置以及事件监听功能，主要方法如下。

## 视口尺寸信息

### getHeight
- 参数：无
- 返回值：数值
- 用法：
  获取当前页面可视高度

  ```javascript
  let height = MIP.viewport.getHeight() // 640
  ```

### getWidth
- 参数：无
- 返回值：数值
- 用法：
  获取当前页面可视宽度

  ```javascript
  let width = MIP.viewport.getWidth() // 320
  ```

### getRect
- 参数：无
- 返回值：Rect 对象
- 用法：
  获取当前页面尺寸信息，以 Rect 对象形式。
  Rect 对象包含宽高，以及上下左右四个顶点的位置信息。

  ```javascript
  let rect = MIP.viewport.getRect()
  // rect.left/top/right/bottom 四个顶点位置
  // rect.height 高度
  // rect.width 宽度
  ```

## 视口滚动信息

### getScrollHeight
- 参数：无
- 返回值：数值
- 用法：
  获取当前页面实际高度

  ```javascript
  let scrollHeight = MIP.viewport.getScrollHeight() // 2000
  ```

### getScrollTop
- 参数：无
- 返回值：数值
- 用法：
  获取当前页面滚动高度

  ```javascript
  let scrollTop = MIP.viewport.getScrollTop() // 100
  ```

### setScrollTop
- 参数：数值，垂直滚动距离
- 返回值：无
- 用法：
  设置当前页面滚动高度，页面滚动到指定位置

  ```javascript
  MIP.viewport.setScrollTop(100)
  ```

## 监听视口事件

除了直接获取视口相关信息，监听视口的改变事件，做出相应操作也是一个常见的需求。
为此，viewport 在滚动过程以及自身尺寸发生改变时，会触发相应的事件，自定义组件可以监听这些事件，做出相应操作。

### scroll
- 用法：
  监听 `scroll` 事件，在处理函数中可以使用 `getScrollTop` 获取当前的滚动距离。

  ```javascript
  MIP.viewport.on('scroll', function () {
    // 获取当前滚动距离
    let scrollTop = MIP.viewport.getScrollTop()
  })
  ```

### resize
- 用法：
  监听 `resize` 事件，在处理函数中可以使用 `getWidth` 获取视口当前宽度。

  ```javascript
  MIP.viewport.on('resize', function () {
    // 获取当前视口宽度
    let width = MIP.viewport.getWidth()
  })
  ```
