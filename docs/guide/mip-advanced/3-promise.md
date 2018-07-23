# Promise 在 MIP 中的使用

Promise 是 JavaScript 中的一种异步编程范式，一个 Promise 对象表示一个即将完成但还未完成的操作。鉴于 JavaScript 中异步和回调的编程风格，Promise 模式可以有效地避免 Callback Hell，增加代码的可读性和可维护性。MIP 同样提供了 Promise Polyfill，开发者可以在 MIP 组件开发过程中进行使用。

## 初始化

通过 `new Promise()` 创建一个 Promise 对象，如下所示。

```js
let padmin = new Promise(function(resolve, reject){
  user.find({role: 'admin'}, function(err, admins){
    if(err) {
      reject(err)
    } else {
      resolve(admins)
    }
  })
})
```

除此之外，ES6 还给出 4 种常用的初始化方式，下列方法均返回一个 Promise 对象，如下表所示。

方    法 | 说    明
---|---
`Promise.all(iterable)` | 当 iterable(比如数组)中所有 Promise 都 resolve 时，该 Promise resolve；iterable 中任何一个被reject，则该 Promise 被reject
`Promise.race(iterable)` | 当 iterable 中任意一个 Promise 被 resolve 或 reject，该 Promise 都会相应地结束
`Promise.reject(err)` | 直接返回一个被 reject 的 Promise 对象
`Promise.resolve(value)` | 直接返回一个被 resolve 的 Promise 对象

## Promise 对象

Promise 对象拥有两个主要方法，`catch()` 和 `then()`，如下表所示。


方    法 | 说    明
---|---
`Promise.prototype.catch(onRejected)` | 当一个 Promise 被 reject 时调用 onRejected
`Promise.prototype.then(onFulfilled, onRejected)` | 当一个 Promise 被 resolve 时调用 onFulfilled，被 reject 时调用onRejected

上述两个方法均返回一个 Promise，这意味着 `.then()` 和 `.catch()` 可以链式书写，如下面代码所示。

```js
padmin
  .then(function(admins){
    doSthWith(admins)
  })
  .catch(function(err){
    console.error(err)
  })
```

## 统一错误处理

在任何一个 `.then()` 回调中抛出的错误都会被后面的 `.catch()` 所截获，因此可以做统一的对 Promise 错误处理，如下面代码所示。

```js
padmin
  .then(function(admins){
    if(admins === null) throw new Error('query admin error')
    return admins.length
  })
  .then(function(length){
    if(length === 0) throw new Error('empty admin list')
    console.log(length + ' admins in total.')
  })
  .catch(function(err){
    console.error(err)
  })
```

## Promise 回调的执行

### onFulfilled 是异步的

根据 PerformPromiseThen 算法，调用 `.then()` 时会将 `onFulfilled`、`onRejected` 两个回调作为新的 Job 传入 `EnqueueJob (queueName, job, arguments)` 中。即通过 `.then()` 传入的回调是异步执行的。例如：

```js
console.log('before .then call')
Promise.resolve('onFulfilled called').then(console.log)
console.log('after .then call')
```

输出为：

```bash
before .then call
after .then call
onFulfilled called
```

### 构造 executor 是同步的

传入 `new Promise()` 的回调会立即执行，是同步的。例如：

```js
console.log('before constructor call')
new Promise(() => console.log('executor called'))
console.log('after constructor call')
```

输出为：

```bash
before constructor call
executor called
after constructor call
```

本节介绍了 Promise 的基本使用方式，在 MIP 中同样支持 Promise 的功能和用法，开发者可以遵循 Promise 提供的功能函数进行 MIP 组件开发。
