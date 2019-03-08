# naboo 动画库

## naboo 简介

动画是页面开发中必不可少的一个元素，在提升用户体验方面发挥着巨大的作用。但动画的实现会有一定的技术成本，如果没有第三方库，开发者自行封装的成本会变得很高，而且很容易在兼容性方面出现问题。
naboo 是 MIP 的一个动画解决方案，它提供了丰富的功能点，旨在解决开发者动画使用问题，提供简单易用的动画功能。其中 naboo 提供的功能包括以下方面：

1. 功能
- 提高动画性能，css3 transition 实现。
- 支持动画播放/暂停。

2. 写法
- 支持链式写法。
- 支持非链式写法。

3. 执行顺序
- 支持串行动画。
- 支持并行动画。
- 支持串行和并行结合动画。
- 支持多dom动画（通过类选择器，默认为并行）。

4. 类型
- 支持普通动画。
- 支持 transform 动画。
- 不支持 keyframe 动画。

5. 回调
- 支持串行回调。
- 支持并行回调。
- 支持并行动画全部执行完成的回调。

## naboo功能一览

naboo 提供了强大的功能，本小节简单列举其主要 API，使得开发者在开发过程中可以做到有章可循。

### naboo.start([fn])

开始执行动画的指令函数，只要在 `start` 调用之后动画才会开始执行。
参数如下表所示：

|参   数|类    型|必    填|说    明|
|---|---|---|---|
|fn|Function|否|动画完成后的回调函数|

返回值如下表所示：

|类    型|说    明|
|---|---|
|Object|返回当前 naboo 实例|

下面可以看一段 `naboo.start([fn])` 的例子：

```js
MIP.util.naboo.animate(ele, {
  width: "90%"
}, {
  duration: 2000,
  cb: function () {
    console.log('动画结束')
  }
}).start()
```

### naboo.next()

让动画进入下一步的指令函数，一般在 Naboo 插件中调用。

参数
无。

返回值如下表所示

|类    型|说    明|
|---|---|
|Object|返回当前 naboo 实例|

下面代码展示了一个 `naboo.next()` 的例子

```js
MIP.util.noboo.animate(ele, {
  width: "90%"
}, {
  duration: 2000,
  cb: function () {
    console.log('动画1结束')
  }
})
.done(function (next) {
  console.log('done 调用完成')
  // 调用下一个动画
  next()
})
.animate(ele, {
  'transform': 'translateX(200px)'
}, {
  duration: 2000,
  ease: "ease",
  cb: function () {
    console.log('动画2结束')
  }
}).start()
```

### naboo.cancel()

取消动画的指令，调用该函数后，当前未执行完的动画仍会继续执行完成，后续的动画不会执行。

参数
无。
返回值如下表所示

|类    型 | 说    明|
|---|---|
|Object|返回当前 naboo 实例|

下面代码展示了一个 `naboo.cancel()` 的例子:

```js
let instance
// 点击按钮1开始执行动画
startBtn.onclick = function () {
  instance = MIP.util.naboo.animate(ele1, {
    'transform': 'translateX(10px)'
  }, {
    duration: 3000,
    cb: function () {
      console.log('动画1结束')
    }
  })
  .animate(ele2, {
    'transform': 'translateX(20px)'
  }, {
    duration: 3000,
    cb: function () {
      console.log('动画2结束')
    }
  })
  .start(function () {
    animate4text.innerHTML += "<p>start回调</p>"
  })
}

//在元素 ele1 动画未执行完成时，点击按钮2后会终止后续动画执行，
//即 ele1 动画执行完成后不会执行 ele2的动画
cancelBtn.onclick = function () {
  instance.cancel()
}
```

### naboo.animate(dom, property, [opt])

`animate` 方法是 Naboo 模块提供的执行 CSS3 transiton 动画的函数。

参数如下表所示

|参   数|类    型|必    填|说    明|
|---|---|---|---|
|dom|Object|是|需要进行动画的 DOM 元素|
|property|Object|是|需要进行动画的 CSS 属性键值对对象|
|opt|Object|否|可选的动画参数对象|
|opt.duration|Number|否|动画时长，默认值 400，单位 ms|
|opt.ease|String|否|动画的缓动函数名，默认值 `ease`，可选值包括 `ease`、`linear`、`ease-in`、`ease-out`、`ease-in-out`|
|opt.delay|Number|否|动画延迟执行的时间，默认值 0，单位 ms|
|opt.cb|Function|否|动画完成后的回调函数|

返回值结构如下表所示：

|类    型|说    明|
|---|---|
|Object|返回当前 naboo 实例|

下面代码展示的是一个 `naboo.animation` 方法的例子:

```js
MIP.util.naboo.animate(element, {
  transform: 'translate(' + x + 'px,' + y + 'px)',
  opacity: 0
}, {
  duration: 1000,
  ease: 'ease',
  delay: 500,
  cb: function () {
    console.log('动画执行完成')
  }
}).start()
```

### naboo.p(list)

Naboo 的并行插件，可以同时执行多个动画。

参数如下表所示：

|参   数|类    型|必   填|说    明|
|---|---|---|---|
|list|Object|是|naboo 对象，可填多个，逗号隔开|

返回值结构如下表所示：

|类    型|说    明|
|---|---|
|Object|返回当前 naboo 实例|

下面代码展示的是一个 naboo.p 的例子：

```js
MIP.util.naboo.p(
  MIP.util.naboo.animate(ele1, {
    'transform': 'translateX(200px)'
  }, {
    duration: 2000,
    cb: function () {
      console.log('动画1结束')
    }
  }),
  MIP.util.naboo.animate(ele2, {
    'transform': 'translateX(200px)'
  }, {
    duration: 3000,
    cb: function () {
      console.log('动画2结束')
    }
  })
).start()
```

### naboo.done(fn)

Naboo 的 `done` 插件，可用于在任何一个动画插件后进行回调。
参数如下表所示：

|参   数|类    型|必    填|说    明|
|---|---|---|---|
|fn|Function|是|回调函数|

返回值结构如下表所示：

|类    型|说    明|
|---|---|
|Object|返回当前naboo实例|

下面的代码展示的是一个 `naboo.done` 方法的例子：

```js
MIP.naboo.animate(ele1, {
  width: "90%"
}, {
  duration: 2000,
  cb: function () {
    console.log('动画1结束')
  }
})
.done(function (next) {
  console.log('done调用完成')
  next()
})
.animate(ele2, {
  'transform': 'translateX(200px)'
}, {
  duration: 2000,
  ease: "ease",
  cb: function () {
    console.log('动画2结束')
  }
}).start()
```
