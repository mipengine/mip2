# MIP 自定义 JS 代码

MIP 的事件机制和数据驱动机制基本已经满足了大部分的交互需求，但在一些复杂的需求下面，单单依靠简单的 MIP 表达式无法进行更为复杂的计算，因此引入 [mip-script](https://www.mipengine.org/v2/components/dynamic-content/mip-script.html) 组件来扩充 MIP 表达式的计算能力。

[info] 本篇仅简要介绍了 mip-script 与 mip-data，有关 mip-script 的详细用法、属性说明等内容，请查看 [mip-script 的组件说明](https://www.mipengine.org/v2/components/dynamic-content/mip-script.html)。

## mip-script 适用场景

mip-script 提供的 JS 的能力同样也是受限制的，这是因为 mip-script 组件对的定位就是数据运算，只能够通过数据驱动机制发挥作用，不允许直接操作 DOM，因此 mip-script 所开放的 JS 能力也只与计算相关：

1. 全部的 ES5 语法支持，包括 var、if、for、switch 等等，这些与计算强相关因此都是支持的。ES6 及以上的语法请自行转换成 ES5 以避免造成兼容性问题；
2. fetch 方法支持，mip-script 允许开发者通过 fetch 发送请求自行获取或提交数据；
3. Promise 方法支持；
4. 环境变量的只读权限，比如 location、screenX、innerHeight 等等；
5. 数据的持久化存储支持，比如允许操作 cookie，提供 MIP.util.customStorage 等等；
6. 大部分计算相关的全局函数支持，如 encodeURIComponent、atob 等等；

这些限制的实现由 mip-sandbox 提供，请阅读 [mip-sandbox 严格模式](https://www.npmjs.com/package/mip-sandbox#%E4%B8%A5%E6%A0%BC%E6%A8%A1%E5%BC%8F) 获取完整的说明。

## mip-script 联动 mip-data

mip-script 通过 MIP.watch、MIP.getData、MIP.setData 方法来实现与 mip-data 的联动。

- MIP.watch

首先通过 MIP.watch 观察变更的数据，比如：

```html
<mip-script>
  MIP.watch('a.b.c', function (newVal, oldVal) {
    // 打印新值
    console.log(newVal)
    // 数据读取
    var result = MIP.getData('c.d')
    // 判断
    if (newVal !== result) {
      // 写入数据
      MIP.setData({
        c: { d: newVal }
      })
    }
  })
</mip-script>
```

MIP.watch 的第一个参数为要观察的数据的描述，目前仅支持**点运算符**的描述形式；第二个参数为数据变更时的回调，这样我们就能够在回调里面进行计算、发请求，等等；

[notice] 在写 MIP.watch 的监听函数时应注意避免修改数据的死循环逻辑，即监听的数据回调进行数据修改，并重新触发了数据回调。

- MIP.getData

mip-script 通过 MIP.getData 来访问数据，与 MIP.watch 一样，仅支持点运算符的描述形式：

```html
<mip-script>
  var data = MIP.getData('a.b.c')
  console.log(data['d'].e.f)
</mip-script>
```

- MIP.setData

这里的 MIP.setData 与 MIP 表达式当中的 MIP.setData 是一样的，是修改 mip-data 的唯一方法。

[notice] 在 mip-script 使用 MIP.setData 修改数组数据时，必须保证新旧数组的内存地址不同。

```html
<mip-data>
  <script type="application/json">
  {
    "list": [1, 2, 3]
  }
  </script>
</mip-data>
<mip-script>
  // 对原数组的 push/pop/splice/sort 操作不会触发数据变化
  var list = MIP.getData('list')
  // 不会触发任何数据绑定和数据监听
  list.push(4)
  // 同样不会触发任何数据绑定和数据监听
  MIP.setData({ list: list })

  // 只有传入新数组才会触发
  MIP.setData({
    list: list.slice()
  })
</mip-script>
```

## mip-script 发送请求

mip-script 允许使用 fetch，因此具有发送请求的能力。目前 MIP 提供的具有发送请求能力的组件包括：

1. mip-data
2. mip-form
3. mip-script

其中 mip-data 适用于加载远程的状态数据，mip-form 适用于提交用户填写的表单，mip-script 适用于向服务端发送一些非用户表单型的数据，比如点击次数统计信息、客户端信息等等数据。

```html
<mip-data>
  <script type="application/json">
  {
    "count": 0
  }
  </script>
</mip-data>
<button on="tap:MIP.setData({ count: count + 1 })">点击一下</button>
<mip-script>
  // 统计页面打开前 1 分钟内用户点击了按钮次数
  setTimeout(function () {
    fetch('https://www.mipengine.org/count?num=' + MIP.getData('count'))
      .then(function () {
        console.log('统计发送成功！')
      })
  }, 60 * 1000)
</mip-script>
```


