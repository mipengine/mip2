# MIP.watch 观察数据

MIP 提供了全局方法 `MIP.watch(value, cb)` 供开发者注册观察数据的行为。

其中 `value` 为数据源中的属性名，多层数据可以以 `.` 连接，允许是单个字符串或字符串数组。
`cb` 为当被观察的属性 value 发生数据变化时要执行的回调函数，接收一个参数，为 `newValue`，即 value 变化后的值。

观察数据的前提，是这个数据已经通过 `mip-data` 组件设置过。假如是通过 `mip-data` 的异步方式获取数据的，还需要等待异步数据设置完成。 MIP 提供全局变量 `mipDataPromises`，这是一个获取异步数据的 Promise 对象数组，如果当前没有获取异步数据的任务或任务已完成，则该数组为空。若该数组不为空，同时开发者需要观察的数据即为异步数据时，为确保观察正常执行，需要把 `MIP.watch` 的执行放到 Promise 的回调函数中。

**示例：**

通过调用 `watch` 方法，监听 num 和 img.first 的数据变化，并在 num 变化时改变 img.first 的值，从而触发 title 的数据变化。

```html
<mip-data>
  <script type="application/json">
    {
      "num": 1,
      "title": "Initial num = 1",
      "img": {
        "first": ""
      }
    }
  </script>
</mip-data>
<p m-text="title"></p>
<div>
  num = DOM.value = <span m-text="num"></span>
</div>
<input type='text' on="change:MIP.setData({num:DOM.value})">
<mip-script >
  MIP.watch('num', newValue => {
    MIP.setData({
      img: {
          first: 'img.first changed due to num changed to' + newValue
        }
      })
    })
  MIP.watch('img.first', newVal => {
    MIP.setData({
      title: newVal
    })
  })
  MIP.watch(['num', 'img.first'], newVal => {
    console.log('multiple')
  })
</mip-script>
```
