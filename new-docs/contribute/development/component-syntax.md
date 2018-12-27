# 组件写法

当我们在本地准备好 MIP 组件仓库（mip2-extensions 或 mip2-extensions-platform），并且在组件仓库里创建了符合 MIP 组件规范的组件目录结构之后，接下来我们将来学习如何编写一个组件。

## 创建 MIP 组件目录

以开发官方组件为例（mip2-extensions），首先需要在 `components` 目录下创建组件文件夹，假设开发的组件名为 `mip-example` 那么，需要在 `components` 目录下创建如下目录结构：

```
├── components
│   ├── mip-example
│   │   ├── README.md
│   │   ├── example
│   │   │   └── index.html
│   │   └── mip-example.js
```

其中文件夹名、组件入口文件需要与组件名同名，在这里都被命名为 `mip-example`。

## 创建一个 MIP 组件

接下来我们对 mip-example.js 文件进行编辑。

每一个 MIP 组件都是一个继承自 `MIP.CustomElement` 的类，并使用 `export default` 导出。一个简单的 MIP 组件是这样的：

```js
export default class MIPExample extends MIP.CustomElement {
  build () {
    let content = document.createElement('p')
    content.innerText = 'Hello World'
    this.element.appendChild(content)
  }
}
```

这样一个简单的 MIP 组件就开发完了，我们可以在 example/index.html 中添加如下内容：

```html
<!DOCTYPE html>
<html mip>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <title>MIP page</title>
    <link rel="canonical" href="对应的原页面地址">
    <link rel="stylesheet" href="https://c.mipcdn.com/static/v2/mip.css">
    <style mip-custom>
    /* 自定义样式 */
    </style>
  </head>
  <body>
    <mip-example></mip-example>
    <script src="https://c.mipcdn.com/static/v2/mip.js"></script>
    <script src="/mip-example/mip-example.js"></script>
  </body>
</html>
```

其中 `<script src="/mip-example/mip-example.js"></script>` 为引入开发模式下的 `mip-example` 组件，`<mip-example></mip-example>` 则是 `mip-example` 这个组件的使用方法，其它的内容都是属于 MIP 页面所必须的运行环境。

接下来，在命令行通过 `mip2 dev` 启动调试服务器（启动前可能需要在组件仓库根目录执行 `npm install` 安装依赖），启动完成后访问 `http://127.0.0.1:8111/components/mip-example/example/index.html` 即可查看对应的网页：

![hello world](https://gss0.baidu.com/9rkZbzqaKgQUohGko9WTAnF6hhy/assets/mip/docs/cli/mip2-hello-world-ac8ff645.png)

可以看到页面显示了 "Hello World" 这样的单词，这正是 `mip-example` 这个组件所生成显示的。

## 添加样式

MIP CLI 内置了一系列预处理器来方便开发者为组件开发样式，开发者可以选择使用 css、less、stylus 进行样式开发。以 less 为例，首先准备 index.less 样式文件，其内容如下：

```less
mip-example {
  p {
    color: red;
    text-align: center;
  }
}
```

然后在 mip-example.js 文件顶部通过 `import` 引入这个样式即可：

```js
import './index.less'

export default class MIPExample extends MIP.CustomElement {
  // ....
}
```

刷新网页，可以看到 "Hello World" 显示为红色，并且居中显示了：

![add style](https://gss0.baidu.com/9rkZbzqaKgQUohGko9WTAnF6hhy/assets/mip/docs/cli/mip2-hello-word-red-841deef3.png)

需要注意的是，在进行样式开发的时候，要求以 mip 组件标签名作为样式的作用域限制条件，比如使用 css 开发，上面的样式需要写成：

```css
mip-example p {
  color: red;
  text-align: center;
}
```

这属于 MIP 组件开发规范的要求，详情请参考 [MIP 组件开发规范](../getting-start/component-spec.md)

样式文件可以引入图片、字体文件等静态资源，详情请参考 [MIP 组件资源管理](./resources-management.md)

## 组件生命周期

前面 `mip-example` 在 `build` 这个生命周期里渲染出 `<p>Hello World</p>` 这个节点，关于组件生命周期的说明，在另一篇文章 [MIP 组件生命周期](../principle/instance-life-cycle.md) 有更详细的说明，在这里就不做赘述。组件开发者应该根据组件的功能，在最适合的生命周期钩子里完成功能初始化、资源加载、事件绑定、功能执行等等，只有充分理解了 MIP 组件的生命周期，才能够开发出性能最佳的组件。

## 属性获取

组件中通过 `this.element.getAttribute` 可以获取元素的属性。比如如下所示给 `mip-example` 传入 `name` 属性：

```html
<mip-example name="lilei"></mip-example>
```

那么可以通过以下方式拿到这个值：

```js
export default class MIPExample extends MIP.CustomElement {
  build () {
    let name = this.element.getAttribute('name')
    // ...
  }
}
```

这样我们就可以改造组件，将这个获取到的属性显示出来：

```js
import './index.less'

export default class MIPExample extends MIP.CustomElement {
  build () {
    let name = this.element.getAttribute('name')
    let content = document.createElement('p')
    content.innerText = 'Hello ' + name
    this.element.appendChild(content)
  }
}
```

刷新页面可以看到页面上显示了 "Hello lilei"：

![Hello LiLei](https://gss0.baidu.com/9rkZbzqaKgQUohGko9WTAnF6hhy/assets/mip/docs/cli/mip2-hello-lilei-78527e0f.png)

我们可以在 example/index.html 将属性值修改成别的内容进行调试。需要注意的是，通过 `this.element.getAttribute()` 方法拿到的属性类型都是字符串，开发者需要根据实际要求的数据类型手动进行转换。

## 响应数据更新

在上面这种获取属性的方式只有在主动调用 `this.element.getAttribute()` 时才能够获取最新的属性，如果需要时时监听属性变化的话，可以通过 Custom Element 提供的 observedAttributes 和 attributeChangedCallback 进行属性监听：

当 MIP 组件需要相应属性变更时，需要实现 `attributeChangedCallback`：

```js
import './index.less'

export default class MIPExample extends MIP.CustomElement {
  constructor (...args) {
    super(...args)
    this.content = document.createElement('p')
  }

  static get observedAttributes () {
    return ['name']
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (name === 'name') {
      this.content.innerText = 'Hello ' + newValue
    }
  }

  build () {
    let name = this.element.getAttribute('name')
    this.content.innerText = 'Hello ' + name
    this.element.appendChild(this.content)
  }
}
```

通过前面组件生命周期的学习我们知道 `constructor`、`attributeChangedCallback`、`build` 这三个生命周期钩子的执行顺序为 `constructor` -> `attributeChangedCallback` -> `build`，因此我们需要将 `this.content` 的初始化放到 `constructor` 里执行，这样在首次触发 `attributeChangedCallback` 时，才不会报 `this.content` 尚未定义的错误。

经过上述改造之后，只要动态修改 `name` 属性值，页面也将会立即同步显示对应的 Hello。

在上述代码中，`observedAttributes` 是一个只读的静态属性，定义了需要监听的属性名称列表，目前只监听了一个 `name` 属性。`attributeChangedCallback` 定义了监听的属性修改时的回调，回调方法的三个参数分别为：

- 属性名
- 旧值
- 新值

`attributeChangedCallback` 会在 `constructor` 和 `connectedCallback` 之间首次触发，这个首次触发的条件是初始化阶段已经定义好监听的属性，以 mip-example 为例，如果页面初始化时 mip-example 没有传入 name 属性：

```html
<mip-example other-props="123"></mip-example>
```

那么 `attributeChangedCallback` 是不会触发的。

组件初始化完成之后，只要 mip-example 的 name 属性一发生变化，都会触发一次 `attributeChangedCallback`。

## 事件触发

MIP 组件在使用的时候允许通过 on 语法监听组件触发的事件，因此本小节介绍如何在组件内部触发事件。

MIP 提供了 `MIP.viewer.eventAction.execute()` 方法在组件内部触发事件，其语法如下所示：

```js
/**
 * 触发事件
 * @param {string} eventName 事件名称
 * @param {HTMLElement} element 触发的目标元素，注意：事件往递归的向上传播找到匹配 `on="eventName:xxx.xx` 并执行
 * @param {Object=} event 事件对象，原生的 Event 对象，如果没有事件对象可以为 {} 或不传 ，支持透传自定义参数，如：{userinfo: {}}
 */
MIP.viewer.eventAction.execute(eventName, element, event)
```

比如 mip-example 需要在组件 `build` 生命周期执行完之后触发一个事件 `done`，那么可以这么写：

```js
export default class MIPExample extends MIP.CustomElement {
  build () {
    // ....
    MIP.viewer.eventAction.execute('done', this.element)
  }
}
```

这样就可以通过 on 语法监听这个触发的事件 `done`：

```html
<mip-example on="done:btn.click"></mip-example>
```

我们也可以在触发事件的同时传出一些数据：

```js
MIP.viewer.eventAction.execute('done', this.element, {count: 1})
```

这个 `{count: 1}` 就是触发 `done` 事件时往外传的事件对象。

## 事件监听

组件内部也可以通过 `this.addEventAction()` 方法进行事件监听，其语法为：

```js
mipCustomElement.addEventAction(actionName, function (event, str) {

})
```

其中 actionName 为要监听的事件，回调函数里 event 为触发事件的事件对象，str 为触发事件时所传入的参数，即括号内的全部字符串内容。举个例子说明，假设 example/index.html 准备了两个标签：

```html
<button on="tap:example.say(你好)">点我</button>
<mip-example id="example" name="lilei"></mip-example>
```

那么我们可以在 build 生命周期中注册监听 `say` 事件：

```js
import './index.less'

export default class MIPExample extends MIP.CustomElement {
  build () {
    let name = this.element.getAttribute('name')
    let content = document.createElement('p')
    content.innerText = 'Hello ' + name
    this.element.appendChild(content)

    // 在这里注册 say 事件的监听
    this.addEventAction('say', (event, str) => {
      content.innerText = str
    })
  }
}
```

这样在点击了页面上的按钮之后，页面上将显示 "你好"。

![nihao](https://gss0.baidu.com/9rkZbzqaKgQUohGko9WTAnF6hhy/assets/mip/docs/cli/mip2-nihao-a51cc751.png)

如果 `on="tap:example.say('你', '好')"`，那么点击按钮后页面上显示的则是 `'你', '好'`，即括号内的全部字符串内容，开发者可以根据实际组件的需求对这个字符串进行手动解析。

## 组件插槽

组件的实例通过 this.element 获取，因此组件标签对里面的内容可以通过 `this.element.children`、`this.element.childNodes` 或者是 `this.element.innerHTML` 等这些原生 HTMLElement 对象所提供的方法或属性来获取。同样的，我们也可以通过 `this.element.querySelector`、`this.element.querySelectorAll` 等原生方法去查询组件内部的节点。

以 `mip-example` 为例，可以通过如下方法获取特定节点：

```js
import './index.less'

export default class MIPExample extends MIP.CustomElement {
  build () {
    let p = document.createElement('p')
    p.classList.add('content')
    p.innerText = 'Hello World'
    this.element.appendChild(p)

    let contents = this.element.querySelectorAll('.content')
    contents.forEach((content, i) => {
      content.innerText = i + ' ' + content.innerText
    })
  }
}
```

在上面的例子中，首先在 `build` 生命周期阶段创建了一个 p 标签，并且 `class` 为 'content'，然后通过 `this.element.querySelectorAll` 获取 `this.element` 元素内部 `class` 为 content 的全部节点，并且对这些节点的内容添加了序号。

然后 example/index.html 改成这样：

```html
<mip-example>
  <div class="content">哈哈</div>
</mip-example>
```

在 `mip-example` 的标签对内部手动添加了一个 `class` 为 content 的 div 标签。刷新网页可以看到页面显示效果如下：

![](https://gss0.baidu.com/9rkZbzqaKgQUohGko9WTAnF6hhy/assets/mip/docs/cli/mip2-slot-22ec5732.png)

可以看到无论是 div 还是 p 标签里面的内容都被添加上了序号，因此开发者可以采用类似的方法来对组件内容进行调整操作。

## 小节

经过本章的学习基本上能够对 MIP 组件开发有了一定的认识，开发者可以根据提供的示例将他们复制下来到本地进行修改和测试加深理解，也可以继续阅读相关文档进行更深入的学习。

