# mip-script 自定义 JS

MIP 提供了 `<mip-script>` 官方组件供开发者编写自定义的 JavaScript 代码（以下简称 JS）来完成一些事情，使 MIP 页面交互更加灵活。

组件间通信是常见的需求，在组件通信章节中我们介绍过如何使用事件来完成组件通信。实际上，有一部分组件通信的需求是可以直接用数据来完成的，而这时候我们可以通过使用 `<mip-script>` 组件编写JS代码，监控某些数据的变化，再在数据变化回调中触发另一个数据的变化，从而完成数据通信的效果。

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本|https://c.mipcdn.com/static/v2/mip-script/mip-script.js

## 用法

首先，开发者需要在 HTML 文件中引入 mip-script 组件代码。

基本用法上如同开发者熟悉的 `script` 标签一样，只需要在 `<mip-script></mip-script>` 内正常书写 JS 代码即可。如：

```html
<mip-script>
  console.log('mip-script executed')
</mip-script>
```

>注意：
>
>如前面 `MIP.watch` 小节所介绍，`MIP.watch` 方法依赖`mip-data` 的数据设置，因此假如在 `mip-script` 组件中编写 JS 代码调用 `MIP.watch` 方法观察数据，在 `mip-script` 组件中的 JS 代码会自动等待数据设置完成之后再执行。

## JS 代码要求

1. 内容大小不能超过 2KB，否则无法运行

2. 全局变量限制使用
在 `<mip-script>` 中，只允许进行数据相关的操作，不允许直接操作 DOM 。
因此在 `<mip-script>` 中写的 JS 代码将会运行在沙盒环境（严格模式）中，仅开放部分全局对象供开发者使用，非白名单内的对象的行为将不能正常执行。mip-script 组件中的沙盒会对开发者的JS代码进行全局变量的替换和检测。

白名单列表请参考：[严格模式的可用全局变量列表](
https://www.npmjs.com/package/mip-sandbox#%E4%B8%A5%E6%A0%BC%E6%A8%A1%E5%BC%8F%E4%B8%8B%E7%9A%84%E6%B2%99%E7%9B%92%E5%AE%89%E5%85%A8%E5%8F%98%E9%87%8F)

## 示例一
基础用法，例如：

开发者编写的 JS 代码：

```html
<mip-script>
  console.log('mip-script executed')
  console.log(document.cookie)
  window.location.href = '/'
  var ele = document.getElementById('test')
</mip-script>
```

运行时的 JS 代码（沙盒环境包裹）：

```html
<script class="mip-script">
  console.log('mip-script executed');
  console.log(MIP.sandbox.strict.document.cookie);
  MIP.sandbox.strict.window.location.href = '/';
  var ele = MIP.sandbox.strict.document.getElementById('test');
</script>
```

运行时的代码是经过沙盒处理后的代码，结合代码不难看出：
1. `console` 是安全的全局变量，可以正常使用；
2. `window` 是受限制的全局变量，具体行为取决于 `MIP.sandbox.strict.window` 的开放程度（同理有 `document`）。

以上代码片段运行后，因为 `location` 的跳转以及 `document.getElementById` 都已被列为危险行为，相关全局变量或 API 不在白名单列表内，被沙盒禁止执行，因此运行时会报错，或在编译阶段就已经被替换成无效语句，无法正常执行。开发者需从源代码中删除此类语句。

`mip-script` 组件执行后，以 Chrome 浏览器为例，打开开发者工具，开发者可以在 Elements 面板中查看当前页面的组织结构，查找 DOM 节点树中有 `class="mip-script"` 属性信息的 script 节点，这类节点是 mip-script 编译后的执行结果，开发者可以通过其查看运行在沙盒环境中的 JS 代码，结合需求，来调整代码实现。

## 示例二
通过 `mip-script` 编写 JS 代码，观察 price 的数据变化，从而触发 title 的更新。同时利用 fetch API 异步获取数据，更新页面

```html
<mip-data>
  <script type="application/json">
    {
      "price": 20,
      "title": "初始值 Price = 20",
      "userList": []
    }
  </script>
</mip-data>

<p m-text="title" class="header"></p>
    
输入数字，单击回车可改变 price 的值<br />（price = input.value * price）:
<input type='text' on="change:MIP.setData({price:DOM.value*m.price})">

<p class="header">以下是异步获取的数据列表：</p>
<ul>
  <li m-text="userList[0]"></li>
  <li m-text="userList[1]"></li>
  <li m-text="userList[2]"></li>
</ul>

<mip-script>
  console.log('mip-script executed')

  MIP.watch('price', (newVal, oldVal) => {
    MIP.setData({
      title: `price = ${newVal}`
    })
  })

  fetch('./list.json')
    .then(data => {
      return data.json()
    })
    .then(data => {
      MIP.setData({
        userList: data.userList
      })
    })  
    .catch(e => {
      console.error(e.message); 
    })
</mip-script>
```

## 属性

无
