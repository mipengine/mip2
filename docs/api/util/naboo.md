# MIP.util.naboo

naboo 是 MIP 的一个动画解决方案，它提供了丰富的功能点，旨在解决开发者动画使用问题，提供简单易用的动画功能。

## 方法

### animate

- 描述：

  `animate` 方法是 Naboo 模块提供的执行 CSS3 transiton 动画的函数。

- 参数：

  |参   数|类    型|必    填|说    明|
  |---|---|---|---|
  |dom|Object|是|需要进行动画的 DOM 元素|
  |property|Object|是|需要进行动画的 CSS 属性键值对对象|
  |opt|Object|否|可选的动画参数对象|
  |opt.duration|Number|否|动画时长，默认值 400，单位 ms|
  |opt.ease|String|否|动画的缓动函数名，默认值 `ease`，可选值包括 `ease`、`linear`、`ease-in`、`ease-out`、`ease-in-out`|
  |opt.delay|Number|否|动画延迟执行的时间，默认值 0，单位 ms|
  |opt.cb|Function|否|动画完成后的回调函数|

- 返回值：

  |类    型|说    明|
  |---|---|
  |Object|返回当前 naboo 实例|

- 用法

  ```javascript
  // 参数对照
  MIP.util.naboo.animate(dom, property, [opt])
  // 具体实例
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

### start

- 描述：

  开始执行动画的指令函数，只要在 `start` 调用之后动画才会开始执行。

- 参数：

  |参   数|类    型|必    填|说    明|
  |---|---|---|---|
  |fn|Function|否|动画完成后的回调函数|

- 返回值：

  |类    型|说    明|
  |---|---|
  |Object|返回当前 naboo 实例|

- 用法：

  ```javascript
  MIP.util.naboo.animate(ele, {
    width: "90%"
  }, {
    duration: 2000,
    cb: function () {
      console.log('动画结束')
    }
  }).start()
  ```

### next

- 描述：

  让动画进入下一步的指令函数，一般在 Naboo 插件中调用。

- 参数：

  无

- 返回值：

  |类    型|说    明|
  |---|---|
  |Object|返回当前 naboo 实例|

- 用法：

  ```javascript
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

### cancel

- 描述：

  取消动画的指令，调用该函数后，当前未执行完的动画仍会继续执行完成，后续的动画不会执行。

- 参数：

  无

- 返回值：

  |类    型|说    明|
  |---|---|
  |Object|返回当前 naboo 实例|

- 用法：

  ```javascript
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

### p

- 描述：

  Naboo 的并行插件，可以同时执行多个动画。

- 参数：

  |参   数|类    型|必   填|说    明|
  |---|---|---|---|
  |list|Object|是|naboo 对象，可填多个，逗号隔开|

- 返回值：

  |类    型|说    明|
  |---|---|
  |Object|返回当前 naboo 实例|

- 用法：

  ```javascript
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

### done

- 描述：

  Naboo 的 `done` 插件，可用于在任何一个动画插件后进行回调。

- 参数：

  |参   数|类    型|必    填|说    明|
  |---|---|---|---|
  |fn|Function|是|回调函数|

- 返回值：

  |类    型|说    明|
  |---|---|
  |Object|返回当前 naboo 实例|

- 用法：

  ```javascript
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

### register

- 描述：

  Naboo 的静态方法：插件注册函数，如果animate不能满足需求，亦或是站长需要封装自己的插件来做到方便调用，可以通过该方式来进行方法注册。

- 参数：

  |参   数|类    型|必    填|说    明|
  |---|---|---|---|
  |name|string|是|动画插件名称|
  |fn|Function|是|插件函数，用于定义插件的执行逻辑|

- 返回值：

  无

- 用法：

  ```javascript
  Naboo.register('p', function (next) {
    let args = Array.prototype.slice.call(arguments, 1)
    let n = args.length
    args.forEach(naboo => naboo.start(() => (n-- === 0 && next())))
  })
  ```
  >注意：在实现register fn时需调用next()才能执行下一个动画。
