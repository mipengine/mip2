# MIP.util.fn

```javascript
MIP.util.fn
window.MIP.util.fn
```

## 描述

`MIP.util.fn` 提供了一些函数式的工具函数

## 方法

### throttle

- 参数：
  - {Function} fn 需要节流的函数
  - {number} delay 延迟时间，默认为 10ms
- 返回值：

    {Function}

    节流后的函数

- 用法：

  函数调用节流，控制函数在 delay 时间执行一次，调用多次会顺延，在响应一些 DOM 的事件时很有用，如 resize, touchmove 的回调

  ```javascript
  let fn = MIP.util.fn.throttle(function callback(event) {
    console.log('resize triggered')
  })
  window.addEventListener('resize', fn)
  ```

### values _[deprecated]_

- 参数：
  - {Object} obj
- 返回值：

  {Array}

  返回该 Object 的所有 value

- 用法：

  > info
  >
  > 请用 `Object.values` 代替

  获取 Object 的所有 value，和 `Object.values` 的效果一样

  ```javascript
  // 返回值为 [1, 2]
  MIP.util.fn.values({a: 1, b: 2})
  ```

### isPlainObject

- 参数：
  - {Object} obj
- 返回值：

  {boolean} 返回 object 是否为 plain object

- 用法：

  判断 object 是否为 plain object

  ```javascript
  // 返回 true
  MIP.util.fn.isPlainObject({a: 1})
  // 返回 false
  MIP.util.fn.isPlainObject(1)
  ```

### extend _[deprecated]_

- 参数：
  - {Object} target 目标 Object
  - {...Object} sources 源 Object
- 返回值：

  {Object} 返回目标 Object

- 用法：

  > info
  >
  > 请用 `Object.assign` 代替

  效果和 Object.assign 一样，把源 Object 的 key-value pairs 复制到目标 Object 中，优先级递增，如果 key 有重复，会进行覆盖

  此函数有副作用，目标 Object 会被修改

  ```javascript
  // 返回值为 {a: 2, b: 2}
  MIP.util.fn.extend({a: 1}, {a: 2, b: 2})
  ```

### pick

- 参数:
  - {Object} obj 目标 Object
  - {Array.\<string\>} 需要挑选的 keys
- 返回值：

  {Object.<string, *>}

  根据 keys 挑选出来的 key-value pairs 组成的新 Object

- 用法：

  从目标 Object 中根据 keys 数组挑选出一些值，组成新的 Object，并返回，此函数没有副作用

  ```javascript
  let source = {a: 1, b: 2, c: 3}
  // 返回值为 {a: 1, c: 3}
  MIP.util.fn.pick(source, ['a', 'c'])
  ```

### isString

- 参数：
  - {string} string
- 返回值：

  {boolean} 是否是 string

- 用法：

  判断 string 是否为字符串

  ```javascript
  // 返回 true
  MIP.util.fn.isString('aa')
  // 返回 false
  MIP.util.fn.isString(1)
  ```

### del

- 参数：
  - {Object} obj 目标 Object
  - {string} key 需要删除的属性
- 用法：

  从目标 Object 删除某个属性

  ```javascript
  let dest = {a: 1, b: 2}
  // dest 变为 {a: 1}
  MIP.util.fn.del(dest, 'b')
  ```

### hasTouch

- 返回值

  {boolean} 返回是否支持 touch 事件

- 用法：

  判断是否支持 touch 事件

  ```javascript
  // 如果是 PC 上，则为 false，如果是可触摸手机上，则为 true
  MIP.util.fn.hasTouch()
  ```

**isCacheUrl** _[deprecated]_

函数实现移到[util 入口中](./index.md)
