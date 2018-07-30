# MIP.util.Gesture

Gesture 是 MIP 封装的手势库，目前包含了对单击、双击、滑动等事件的处理。

- 用法：

  ```javascript
  let Gesture = MIP.util.Gesture
  let gesture = new Gesture(element, opt)
  ```

- 参数：

  类型|参数名|是否必选|描述
  ---|---|---|---
  Object|element|是|需要绑定手势操作的元素
  Object|opt|否|配置参数

  配置参数具体介绍如下
  - preventDefault: 是否阻止默认事件，默认值为false
  - preventX: 是否阻止横向滑动时的默认事件，默认值为true
  - preventY: 是否阻止纵向滑动时的默认事件，默认值为false
  - stopPropagation: 是否阻止事件冒泡，默认值为false

## 方法

### on

- 描述：

  利用手势识别器，给手势事件添加对应的手势事件处理函数

- 参数：

  类型|参数名|是否必选|描述
  ---|---|---|---
  string|type|是|手势事件类型
  Function|fn|是|手势事件处理函数

  目前内置的手势事件类型 type 有：
  - tap: 单击
  - doubletap: 双击
  - swipe: 滑动
  - swipeleft: 向左滑
  - swiperight: 向右滑
  - swipeup: 向上滑
  - swipedown: 向下滑

  手势事件处理函数 fn 的参数如下：

  类型|参数名|是否必选|描述
  ---|---|---|---
  Object|event|是|描述手势事件的对象，原生Event对象的接口实现
  Object|data|是|滑动手势的数据对象

  滑动手势的数据对象的通用字段如下：
  - angle: 滑动角度，如横滑为0度
  - deltaTime: 从开始到结束的时间间隔。单位是ms
  - deltaX: 横轴位移
  - deltaY: 纵轴位移
  - direction: 方向。0: 未变动   1: 上   2:右   3: 下   4: 左
  - distance: 移动距离
  - pointers: 触摸点
  - timeStamp: 事件发生的时间戳
  - velocity: 速度
  - velocityX: 横向速度
  - velocityY: 纵向速度
  - x: 触摸中心点坐标x
  - y: 触摸中心点坐标y
  - type: 手势事件类型，内置类型见上文

  特别地，当 type 为 swipe 时，数据对象会增加一个额外的 swipeDirection   字段，它表示滑动的方向，其值可以是 up、 down、 left、 right

- 返回值：

  {Object} 返回当前 Gesture 实例

- 用法：

  ```javascript
  // 绑定 tap
  gesture.on('tap', function (event, data) {
      console.log('单击')
  })
  // 绑定向上滑或向下滑
  gesture.on('swipeup swipedown', function (event, data) {
      console.log(data.type) // 'swipeup' or 'swipedown'
      console.log(data.swipeDirection) // 'up' or 'down'
  })
  ```

### off

- 描述：

  清除手势事件对应的处理函数，由于 MIP.util.Gesture 继承自 MIP.util.EventEmitter，并且没有重写 off 方法，所以详细用法见[EventEmitter](./event-emitter.md)

### cleanup

- 描述：

  清除所有的手势事件

- 参数：

  无

- 返回值：

  `undefined`

- 用法：

  ```javascript
  gesture.cleanup()
  ```
