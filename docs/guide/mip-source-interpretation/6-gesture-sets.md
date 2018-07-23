# gesture 手势集合

gesture 是 MIP 封装的手势库，目前包含了对单击、双击、滑动等事件的处理。

## 为什么会有 gesture

在移动页面使用过程中，手势操作是一个必然的过程。随着页面功能的丰富，更多场景都需要在手势执行的过程中做一系列交互，如在页面上滑过程中隐藏标题栏，在下滑过程中显示；再比如说在双击之后出现浮层效果等，都需要与手势进行密切结合。目前原生的手势操作所能提供的事件属性并不能满足要求，如滑动方向、滑动速度、滑动角度等，基于这些场景 MIP 封装了一套手势功能，目的在于将原生的手势进行扩充，让开发者在使用过程中能够更轻松地获取不同属性进行使用，快速完成需求功能。

## 手势功能组成

gesture 由三部分组成，分别是 `gesture`、`data-processor`、`gesture-recognizer`，它们的功能如下所述。

1. gesture：手势功能的入口文件，该文件中会监听 touchstart、touchmove、touchend、touchcancel 事件。
2. data-processor：手势数据处理，扩展手势过程中需要的属性，具体属性可以参照如下源码和介绍，如下面代码所示。

```js
process (event, preventX, preventY) {
  let data = {}
  let now = Date.now()
  let touches = event.touches.length ? event.touches : event.changedTouches
  if (event.type === 'touchstart') {
    // 触摸手指的中心坐标
    this.startCenter = this.getCenter(touches)
    // 手势启动事件
    this.startTime = now
    // 手势数据初始对象
    this.startData = data
    // 手势执行前数据
    this.preData = null
  }
  let startCenter = this.startCenter
  let center = this.getCenter(touches)
  let deltaTime = data.deltaTime = now - this.startTime

  // 手指数量
  data.pointers = touches
  // 手指中心x坐标
  data.x = center.x
  // 手指中心y坐标
  data.y = center.y

  let deltaX = data.deltaX = center.x - startCenter.x
  let deltaY = data.deltaY = center.y - startCenter.y

  // 横向速度
  data.velocityX = deltaX / deltaTime || 0
  // 纵向速度
  data.velocityY = deltaY / deltaTime || 0
  // 最大速度
  data.velocity = max(abs(data.velocityX), abs(data.velocityY))
  // 滑动角度，如横滑为0度
  data.angle = this.getAngle(startCenter, center)
  // 移动距离
  data.distance = this.getDistance(startCenter, center)
  //方向。0:未变动   1:上   2:右   3: 下   4: 左
  data.direction = this.getDirection(deltaX, deltaY)
  // 事件类型
  data.eventState = event.type.replace('touch', '')
  // 时间戳
  data.timeStamp = now

  if (this.preData) {
    let instTime = data.instantDeltaTime = now - this.preData.timeStamp
    let instX = data.instantVelocityX = (data.x - this.preData.x) 
      / instTime || 0
    let instY = data.instantVelocityY = (data.y - this.preData.y)
      / instTime || 0
    if (data.eventState === 'move' && (preventX || preventY)) {
      let curDirection = abs(instX) > abs(instY)
      if ((preventX && curDirection) || (preventY && !curDirection)) {
        event.preventDefault()
      }
    }
  } else {
    data.instantDeltaTime 
      = data.instantVelocityX 
      = data.instantVelocityY = 0
  }
  this.preData = data
  data.event = event
  // 返回 data对象，并冻结不能修改
  return Object.freeze(data)
}
```

3. gesture-recognizer：手势识别器，进行手势的注册、识别及处理。在这个模块，会将自定义封装的手势(`tap`、`doubleTap`、`swip`)执行进行处理，封装成单独的模块。如代码下面所示，我们在加入新的手势类型时，会扩展 Recognizer 父模块，让它拥有手势的功能，并在此基础上将该手势所需要的属性方法进行扩展或重载。

```js
class TapRecognizer extends Recognizer {
  constructor (gesture) {
    super(gesture)
    this.boundHoldTimeFn = holdTimeFn.bind(this)
    this.taps = 1
    this.count = 0
    this.holdTime = 300
    this.time = 250
    this.moveRange = 10
    this.level = 1
    this.needAutoReset = false
  }
  get eventList () {
    return this._eventList || ['tap']
  }
  process (data) { ... }
  reset () { ... }
  emit () { ... } 
}
Recognizer.register(TapRecognizer, 'tap')
```

## 手势实现原理

首先，手势功能会监听所有 touch 事件，并绑定在统一的处理函数上，如下面代码所示，同时会将 `EventEmitter` 事件处理机制提供的函数绑定在Gesture上，让手势具有事件处理的功能。

```js
class Gesture extends EventEmitter {
  constructor (element, opt) {
    super(element, opt)
    // ...
    // 绑定手势处理函数
    this._boundTouchEvent = touchHandler.bind(this)
    // 监听 touch相关事件
    listenersHelp(element, 'touchstart touchmove touchend touchcancel', this._boundTouchEvent)
    // ...
  }
}
// 手势处理函数
function touchHandler (event) {
  let opt = this._opt
  opt.preventDefault && event.preventDefault()
  opt.stopPropagation && event.stopPropagation()

  // 如果 touchstart 没有被触发(
  // 可能被子元素的 touchstart 回调触发了 stopPropagation)，
  // 那么后续的手势将取消计算
  if (event.type !== 'touchstart' && !dataProcessor.startTime) {
    return
  }

  let data = dataProcessor.process(event, opt.preventX, opt.preventY)
  this._recognize(data)
  this.trigger(event.type, event, data)
}
```

在手势执行时，`touchHandler` 会被触发，此时主要会做两件事：

- 通过数据处理模块进行事件属性的扩展，让自定义手势能够拥有自定义属性，如下面代码所示。具体属性可以参考上一小节 `data-processor` 模块列举的扩展参数。

```js
let data = dataProcessor.process(event, opt.preventX, opt.preventY);
```

- 调用 type 对应的手势的处理功能，该函数的目的是处理函数事件状态，如 touch 的开始、结束、保持等状态，如下面代码所示。

```js
this._recognize(data);
```

由于 Gesture 中绑定了 `EventEmitter` 原型上的方法，所以在调用 type 自定义的方法后，会将相应处理的扩展数据回传到绑定的回调中，即 `on` 函数的回调中，此时开发者可以通过on 函数回调及回调中传回的数据进行业务逻辑处理。
