# 绑定数据

MIP 提供两个内置指令（`m-bind` 和 `m-text`）供开发者用于绑定此前通过 `<mip-data>` 标签初始化的数据。

我们分别从以下两个示例来讲解这两个指令的用法。（下面例子中提及到的用于修改数据的方法 `setData` 我们将在该 codelab 的下一小节讲解）

## m-bind 指令

```html
<label for="input">
  输入数字 0-2 以切换图片:
  <input id="input" type='text' on="change:MIP.setData({no:DOM.value})">
</label>      
<mip-img m-bind:src="imgList[no]" width="100%" height="300px"></mip-img>
```
这个示例实现了这么一个功能：
把图片地址数据通过 `m-bind` 绑定到 mip-img 标签的 src 属性上。由于下标序号 `no` 初始值为 0，根据图片列表数据，此时 mip-img 的渲染结果为：

```html
<mip-img src="https://www.mipengine.org/static/img/sample_01.jpg" width="100%" height="300px"></mip-img>
```

并通过在输入框中输入 0-2 的数字，实时更改 `no` 这个下标序号，以实时更新绑定在 mip-img 标签上的 src 地址。

## m-text 指令

```html
<ul>
  <li on="tap:MIP.setData({tab: '娱乐'})">娱乐</li>
  <li on="tap:MIP.setData({tab: '体育'})">体育</li>
  <li on="tap:MIP.setData({tab: '新闻'})">新闻</li>
</ul>
<div m-text="loadingTip"  class="loading-tip"></div>
<mip-script>
  console.log('watched')
  MIP.watch('tab', function (newVal) {
    MIP.setData({
      loadingTip: `正在加载${newVal}频道的数据...`
    })
  })
</mip-script>
```

这个示例实现了这么一个功能：
把加载中的提示语 `loadingTip` 设置为 DIV 元素的 textContent。监听字段 `tab` 的数据变化，通过点击不同的 tab，触发更新 `loadingTip` 的值。