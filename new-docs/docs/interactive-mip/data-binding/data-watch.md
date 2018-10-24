# MIP.watch 观察数据

MIP 提供了全局方法 `MIP.watch(value, cb)` 供开发者注册观察数据的行为。

其中 `value` 为数据源中的属性名，多层数据可以以 `.` 连接，允许是单个字符串或字符串数组。例如：

```javascript
MIP.watch('a.b.c', function (newValue) {
  /* DO SOMETHING */
});
```


`cb` 为当被观察的属性 value 发生数据变化时要执行的回调函数，接收一个参数，为 `newValue`，即 value 变化后的值。

观察数据的前提，是这个数据已经通过 `mip-data` 组件设置过。假如是通过 `mip-data` 的异步方式获取数据的，还需要等待异步数据设置完成。 MIP 提供全局变量 `mipDataPromises`，这是一个获取异步数据的 Promise 对象数组，如果当前没有获取异步数据的任务或任务已完成，则该数组为空。若该数组不为空，同时开发者需要观察的数据即为异步数据时，为确保观察正常执行，需要把 `MIP.watch` 的执行放到 Promise 的回调函数中。

**示例：**

在下面的例子中，定义了两个变量：count、type，count 用于统计按钮点击次数，type 用于记录当前的 count 是奇数还是偶数。我们通过 MIP.watch 方法监听 count 的变化，当 count 变化时，计算当前的 count 是奇数还是偶数，并将结果存到 type 中去。

```html
<!-- preview -->
<!-- preset
  <script src="https://c.mipcdn.com/static/v2/mip-script/mip-script.js"></script>
-->
<mip-data>
  <script type="application/json">
    {
      "count": 0,
      "type": "偶数"
    }
  </script>
</mip-data>

<p>当前按钮被点了 <span m-text="count"></span> 下，这个数是<strong m-text="type"></strong></p>
<button on="tap:MIP.setData({count: m.count + 1})">点击按钮</button>

<mip-script>
  MIP.watch('count', function (count) {
    MIP.setData({
      type: count % 2 === 0 ? '偶数' : '奇数'
    })
  })
</mip-script>
```

例子中使用到了 `mip-script` 想了解更多有关 mip-script 的知识，请阅读 [自定义 JS](../custom-js.md)
