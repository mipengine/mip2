# 请优先使用 MIP 现有机制和官方组件来实现业务功能

通常的前端业务代码的功能需求大概包含以下几个方面：

1. 异步请求数据；
2. 异步渲染节点；
3. 操作节点的样式、内容；
4. 监听事件并触发行为；
5. 异步传输数据；

MIP 目前已经提供了相当完善的机制来覆盖上述功能，因此在绝大部分业务场景下，都可以优先使用 MIP 现有机制和组件来实现。

## 异步请求数据

MIP 提供了三种方式来实现异步数据的请求：

1. [mip-data](https://www.mipengine.org/v2/components/dynamic-content/mip-bind.html)
2. [mip-list](https://www.mipengine.org/v2/components/dynamic-content/mip-list.html)
3. [mip-script](https://www.mipengine.org/v2/components/dynamic-content/mip-script.html)

### mip-data 加载异步数据

其中优先使用 mip-data，其使用方法如下所示：

```html
<mip-data
  src="https://path/to/your/api"
></mip-data>
```

加载到的数据可以通过 HTML 节点数据绑定、`MIP.getData()` 等方式驱获取数据。假设上面的例子当中后端接口返回的数据为：

```json
{
  "a": 1,
  "b": 2,
  "c": [3, 4, 5, 6]
}
```

那么可以通过 [m-bind 表达式](https://www.mipengine.org/v2/docs/interactive-mip/data-binding/mip-bind.html) 将相应的数据展示出来：

```html
<div m-bind:class="{ active: a === 1 }" m-text="'当前 c 的值为：[' + c.join(',') + ']' "></div>
```

这样数据加载完成之后，就能够变成：

```html
<div class="active">当前 c 的值为：[3,4,5,6]</div>
```

通过 `MIP.setData()` 方法进行 mip-data 数据操作可以时时修改相应的绑定结果，比如结合 [on 表达式](https://www.mipengine.org/v2/docs/interactive-mip/event-and-action.html)，我们可以举例实现点击按钮时触发上述 div 的 class：

```html
<button on="tap:MIP.setData({ a: a === 1 ? 0 : 1 })" >点击</button>
```

在上述例子中每点击一次按钮，都会触发数据 `a` 数值在 0 和 1 之间相互切换，上述 div 也会因此不停地添加或删除 class `active`：

```html
<!-- a === 0 -->
<div class="">当前 c 的值为：[3,4,5,6]</div>
```

```html
<!-- a === 1 -->
<div class="active">当前 c 的值为：[3,4,5,6]</div>
```

### mip-list 加载异步数据

mip-list 主要用于异步加载数据后前端渲染节点，目前支持的功能包括：

1. mip-list 组件首次加载时通过 src 属性请求列表首屏数据，并渲染节点；
2. 支持通过 `.more` 事件触发加载分页数据并持续加载列表；
3. 仅支持 JSONP 格式的请求方式；

对于需要异步请求首屏数据并前端渲染节点的这类需求，可以考虑利用 mip-list 来实现这一功能：

```html
<mip-list
  src="https://path/to/your/jsonp/api"
>
  <template>
  <div class="wrapper">
    {{#show}}
    <header>{{content}}</header>
    {{/show}}
  </div>
  </template>
</mip-list>
```

假设后端返回的数据格式为：

```json
{
  "status": 0,
  "data": {
    "items": [
      {
        "show": true,
        "content": "Hello"
      },
      {
        "show": false,
        "content": "World"
      }
    ]
  }
}
```

那么 mip-list 加载完成时得到的 HTML 为：

```html
<mip-list>
  <div role="list">
    <div role="listitem">
      <div class="wrapper">
        <header>Hello</header>
      </div>
    </div>
    <div role="listitem">
      <div class="wrapper"></div>
    </div>
  </div>
</mip-list>
```

由此可以看到，mip-list 是具有一定的增删节点的能力的，因此可以利用 mip-list 来实现节点的增删功能。mip-list 的节点增删功能需要配合上 mip-data 才能够更好地发挥出来，相关功能我们正在开发当中：[mip-list 动态特性升级](https://github.com/mipengine/mip2-extensions/issues/675)。

### mip-script 异步加载数据

mip-script 为 MIP 提供了限制性的 JS 能力，可以读取数据、操作数据以及发送请求，一般配合 mip-data 的 MIP.setData/MIP.getData/MIP.watch 进行使用。下面的例子展示了当某项数据发生变化时发送请求：

```html
<mip-data>
  <script type="application/json">
  {
    "a": {
      "b": 1
    }
  }
  </script>
</mip-data>

<button on="tap:MIP.setData({ 
    a: { b: 2 }
  })"
>点我</button>

<mip-script>
MIP.watch('a.b', function (newVal, oldVal) {
  fetch('https://path/to/api?val=' + newVal)
    .then(function (res) {
      return res.json()
    })
    .then(function (data) {
      MIP.setData({
        newValue: data
      })
    })
})
</mip-script>
```

## 异步渲染节点

异步渲染节点目前可通过 mip-list 来实现。mip-list 接受一个数组对象作为数据源，当列表项数据长度为 1 时，mip-list 渲染结果自动退化为普通的 mustache 模板渲染。开发者可以通过定义 mustache 模板来定义异步渲染的节点效果。

在使用 mip-list 之前需要注意的是，当前的开发需求是否需要对节点进行增删操作。好的页面设计应该是定义好 MIP 页面的显示框架，然后异步请求数据进行填充。最佳的实践方式仍然是推荐使用 mip-data + m-bind 表达式来实现异步数据对页面的填充工作而非使用 mip-list 来进行节点增删。

## 操作节点的样式和内容

[m-bind 表达式](https://www.mipengine.org/v2/docs/interactive-mip/data-binding/mip-bind.html) 提供了：`m-bind:class`(推荐)、`m-bind:style` 来提供 mip-data 与节点样式的绑定，这样我们只需要在 on 表达式/mip-script 里面操作 mip-data，就能够实现节点的样式的增加/删除。

对于节点内容文本，我们提供了 m-text 表达式来实现文本计算和展示：

```html
<div
  m-bind:class="{ active: a === 1 }"
  m-text="'当前 c 的值为：[' + c.join(',') + ']' "
></div>
```

这样，通过 `MIP.setData()` 去非常方便地实现节点的样式和文本操作啦：

```js
MIP.setData({
  a: 2,
  c: [1,2,3,4,5]
})
```

## 事件的监听和触发

我们提供了 on 表达式来实现前端事件监听与触发，比如常见的点击事件，可以通过监听 tap 事件：

```html
<button
  on="tap:MIP.setData({ count: count == null ? 1 : count + 1  })"
  m-text="'当前点击次数为:' + count"
></button>
```

除了 `tap` `click` 表单元素的 `change` 事件之外，不同的 MIP 官方组件都会抛出一些自定义事件，我们都可以通过 on 表达式来进行事件的监听以及一些行为的处理。

比如 mip-date-countdown 提供了 `timeout` 实现定时；mip-position-observer 组件提供了一系列页面滚动事件的监听等等，大大拓展了 on 表达式的能力。

开发者可以利用 on 表达式实现某些组件的事件监听，在监听到事件发生时能够去触发其他组件的方法，或者是提供数据计算的能力，从而利用 m-bind 机制实现数据驱动。

上面已经演示过了 on 表达式与 mip-data 的联动过程，下面的例子展示如何在 on 表达式里触发其他组件的行为：

```html
<button on="tap:simple-text.show">点我展示文本</button>
<button on="tap:simple-text.hide">点我隐藏文本</button>

<p id="simple-text">文本</p>
```

## 异步数据传输

目前实现数据传输的方法包括：

1. [mip-form](https://www.mipengine.org/v2/components/dynamic-content/mip-form.html)（优先使用）
2. [mip-script](https://www.mipengine.org/v2/components/dynamic-content/mip-script.html)

### 基于 mip-form 实现异步数据传输

其中 mip-form 表单组件是用于传统的表单数据提交，用法和 `<form>` 差不多：

```html
<mip-form method="get" url="https://path/to/your/api">
  <input type="text" name="username">
  <input type="number" name="age">
  <input type="submit" value="提交">
</mip-form>
```

当然 mip-form 在 form 的基础上还增加了异步数据提交、表单数据前端校验等功能，在这里不做赘述，感兴趣的同学移步 [mip-form 的组件文档](https://www.mipengine.org/v2/components/dynamic-content/mip-form.html)。

我们还可以与 mip-data / mip-bind 通过 `m-bind:value` 同时监听 input 的 `input-debounced` 事件实现数据的双向绑定：

```html
<div m-text="'当前输入的名字为：' +  username"></div>
<mip-form method="get" url="https://path/to/api">
  <input type="text" name="username" m-bind:value="username"
  on="input-debounced:MIP.setData({ username: event.value })">
</mip-form>
```

mip-form 提供了 `.submit` 来实现 on 表达式控制表单的提交：

```html
<button on="tap:simple-form.submit()">点击提交</button>

<div m-text="'当前输入的名字为：' +  username"></div>
<mip-form id="simple-form" method="get" url="https://path/to/api">
  <input type="text" name="username" m-bind:value="username"
  on="input-debounced:MIP.setData({ username: event.value })">
</mip-form>
```

在这种 on 表达式控制表单提交的形式下，我们甚至可以将 mip-form 设置为隐藏 `layout="nodisplay"`，完全依靠 on 表达式和 bind 表达式来实现对 mip-form 的数据传输控制:

```html
<button on="tap:simple-form.submit()">点击提交</button>

<div m-text="'当前输入的名字为：' +  username"></div>
<mip-form id="simple-form" method="get" url="https://path/to/api"
layout="nodisplay">
  <input type="text" name="username" m-bind:value="username"
  on="input-debounced:MIP.setData({ username: event.value })">
</mip-form>
```

### 基于 mip-script 实现异步数据传输

由于 mip-script 能够使用 fetch/fetchJsonp，因此必然能够实现异步数据传输，这里就不再赘述了。但由于 mip-script 的体积较大，从性能的角度考虑，应该优先使用 mip-form 来实现数据提交。

## 总结

MIP 现有机制已经基本能够涵盖绝大部分的前端业务场景，并且提供了丰富的官方组件来进一步完善和提升 MIP 的功能和体验。因此在开发者提交第三方组件之前，请优先考虑这些功能是否已经有现成的机制或者组件实现了，这样将会大大降低第三方组件的开发和审核时间成本。

