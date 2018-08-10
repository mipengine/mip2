# mip-script 自定义 JS 代码

开发者可以在 `mip-script` 中编写自定义 JavaScript 代码来完成一些事情，使 MIP 页面交互更加灵活。

组件间通信是常见的需求，除了通过使用事件来实现组件通信之外，实际上，有一部分组件通信的需求是可以直接用数据来完成的，而这时候我们可以通过使用 `mip-script` 组件编写JS代码，监控某些数据的变化，再在数据变化回调中触发另一个数据的变化，从而完成数据通信的效果。

为给开发者提供思路，我们设想了若干场景：除了调用数据观察方法 `MIP.watch` 轻松实现组件间的通信，开发者还可以异步获取数据再通过数据修改方法 `MIP.setData` 来重新渲染页面、或在合适的时机发送业务日志等等，在规范允许的范围内都可以考虑使用 `mip-script` 编写自定义代码实现。

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本|https://c.mipcdn.com/static/v2/mip-script/mip-script.js

## 用法

用法与 `script` 标签类似，同样支持在 HTML 页面中直接嵌入脚本代码和通过异步请求获取脚本代码两种方式。

两种方式的规范和限制各不相同，请开发者仔细阅读。

### 内嵌脚本
用法上如同开发者熟悉的 `script` 标签一样，只需要在 `<mip-script></mip-script>` 内正常书写 JS 代码即可。如：

```html
<mip-script>
  console.log('mip-script executed')
</mip-script>
```

> **注意：** 内容大小不能超过 2KB，否则无法运行

### 异步脚本
**异步脚本放宽了大小限制，为 20KB**，同时也更方便开发者将代码拆分模块并复用。如果需要使用异步脚本，则需指定 `src` 地址，如：

```html
<mip-script src="https://www.example.org/script.js"></mip-script>
```

如果使用了 `src` 属性，那 `mip-script` 将自动忽略标签中的内容。

>**注意：**
> `src` 需要是 `https` 或 `//` 协议开头，否则在 HTTPS 环境下会无法正常加载

当使用异步脚本方式加载自定义 JS 代码时，请注意：**需要开发者服务端配置  CORS 跨站访问**，具体步骤如下：

- 接收到请求后，判断请求头中的 `origin` 是否是允许的，其中需要允许的域名包括：`https://mipcache.bdstatic.com`、开发者的站点`origin` 、`https://站点域名转换的字符串.mipcdn.com` 。站点域名转换的字符串是指开发者的站点origin通过一定的规则（点.转换为中横线-）转换的字符串，如下面代码中的origins数组所示：origins[1]为开发者的站点origin，origins[2]为转换后的 origin；
- 如果 `origin` 在指定的列表中则设置 `response header` 中的 `Access-Control-Allow-Origin` 为请求接收到的 `origin`，以 Node.js 举例，如下所示：

```javascript
let origins = {
  'https://mipcache.bdstatic.com': 1,
  'https://www-mipengine-org.mipcdn.com': 1,
  'https://www.mipengine.org': 1
}
app.get('/script.js', function (req, res, next) {
  let ori = req.headers.origin
  if (origins[ori]) {
    res.header('Access-Control-Allow-Origin', ori)
  }
  next()
})
```


## 要求

### 全局变量限制使用
在 `mip-script` 中，只允许进行数据相关的操作，不允许直接操作 DOM 。
因此通过 `mip-script` 编写的 JS 代码将会运行在沙盒环境（严格模式）中，仅开放部分全局对象供开发者使用，非白名单内的对象的行为将不能正常执行。mip-script 组件中的沙盒会对开发者的JS代码进行全局变量的替换和检测。

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

可以看出，`console` 是安全的全局变量，可以正常使用；`window` 是受限制的全局变量，具体行为取决于 `MIP.sandbox.strict.window` 的开放程度（同理有 `document`）。

以上代码片段运行后，因为 `location` 的跳转以及 `document.getElementById` 都已被列为危险行为，相关全局变量或 API 不在白名单列表内，被沙盒禁止执行，因此运行时会报错，或在编译阶段就已经被替换成无效语句，无法正常执行。开发者需从源代码中删除此类语句。

`mip-script` 组件执行后，以 Chrome 浏览器为例，打开开发者工具，开发者可以在 Elements 面板中查看当前页面的组织结构，查找 DOM 节点树中有 class="mip-script" 属性信息的 script 节点，这类节点是 mip-script 编译后的执行结果，开发者可以通过其查看运行在沙盒环境中的 JS 代码，结合需求，来调整代码实现。

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

### src

说明：script 文件地址	

必选项：否 

格式：字符串

默认值：无

