# 数据绑定与数据驱动

MIP 提供了一套数据驱动的机制来提升交互能力，有过 Vue/React 开发经验的同学对这套机制应该不会陌生。

首先举一个简单的例子来演示数据绑定的效果，点击按钮：

```html
<!-- 定义数据 -->
<mip-data>
  <script type="application/json">
  {
    "count": 0
  }
  </script>
</mip-data>

<p>
当前按钮点击了：

<!-- 定义数据绑定 -->
<span m-text="count">0</span>
次

<!-- 定义点击事件触发 -->
<button on="tap:MIP.setData({ count: count + 1 })">点击按钮</button>
</p>
```

其效果如下所示：

<div class="example-wrapper">
<!-- 定义数据 -->
<mip-data>
  <script type="application/json">
  {
    "count": 0
  }
  </script>
</mip-data>

<p>
当前按钮点击了：<span m-text="count">0</span> 次

  <!-- 定义点击事件触发 -->
  <button class="example-button" on="tap:MIP.setData({ count: count + 1 })">点击按钮</button>
</p>

</div>

这就演示了一个最简单的数据驱动全流程。

MIP 数据驱动机制主要包含了以下三个部分：

1. 数据定义：通过 `<mip-data>` 标签块实现对数据的初始化定义;
2. 数据修改：通过 `MIP.setData()` 方法实现对定义数据的运算和修改；
3. 数据绑定：通过 `m-bind:`、`m-text` 等绑定表达式实现对标签属性和文本的绑定；

在本文后续的内容当中，将分别对这三块内容进行介绍。

## 数据定义

需要进行各种数据操作之前，首先需要在 `<mip-data>` 定义数据的初始值。页面可以定义多个 `<mip-data>`，不同的数据块在各自的数据源解析加载完成后，自动合并到同一个 store 当中，因此应该尽量避免字段重复的情况。

数据定义有两种方式，同步数据和异步数据。

### 同步数据

同步数据需要在 `<mip-data>` 内定义 `<script type="application/json">` 数据块，这些数据块需要符合 `JSON` 所要求的数据格式，只包括 String、Number、Object、Array、null，而 Date、RegExp、Function、undefined 这些都是不允许的。如：

```html
<mip-data>
  <script type="application/json">
  {
    "name": "张三",
    "age": 25,
    "job": {
      "desc": "互联网从业者",
      "location": "北京"
    }
  }
  </script>
</mip-data>
```

### 异步数据

可以在 `<mip-data>` 定义 `src` 属性去指定异步加载的数据源，请求链接需要满足三个条件：

1. 支持 HTTPS;
2. 服务端配置 CORS 跨站访问许可；
3. 支持 GET 请求；
4. 返回的数据格式必须是 `JSON` 格式；

这是因为 MIP 页面被 MIP-Cache 抓取缓存之后，被缓存的页面会以 MIP CDN 的 URL，这个 URL 是 HTTPS 的，因此要求发送的请求也同样需要 HTTPS。（仅当使用 127.0.0.1 的本地接口进行调试时可使用 HTTP），同时在这种情况下的资源请求必然存在跨域，因此需要服务端配置 [CORS 跨站访问许可](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)。

```html
<mip-data src="https://path/to/your/data"></mip-data>
```

控制异步数据加载的属性还包括：

1. `credentials`: `{string}` [fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch) 的 credentials 参数，默认值为 `omit`；
2. `timeout`: `{number}` 请求超时的时长，单位是 ms（毫秒），默认为 `5000`；

例如：

```html
<mip-data
  src="https://path/to/your/data"
  credentials="include"
  timeout=3000
></mip-data>
```

当数据加载失败时（数据格式错误、超时、请求 404 等等），会抛出 `fetch-error` 事件，可以通过 `on` 表达式进行事件监听：

```html
<mip-data
  src="https://path/to/your/404/data"
  on="fetch-error:MIP.setData({ msg: '数据加载出错' })"
></mip-data>

<!-- 打印错误提示 -->
<p m-text="msg"></p>
```

同时在配置了 `src` 属性的情况下，`<mip-data>` 还支持 `refresh` 方法对数据进行重新加载，重新加载的数据会根据前面提到的合并规则与原数据进行合并：

```html
<mip-data 
  id="userInfo"
  src="https://path/to/your/data"
></mip-data>

<button on="tap:userInfo.refresh">点击刷新</button>
```

### 范围数据

`<mip-data>` 支持定义范围数据，具体做法是配置 `id` 和 `scope` 属性进行范围声明。其中 `id` 是用来标识数据的命名空间，`scope` 是用来声明

```html
<mip-data id="userInfo" scope>
  <script type="application/json">
  {
    "name": "Li,Lei"
  }
  </script>
</mip-data>
```

这样，这个 `<mip-data>` 数据块的内容将会全部放到 `userInfo` 字段下面。比如在数据绑定表达式里面，就可以通过 `userInfo.name` 获取数据：

```html
<span m-text="'你好，' + userInfo.name"></span>
```

[notice] `<mip-data>` 的 `id` 属性应该与变量命名要求保持一致，推荐采用驼峰命名法。比如中横线命名、中文命名的 id 将会导致数据无法通过数据绑定表达式获取。


## 数据修改

MIP 提供了 `MIP.setData` 方法进行数据修改。`MIP.setData` 传入的参数同样要求是个 `Object`，因此会遵循同样的数据合并规则与原数据进行合并：

```html
<mip-data id="userInfo" scope>
  <script type="application/json">
  {
    "name": "Li,Lei",
    "from": "Shanghai"
  }
  </script>
</mip-data>

<button on="tap:MIP.setData({
  userInfo: {
    name: 'Han,MeiMei'
  },
  age: 18
})">点我</button>
```

最终得到的数据为：

```js
{
  userInfo: {
    name: 'Han,MeiMei',
    from: 'Shanghai'
  },
  age: 18
}
```

可以在 `MIP.setData()` 表达式区域通过属性运算符（`.` 点运算符、`['xxx']` 计算属性）进行数据访问：

```html
<button
  on="tap:MIP.setData({
    text1: userInfo.name,
    text2: userInfo['from']
  })"
>点我</button>
```

`MIP.setData` 支持写少量的表达式来进行数据运算，比如：

```html
<button
  on="tap:MIP.setData({
    wellcome: 'Hello ' + userInfo.name,
    firstName: userInfo.name.split(',')[0],
    lastName: userInfo.name.slice(userInfo.name.indexOf(','))
  })"
>点我</button>
```

更具体的表达式说明，清参考 [表达式](./expression.md) 小节进行学习。

## 数据绑定

通过数据绑定表达式，可以将数据作用到 HTML 元素节点上，从而实现数据驱动视图。数据绑定同样支持写少量的表达式进行数据运算，请参考 [表达式](./expression.md) 小节进行学习。

[info] 数据绑定的定位是 MIP 交互机制的扩展，负责响应用户进行页面交互行为。从性能和搜索抓取的角度考虑，定义了数据绑定的节点应该同时定义好对应属性的默认值。

```html
<!-- 绑定文字的同时，应定义好初始值 "Li,Lei" -->
<span m-text="userInfo.name">Li,Lei</span>

<!-- 绑定 a 链的 href 需定义好默认的 href -->
<a m-bind:href="reactive.link" href="https://www.baidu.com"></a>
```

### m-text 绑定文字

前面的各种例子当中都有使用到 `m-text` 属性进行演示，其作用是将节点的 innerText 与数据进行绑定，这样就可以通过操作数据来修改节点显示的文案了：

```html
<!-- 普通绑定 -->
<p m-text="userInfo.name">Li,Lei</p>

<!-- 绑定表达式 -->
<p m-text="'您好，' + userInfo.name">您好，Li,Lei</p>

<!-- 点击修改数据测试绑定效果 -->
<button on="tap:MIP.setData({ userInfo: { name: '韩梅梅' } })">修改</button>
```

效果如下所示：

<mip-data id="userInfo" scope>
  <script type="application/json">
  {
    "name": "李雷"
  }
  </script>
</mip-data>

<div class="example-wrapper">
  <p m-text="userInfo.name">Li,Lei</p>
  <p m-text="'您好，' + userInfo.name">您好，Li,Lei</p>
  <button class="example-button" on="tap:MIP.setData({ userInfo: { name: '韩梅梅' } })">点击修改</button>
</div>

### m-bind 绑定属性

通过 `m-bind` 前缀可以声明属性的数据绑定，比如 `m-bind:href`，这些属性的更改会根据不同节点和属性的作用，表现出不同的功能。

```html
<mip-data id="testBind" scope>
  <script type="application/json">
  {
    "link": "https://www.baidu.com",
    "name": "百度首页"
  }
  </script>
</mip-data>

<!-- 原先的 a 链接默认点击跳转百度首页 -->
<a
  m-bind:href="testBind.link"
  href="https://www.baidu.com"
  target="_blank"
  m-text="'点击跳转至' + testBind.name"
>点击跳转至百度首页</a>
<!-- 点击下方按钮之后，将变成点击跳转 mipengine.org -->
<button on="tap:MIP.setData({
  testBind: {
    link: 'https://www.mipengine.org',
    name: 'MIP 官网首页'
  }
})">点击更换 href</button>
```

效果如下所示：

<mip-data id="testBind" scope>
  <script type="application/json">
  {
    "link": "https@@//www@baidu@com",
    "name": "百度首页"
  }
  </script>
</mip-data>

<div class="example-wrapper">
  <!-- 原先的 a 链接默认点击跳转百度首页 -->
  <a
    m-bind:href="testBind.link"
    href="https://www.baidu.com"
    target="_blank"
    m-text="'点击跳转至' + testBind.name"
  >点击跳转至百度首页</a>
  <!-- 点击下方按钮之后，将变成点击跳转 mipengine.org -->
  <button class="example-button"
    on="tap:MIP.setData({
      testBind: {
        link: 'https://www.mipengine.org',
        name: 'MIP 官网首页'
      }
    })"
  >点击更换 href</button>
</div>

这类属性绑定除了可以作用在普通的 HTML 元素之外，还可以作用到 MIP 组件上，可以查阅[相关组件文档](https://www.mipengine.org/v2/components/index.html)，查看对应组件的哪些属性支持数据绑定。

下面的例子演示了修改 MIP 组件 `mip-img` 图片 src 的效果：

```html
<mip-data>
  <script type="application/json">
  {
    "imgSrc": "https://www.mipengine.org/static/img/sample_01.jpg"
  }
  </script>
</mip-data>

<mip-img m-bind:src="imgSrc" src="https://www.mipengine.org/static/img/sample_01.jpg"></mip-img>

<button on="tap:MIP.setData({ imgSrc: 'https://boscdn.baidu.com/v1/assets/mipengine/logo.jpeg' })">点击更换图片</button>
```

效果如下所示：

<mip-data>
  <script type="application/json">
  {
    "imgSrc": "https@@//www@mipengine@org/static/img/sample_01@jpg"
  }
  </script>
</mip-data>

<div class="example-wrapper">
  <mip-img
    height="263"
    layout="fixed-height"
    m-bind:src="imgSrc" src="https://www.mipengine.org/static/img/sample_01.jpg"></mip-img>
  <div class="example-button-wrapper">
    <button class="example-button" on="tap:MIP.setData({ imgSrc: 'https://boscdn.baidu.com/v1/assets/mipengine/logo.jpeg' })">点击更换图片</button>
  </div>
</div>

### m-bind:class 绑定 class

class 属性绑定语法跟 [Vue](https://cn.vuejs.org/v2/guide/class-and-style.html) 类似,通过对象语法和数组语法进行 class 绑定，绑定 class 只会影响到 m-bind:class 表达式当中声明的 class，其他未声明的将不受影响：

当使用对象语法的时候，只要对象的值为真（`!!obj === true`），对应的属性名就会写入节点的 class 当中。

```html
<!-- 对象语法, 支持简单运算 -->
<div m-bind:class="{
    'example-active': isActive,
    'info-example-wrapper': type === 'info',
    'warn-example-wrapper': type === 'warn',
    'error-example-wrapper': type === 'error'
  }"
  class="example-basic"
>对象语法</div>

<!-- 也可以直接将 object 直接绑定到 class 上 -->
<div m-bind:class="classObject">对象语法</div>
```

```html
<!-- 数组语法，支持简单运算 -->
<div
  m-bind:class="[{ 'example-active': isActive }, type + '-example-wrapper']"
  class="example-basic"
>数组语法</div>
```

效果都是一样的：

<style>
.example-basic {
  display: inline-block;
  font-size: 18px;
  padding: 6px 12px;
}
.example-active {
  background: blue;
}
.info-example-wrapper {
  color: green;
}
.warn-example-wrapper {
  color: orange;
}
.error-example-wrapper {
  color: red;
}
</style>

<div class="example-wrapper">
  <!-- 对象语法, 支持简单运算 -->
  <div
    m-bind:class="{
      'example-active': isActive,
      'info-example-wrapper': type === 'info',
      'warn-example-wrapper': type === 'warn',
      'error-example-wrapper': type === 'error'
    }"
    class="example-basic"
  >对象语法</div>

  <!-- 数组语法，支持简单运算 -->
  <div
    m-bind:class="[{ 'example-active': isActive }, type + '-example-wrapper']"
    class="example-basic"
  >数组语法</div>

  <div>
    <button class="example-button" on="tap:MIP.setData({
      isActive: !isActive
    })">切换 active</button>

    <button class="example-button" on="tap:MIP.setData({
      type: 'info'
    })">切换 info</button>

    <button class="example-button" on="tap:MIP.setData({
      type: 'warn'
    })">切换 warn</button>

    <button class="example-button" on="tap:MIP.setData({
      type: 'error'
    })">切换 error</button>
  </div>
</div>



### m-bind:style 绑定 style

[info] 一般情况下不推荐使用 style 绑定，请使用 class 绑定替代。只有当 class 绑定无法满足条件时，再使用 style 绑定。

style 绑定与 class 绑定类似，同样支持对象语法和数组语法：

```html
<mip-data>
  <script type="application/json">
  {
    "clickCount": 0
  }
  </script>
</mip-data>

<!-- 对象语法 -->
<div
  class="example-block"
  m-bind:style="{
    transform: 'translateX(' + (clickCount % 4 / 4) * 100 + '%)'
  }"
></div>
<!-- 点击触发 div 位置移动 -->
<button
  on="tap:MIP.setData({ clickCount: clickCount + 1 })" m-text="'点了 ' + clickCount + ' 下'"
></div>
```

效果如下所示：

<mip-data>
  <script type="application/json">
  {
    "clickCount": 0
  }
  </script>
</mip-data>

<style>
.example-block {
  width: 100px;
  height: 100px;
  background: #999;
  transition: .3s all;
}
.example-button-wrapper {
  margin-top: 15px;
}
</style>

<div class="example-wrapper">
  <!-- 对象语法 -->
  <div
    class="example-block"
    m-bind:style="{
      transform: 'translateX(' + (clickCount % 4 / 4) * 100 + '%)'
    }"
  ></div>

  <div class="example-button-wrapper">
    <!-- 点击触发 div 位置移动 -->
    <button
      class="example-button"
      on="tap:MIP.setData({ clickCount: clickCount + 1 })" 
      m-text="'点了 ' + clickCount + ' 下'"
    >点了 0 下</button>
  </div>
</div>

数组语法也一样，会首先将列表中多个对象合并后，再计算出对应的样式：

```html
<!-- 数组语法 -->
<div m-bind:style="[styleObj1, styleObj2]"></div>
```

### m-bind:value 绑定 value

当绑定表达式绑到了表单元素的 `value` 属性上的时候，将自动获得双向绑定的能力，操作数据能影响表单元素的 value，填写表单，则会自动更新对应绑定的数据。

[info] 表单元素（input、textarea、select）的主要作用是表单提交，因此现有的 MIP 校验规则里面，表单元素必须包含在 `<mip-form>` 组件内部。

```html
<mip-data>
  <script type="application/json">
  {
    "bindingText": "初始文字"
  }
  </script>
</mip-data>

<p m-text="'当前输入内容：' + bindingText">当前输入内容：初始文字</p>

<!-- 绑定表单元素 value，注意表单元素需要 mip-form 包起来 -->
<mip-form url="https://www.mipengine.org/api">
  <input m-bind:value="bindintText" type="text">
</mip-form>

<!-- 点击按钮操控数据 -->
<button on="tap:MIP.setData({ bindingText: '' })">点击清空</button>
```

效果如下所示：

<mip-data>
  <script type="application/json">
  {
    "bindingText": "初始文字"
  }
  </script>
</mip-data>

<div class="example-wrapper">
  <p m-text="'当前输入内容：' + bindingText">当前输入内容：初始文字</p>
  <!-- 绑定表单元素 value，注意表单元素需要 mip-form 包起来 -->
  <mip-form url="https://www.mipengine.org/api">
    <input class="example-input" m-bind:value="bindingText" type="text">
  </mip-form>

  <button class="example-button" on="tap:MIP.setData({ bindingText: '' })">点击清空</button>
</div>

