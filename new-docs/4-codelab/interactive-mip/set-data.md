# 修改数据

其实通过上一个小节，开发者已经初步接触到了 `setData` 这个方法了。顾名思义，这个方法就是用来设置/修改数据的。

这个方法挂在全局对象 MIP 下，接收一个对象作为参数。要设置的数据对象将按照层级被合并到总的数据源中，后设置的数据会覆盖前者（支持多层级的复杂对象的 deep 数据覆盖）。

## 注意
在前面 `初始化数据` 这一小节中曾提到：通过 `<mip-data>` 标签设置的数据要求符合标准的 JSON 格式。而 `setData` 方法虽然没有严格要求传 JSON 格式的对象，但是仅允许传 JSON 对象可以接受的数据，因此是不允许设置为 **function** 的。

## 示例

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

在这里我们沿用了上一小节的示例代码，从代码中可以看出，`setData` 方法既可以通过在 HTML 元素中加入事件来完成；也可以在自定义 JS 代码（通过组件或 <mip-script>）中直接调用 `setData` 方法。