# MIP Shell

## MIP Shell 简介

通过 MIP Page 将多个 MIP 页面融合到一起之后，在不同页面之间跳转可以获得如单页应用的效果。但在实际项目中，还可能有一些元素是独立于每个页面之外的（或者说每个页面都包含的内容），我们称之为外壳 (Shell)。在页面切换时，Shell 部分一般不跟随页面内容进行过场动画，因此最佳的做法是把他们提取到 `iframe` 之外独立渲染和更新。如果用Vue来描述的话，Shell 就是位于`<router-view>` 之外的部分。

一个最典型的 Shell 的例子就是头部标题栏：

![头部标题栏](http://boscdn.bpc.baidu.com/assets/mip2/page/mip-shell.png)

## 内置 MIP Shell

使用 MIP Shell 最简单直接的方式是直接使用内置的组件 `<mip-shell>`。开发者可以在 __每个页面中__ 使用这个标签来定义 Shell 的各项配置。内置的 `<mip-shell>` 仅提供头部标题栏，但通过 __继承内置 Shell__，开发者可以实现渲染其他部件，如底部菜单栏，侧边栏等等。(继承内置 Shell 的相关内容会在之后的部分进行讲述)

### 配置方法

在页面的 `<body>` 标签内编写 `<mip-shell>` 标签，写法如下：

使用 MIP Shell 时开发者需要在页面的 `<body>` 标签内编写 `<mip-shell>` 标签，并在标签内给出站点的 Shell 配置。总体的配置写法如下：

```html
<html>
    <head></head>
    <body>
        <mip-shell>
            <script type="application/json">
                {
                    key: value
                }
            </script>
        </mip-shell>

        <!-- mip script -->
    </body>
</html>
```

注意点：

1. 一个页面 __至多只允许存在一个__ `<mip-shell>` 配置项。可以不写则使用默认配置项。
2. `<mip-shell>` __必须__ 是 `<body>` 的 __直接子节点__。
3. `<mip-shell>` 内部只允许存在一个 `<script>` 节点，并且 `type` 必须设置为 `application/json`。
4. `<script>`内部是一个合法的 JSON 对象。

下面列出一些常见的错误配置示例，供开发者参考：

```html
<!-- 常见错误1：直接在mip-shell 标签中写 JSON -->
<body>
    <mip-shell>{key: value}</mip-shell>
</body>

<!-- 常见错误2：没有给 script 标签设置 type -->
<body>
    <mip-shell>
        <script>{key: value}</script>
    </mip-shell>
</body>

<!-- 常见错误3：mip-shell 嵌套在其他标签内部 -->
<body>
    <div class=”wrapper”>
        <mip-shell>
            <script type=”application/json”>{key: value}</script>
        </mip-shell>
    </div>
</body>

```

### 详细配置项

`<mip-shell>` 支持包含一个 **基于路由** 的，**全局性** 的配置对象。其中的 `routes` 存放了各个页面及其对应的配置对象，对应关系通过 `pattern` 描述。在各个页面切换时，会通过正则匹配页面 URL 和 `pattern`，应用对应的 Shell 配置。

> __为什么要在每个页面配置站点全局数据？__
>
> 主要是为了让页面切换的效果更佳顺畅。如果每个页面只配置当前页面的信息，那么在加载下一个页面时，因为下一个页面的 Shell 配置信息 （如头部是否显示，头部标题文字，LOGO 图片等等）都需要在 loading 结束之后才能获取。那么在 loading 结束切换到真实目标页面时可能会出现闪动，不太友好。

Shell 最基本的配置中必须包含 `routes` 数组。其中的每个元素以正则和配置两部分组成。URL 的正则匹配以从上到下的顺序，因此应当把匹配范围越大的正则写在越后面。Shell 配置的基本结构如下：

```json
{
    "routes": [
        {
            "pattern": "/index.html",
            "meta": {...}
        },
        {
            "pattern": "*",
            "meta": {...}
        }
    ]
}
```

这里有几个注意点：

* `*` 可以匹配所有 URL，建议放在 `routes` 数组的最后一项，作为整个站点的默认配置数据，例如默认标题和 LOGO 等等。
* `pattern` 虽然是字符串类型，但其内容实质是一个正则表达式。因此也可以写成 `"/\\w+detail$"` 用以匹配例如 `/detail`, `/productdetail` 这样的 URL。__注意 `\` 的转义__。

每个 `meta` 对象包括：

1. `view` 对象。用以配置整站的一些数据。__每个页面都应当包含相同的 `view` 配置__
2. `header` 对象。用以配置头部标题栏的各项内容

* view.isIndex
    __boolean__，默认值：`false`

    指明当前页面是否为首页。站点首页在头部标题栏左边不出现后退按钮。

* header.show
    __boolean__，默认值：`false`

    指明当前页面是否需要展现头部标题栏。

* header.bouncy
    __boolean__，默认值：`true`

    开启头部配合页面滚动方向进行展示隐藏效果

* header.title
    __string__, 默认值：当前页面 `<title>` 中的内容

    配置头部中间的标题，这部分将显示在头部标题栏中，超长会自动截断。

    ![MIP Shell header title](http://boscdn.bpc.baidu.com/assets/mip2/mip-title-2.png)

* header.logo
    __string__, 默认值：无

    配置头部左侧的 LOGO 的 URL，建议是一个正方形的图片，长宽不小于 64px。如果不配置则不显示 LOGO。

    ![MIP Shell header logo](http://boscdn.bpc.baidu.com/assets/mip2/mip-logo-2.png)

* header.color
    __string__, 默认值：'#000000'

    配置头部几个 svg 按钮和标题的字体颜色。必须是一个符合 RGB 格式的字符串。

* header.borderColor
    __string__, 默认值：'#e1e1e1'

    配置头部底部的边框，LOGO 的圆形边框和右侧按钮胶囊（如果显示的话）的边框颜色。必须是一个符合 RGB 格式的字符串。

* header.backgroundColor
    __string__, 默认值：'#ffffff'

    配置头部背景色。必须是一个符合 RGB 格式的字符串。

* header.buttonGroup
    __Array__, 默认值：`[]`

    配置头部右侧的按钮区域展开后展现的按钮及其文字，点击行为等。这个配置项是一个由对象组成的数组。

    右侧的关闭按钮在百度搜索结果页中会自动展现，单独打开时不展现，不需要额外配置。

    ![MIP Shell header button](http://boscdn.bpc.baidu.com/assets/mip2/mip-button-2.png)

    点开“更多”按钮，会出现浮层展现 `buttonGroup` 中配置的按钮，效果如下：

    ![Drop Down](http://boscdn.bpc.baidu.com/assets/mip2/page/dropdown-2.png)

    每一个配置对象由 3 个属性构成，分别是 `name`, `text` 和 `link`。这三个配置项均 __没有__ 默认值，如果缺少某个则被认为非法配置，__会被跳过而不进行渲染__。

    * name: __string__。__必填__。标识按钮的名字。在点击按钮后，会向 __当前页面__ 触发名为 `appheader:click-[name]` 的事件供其他组件监听并处理。例如当 `name` 为 `search` 时，事件名称为 `appheader:click-search`。__不能使用保留名字__，包括 `back`, `more` 和 `close`。

    * text: __string__。__必填__。标识按钮的显示文字。

    * link: __string__。__选填__。标识点击之后跳转页面的 URL。__只能跳往站内的 MIP 页面__，和 mip-link 的规范相同，取值范围：`https?://.*`, `mailto:.*`, `tel:.*`。如果不填，则点击后不跳转。__跳转不影响事件的触发，两者同时进行。__

    正确配置示例：

    ```json
    {
        "buttonGroup": [
            {
                "name": "search",
                "text": "search",
                "link": "https://somesite.com/mip/anotherMIPPage.html"
            }
        ]
    }
    ```

### 完整示例

```html
<mip-shell>
    <script type="application/json">
        {
            "routes": [
                {
                    "pattern": "/index.html",
                    "meta": {
                       "header": {
                            "show": true,
                            "title": "MIP Index",
                            "logo": "http://boscdn.bpc.baidu.com/assets/mip/codelab/shell/mashroom.jpg",
                            "buttonGroup": [
                                {
                                    "name": "subscribe",
                                    "text": "关注",
                                    "link": "https://somesite.com/anotherMIPPage.html"
                                },
                                {
                                    "name": "chat",
                                    "text": "发消息",
                                }
                            ]
                        },
                        "view": {
                            "isIndex": true
                        }
                    }
                },
                {
                    "pattern": "*",
                    "meta": {
                        "header": {
                            "show": true
                            "title": "Default Title"
                        }
                    }
                }
            ]
        }
    </script>
</mip-shell>
```

### 默认的 MIP Shell 配置

如果开发者没有在页面中编写 `<mip-shell>`，那么一套默认配置会被应用。默认配置如下，效果是隐藏掉头部：

```json
{
    "routes": [
        {
            "pattern": "*",
            "meta": {
                "header": {
                    "show": false,
                    "title": "",
                    "logo": "",
                    "buttonGroup": []
                },
                "view": {
                    "isIndex": false
                }
            }
        }
    ]
};
```

### 头部标题的生效顺序

MIP 页面总共有 4 处可以配置头部标题，它们的生效顺序依次是：

1. `<a>` 链接中的 `data-title` 属性
2. `<mip-shell>` 中每个配置项的 `title` 属性
3. `<a>` 链接的 `innerHTML`
4. 目标页面的 `<title>`

举例来说，在 A 页面存在如下配置：

```html
<html>
    <head></head>
    <body>
        <mip-shell>
            <script type="application/json">
            {
                "routes": [
                    {
                        "pattern": "*",
                        "meta": {"header": {"title": "Set in meta"}}
                    }
                ]
            }
            </script>

            <a href="https://somesite.com/B.html" data-title="Set in data">Set in HTML</a>
        </mip-shell>
    </body>
</html>
```

那么在打开 B 页面时，
* B 页面的标题(包括 loading 页面) 将会是 `"Set in data"`。
* 如果没有设置 `data-title`，那么标题将是 `"Set in meta"`。
* 如果 `data-title` 和 `<mip-shell>` 均没有设置，那么标题将是 `"Set in HTML"`。
* 最后，如果都没有设置，将从 `<title>` 中读取，__但 loading 页面将不会展现标题__。

## 个性化 Shell

如果您的站点有一些特殊的需求，官方内置的 MIP Shell 无法满足需求，那么您可以需要个性化 Shell，即自己实现一个类 (class) 继承 MIP Shell。

这里列举几个比较常见的通过个性化 Shell 可以实现的需求，供大家参考：

* 对于默认的头部标题栏样式或者 DOM 结构不满意，有修改的需求。

* 除了头部，还有底部栏或者侧边栏需要额外渲染和绑定事件。例如下图：

    ![Bottom Shell](http://boscdn.bpc.baidu.com/assets/mip2/page/bottom-shell-2.png)

* 开发者需要控制站点的 Shell 配置，修改/禁用/忽略某些选项。

    例如开发者希望忽略 HTML 中的配置项而固定选择某些按钮，或者希望在配置之外增加某些按钮等。

### 继承方式

全局的 MIP 对象会暴露一个 MIP Shell 基类供大家继承。例如我们要创建一个 MIP Shell Example 组件，我们可以写如下代码：

```javascript
export default class MIPShellExample extends window.MIP.builtinComponents.MIPShell {
    // Functions go here
}
```

类名使用驼峰命名，组件平台会自动把驼峰转化为符合 HTML 规范的短划线连接形式，如 `<mip-shell-example>`。

个性化 Shell 的编写规范和普通组件相同，同样在 mip2-extensions 项目中编写，如下：

![MIP Shell Folder](http://boscdn.bpc.baidu.com/assets/mip/page/mip-shell-folder.PNG)

### 使用个性化 Shell

个性化 Shell 的使用和内置的 MIP Shell 基本类似。唯一的区别是为标签增加一个属性 `mip-shell`，例子如下：

```html
<mip-shell-example mip-shell>
    <script type="application/json">
        {
            "routes": [
                {
                    "pattern": "*",
                    "meta": {
                       "header": {
                            "show": true,
                            "title": "MIP Index",
                            "logo": "http://boscdn.bpc.baidu.com/assets/mip/codelab/shell/mashroom.jpg"
                        },
                    }
                }
            ],
            "exampleUserId": 1
        }
    </script>
</mip-shell>
```

可以看到这个例子中在 `routes` 平级增加了一个 `exampleUserId`，将会在后续继承父类方法中使用到。个性化 Shell 就可以通过传入自定义数据来处理额外的逻辑。

### 供子类继承的方法列表

#### constructor

构造函数中有两个属性可以被子类修改，他们分别是：

* __alwaysReadConfigOnLoad__, 默认值 `true`
    因为每个页面都有全部的配置，因此在页面切换时，目标页面的配置同时存在于当前页面和目标页面两处（正常情况下两处配置应该相同）。这个属性可以控制以哪一份配置为准。

    如果确认每个页面的配置是严格相同的，或者为了性能考虑，则应该使用 `false`，从而保证只有第一次读入配置，后续均不读取。反之如果需要每次均读取覆盖，则应该使用 `true`。

* __transitionContainsHeader__, 默认值 `true`
    默认的页面切换动画会连同头部一起进行侧向滑动。如果这个值设置为 `false`，则头部不参与侧滑动画，转而使用 fade (渐隐渐现) 效果取代。

开发者可以在构造函数中修改这两个属性，也可以初始化自己之后将要使用的其他属性和变量。__注意在初始化时，必须要调用 `super` 并且带上参数__，如下：

```javascript
constructor (...args) {
  super(...args)

  this.alwaysReadConfigOnLoad = false
  this.transitionContainsHeader = false
}
```

#### showHeaderCloseButton

* __参数__： 无。
* __返回值__：__boolean__，默认 `true`。

MIP Shell 的头部标题栏右侧的按钮区域会根据 MIP 页面当前所处的状态来决定是否展示关闭按钮。当处于百度搜索结果页中（即拥有 SuperFrame 环境时）会额外渲染一个关闭按钮，点击效果用以通知 SuperFrame 关闭自身，如下图所示：

![Close Button](http://boscdn.bpc.baidu.com/assets/mip2/page/close-button.png)

MIP 页面判断当前是否处于 SuperFrame 环境的判断依据是 `window.MIP.standalone` 值等于 `false`。

如果开发者有特殊需求，要求即便在 `window.MIP.standalone === false` 成立时依然 __不展现__ 关闭按钮，可以继承这个方法并返回 `false`。这个方法在 `standalone` 的判断 __之后__ 生效，因此即便它返回 `true`，只要 `standalone` 也为 `true` 则关闭按钮依然不展现。

```javascript
showHeaderCloseButton () {
  if (location.href.indexOf('main') !== -1) {
      return true;
  } else {
      return false;
  }
}
```

#### handleShellCustomButton

* __参数__：`buttonName`, __string__, 按钮配置时的 `name` 属性。
* __返回值__：无。

MIP Shell 的头部标题栏上所有的按钮（如默认的后退，关闭，更多以及用户配置的 `buttonGroup`）在点击时都会调用这个方法。

虽然默认的后退(`back`)， 关闭(`close`)和更多(`more`)按钮已有其对应的处理方法（如点击更多展现浮层，点击后退路由后退等），但开发者依然可以在这里接到这些值，以添加可能存在的额外操作。

在 `buttonGroup` 配置时，每一个按钮均有一个 `name` 属性，这个 `name` 属性也会当做参数传入这个方法。

```javascript
handleShellCustomButton (buttonName) {
  if (buttonName === 'back') {
    // 默认头部已经包含 name 为 back 的按钮，并已有默认处理（路由后退）
    // 如果需要，这里可以再进行一些额外的处理
    console.log('click on back')
  } else if (buttonName === 'about') {
    // 假设 HTML 中配置了 name 为 about 的按钮，这里定义它的响应
    console.log('click on about')
    // 实际上跳转页面可以通过在 buttonGroup 中的 link 属性进行配置。这里仅仅是做一个示例
    window.MIP.viewer.open('./about.html')
  }
}
```

特别地，在 MIP Shell 基类逻辑中还定义了一个名为 `cancel` 的按钮的点击响应，作用是关闭更多按钮的浮层。因此如果开发者在 `buttonGroup` 中配置了名为 `cancel` 的按钮，可以不必自行实现关闭浮层的响应即可获得相同的效果。

#### processShellConfig

* __参数__：`shellConfig`, __Object__, 经过处理的 Shell 配置对象。
* __返回值__：无。

Shell 子类通过这个方法对 MIP Shell 初步处理后的配置对象进行修改，再进行后续的渲染和绑定，从而可以对 HTML 中的配置进行统一的操作。

MIP Shell 进行的所谓“初步处理”包括：

1. 读取 HTML 中对应标签内的 JSON，并通过 `JSON.parse()` 进行转义。
2. 遍历 `routes` 数组的每个元素，进行如下操作：
    1. 获取 `meta` 值，和默认 `meta` 进行合并并写会。HTML 中的 `meta` 优先级更高。
    2. 获取 `pattern` 值，将字符串转化为正则表达式（采用 `new RegExp()` 进行转化）。特别的，`'*'` 被转化为 `/.*/` 以匹配任意字符
    3. 如果无法获取到 `route.meta.header.title` 的值，则从当前页面的 `<title>` 标签获取。

在这些操作之后，MIP Shell 将 __整个 JSON 对象__ 当做参数传递给开发者（不单单是 `routes` 数组）。开发者可以在 `processShellConfig` 方法内对参数进行修改，不必返回。这里还分为同步和异步两种情况。

* 同步修改

  即方法内容不涉及异步操作，直接对参数进行修改即可。示例如下：

  ```javascript
  processShellConfig(shellConfig) {
    // 强制清空 HTML 中的按钮配置
    shellConfig.routes.forEach(route => route.buttonGroup = [])
  }
  ```

* 异步修改

  即方法中还包含异步操作。这时通常需要先给 `shellConfig` 设置一个默认值（也可以以 HTML 中的配置当做默认值，则跳过此步），然后进行异步操作（例如发送请求）。在操作获取到结果之后，修改 `shellConfig` 之后调用 `this.updateShellConfig()` 和 `this.refreshShell()` 分别更新缓存和页面 DOM。如下示例会使用到之前配置过的 `exampleUserId`：

  ```javascript
  processShellConfig (shellConfig) {
    // 设置默认值
    shellConfig.routes.forEach(routeConfig => {
      routeConfig.meta.header.title = '极速服务'
      routeConfig.meta.header.logo = 'https://www.baidu.com/favicon.ico'
    })

    // 获取 HTML 配置好的 exampleUserId
    let isId = shellConfig.exampleUserId
    // 使用 setTimeout 模拟异步发送请求
    setTimeout(() => {
      // 通过 exampleUserId 获取到目标用户的标题和 LOGO，并固定按钮
      shellConfig.routes[0].meta.header.title = '蓝犀牛搬家'
      shellConfig.routes[0].meta.header.logo = 'http://boscdn.bpc.baidu.com/assets/mip2/lanxiniu/logo.png'
      shellConfig.routes[0].meta.header.buttonGroup = [
        {
          name: 'share',
          text: '分享'
        },
        {
          name: 'indexPage',
          text: '首页'
        },
        {
          name: 'about',
          text: '关于蓝犀牛'
        },
        {
          name: 'cancel',
          text: '取消'
        }
      ]
      shellConfig.routes[1].meta.header.title = '红犀牛搬家'

      // 异步操作，需要更新 Shell 配置缓存
      this.updateShellConfig(shellConfig)

      // 异步操作，需要更新页面上的 Shell DOM
      // window.MIP.viewer.page.pageId 表示当前页面的 pageId，由 MIP Shell 负责更新
      this.refreshShell({pageId: window.MIP.viewer.page.pageId})
    }, 1000)
  }

  ```

#### renderOtherParts

* __参数__：无。
* __返回值__：无。

默认的 MIP Shell 只渲染头部标题栏。如果开发者希望渲染其他部分（如底部菜单栏），可以通过继承 `renderOtherParts` 方法来实现。

这个方法没有参数，但可以通过获取 `this.currentPageMeta` 来获取当前页面的 `meta` 信息（即 MIP Shell 所有配置中匹配当前页面的 `meta`，其中包括当前页面的标题，LOGO，按钮等所有信息）。

需要注意的是，如果需要创建 `position: fixed` 的 DOM 元素（如底部菜单栏），应当使用 `<mip-fixed>` 作为标签名，而非其他如 `<div>` 等 HTML 标准标签。这主要是为了解决 iOS 的 iframe 中 fixed 元素滚动抖动的 BUG。

```javascript
renderOtherParts () {
  this.$footerWrapper = document.createElement('mip-fixed')
  this.$footerWrapper.setAttribute('type', 'bottom')
  this.$footerWrapper.classList.add('mip-shell-footer-wrapper')

  this.$footer = document.createElement('div')
  this.$footer.classList.add('mip-shell-footer', 'mip-border', 'mip-border-top')
  this.$footer.innerHTML = this.renderFooter()

  this.$footerWrapper.appendChild(this.$footer)
  document.body.appendChild(this.$footerWrapper)
}

renderFooter() {
  let pageMeta = this.currentPageMeta
  return 'hello ${pageMeta.header.title}!'
}
```

建议把 `this.renderFooter()` 抽象成一个单独的方法，因为这个方法也会在后面 update 时被调用。

#### updateOtherParts

* __参数__：无。
* __返回值__：无。

MIP 页面首次进入时会调用 `renderOtherParts()` 方法进行初始渲染。而后续切换页面时，MIP Page 会将目标页面的 `meta` 信息设置为 `this.currentPageMeta` 并调用 `updateOtherParts()` 方法以更新自定义部件。

在 `updateOtherParts()` 方法中，开发者仅需要更新 HTML 即可，不需要像 `renderOtherParts()` 那样创建 DOM 并插入到页面中。也因此，将 `renderFooter()` 独立出来有利于这里继续调用。示例如下：

```javascript
updateOtherParts() {
    this.$footer.innerHTML = this.renderFooter()
}
```

#### beforeSwitchPage

* __参数__：`options`, __Object__, 路由切换时的配置项。
  * `targetPageId`, __string__, 目标页面的 `pageId`
  * `targetPageMeta`, __Object__, 目标页面的 `pageMeta`，结构和 `<mip-shell>` 中的 `meta` 对象相同
  * `sourcePageId`, __string__, 当前页面的 `pageId`
  * `sourcePageMeta`, __Object__, 当前页面的 `pageMeta`，结构和 `<mip-shell>` 中的 `meta` 对象相同
  * `newPage`, __boolean__, 是否需要创建 iframe
  * `isForward`, __boolean__, 动画是否为前进方向
* __返回值__：无。

MIP 在页面切换之前，会调用此方法。如果子类需要在动画之前进行一些操作（例如加入自己的动画元素），可以继承并实现这个方法。示例如下：

```javascript
beforeSwitchPage(options) {
  // 固定动画切换方向为前进方向
  options.isForward = true
}
```

#### afterSwitchPage

* __参数__：`options`, __Object__, 路由切换时的配置项。
  * `targetPageId`, __string__, 目标页面的 `pageId`
  * `targetPageMeta`, __Object__, 目标页面的 `pageMeta`，结构和 `<mip-shell>` 中的 `meta` 对象相同
  * `sourcePageId`, __string__, 当前页面的 `pageId`
  * `sourcePageMeta`, __Object__, 当前页面的 `pageMeta`，结构和 `<mip-shell>` 中的 `meta` 对象相同
  * `newPage`, __boolean__, 是否需要创建 iframe
  * `isForward`, __boolean__, 动画是否为前进方向
* __返回值__：无。

MIP 在页面切换之后，会调用此方法。如果子类需要在动画之后进行一些操作（例如要通知一些消息），可以继承并实现这个方法。示例如下：

```javascript
afterSwitchPage(options) {
  // 向所有页面广播页面切换事件，并给出切换前后的 pageId
  let {sourcePageId, targetPageId} = options
  window.MIP.viewer.page.broadcastCustomEvent({
      name: 'switchPageComplete',
      data: {
          targetPageId,
          sourcePageId
      }
  })
}
```

#### switchPage

* __参数__：`options`, __Object__, 路由切换时的配置项。
  * `targetPageId`, __string__, 目标页面的 `pageId`
  * `targetPageMeta`, __Object__, 目标页面的 `pageMeta`，结构和 `<mip-shell>` 中的 `meta` 对象相同
  * `sourcePageId`, __string__, 当前页面的 `pageId`
  * `sourcePageMeta`, __Object__, 当前页面的 `pageMeta`，结构和 `<mip-shell>` 中的 `meta` 对象相同
  * `newPage`, __boolean__, 是否需要创建 iframe
  * `isForward`, __boolean__, 动画是否为前进方向
  * `onComplete`, __Function__, 动画完成后的回调函数
* __返回值__：无。

MIP Shell 基类的动画切换逻辑实现方法。但子类如有需要也可继承修改，__非必须情况尽量不要继承。__

在 `switchPage` 内部还根据动画的方向，是否创建 iframe，是否要跳过动画区分为6个细分方法。子类也可以继承其中的某一个或几个，来实现对动画的精确控制。

在介绍具体方法前，先明晰3组概念：

1. 是否需要动画
  如点击浏览器的前进后退，没有动画效果；点击链接和头部的后退按钮，有动画效果。

2. 是否创建 iframe
  点击链接打开新页面时（或者直接调用 `viewer.open` 时）会创建 iframe 并把新页面放入其中。而浏览器的前进后退时不创建 iframe，只调用已有的 iframe 展现。

3. 动画方向
  这里的动画方向并不是视觉上的从左到右还是从右到左，而是指逻辑上的方向，分前进/后退。
  只是在默认情况下，前进采用目标页面从右到左进入屏幕的方式；后退等价于当前页面向右侧退出屏幕，目标页面出现在下方的方式。

* 不需要动画时

    | 创建 iframe | 不创建 iframe |
    | --- | --- |
    | skipTransitionAndCreate(options) | skipTransition(optios) |

* 需要动画时

    | | 创建 iframe | 不创建 iframe |
    | --- | --- | --- |
    | 前进 | forwardTransitionAndCreate(options) | forwardTransition(optios) |
    | 后退 | backwardTransitionAndCreate(options) | backwardTransition(optios) |

和 `switchPage` 一样，这些方法关系到整个全站 MIP 的页面切换逻辑，非常重要，因此 __非必须情况尽量不要继承。__

### 个性化 Shell 实例

这里列出两个个性化 Shell 的实例（均为实际线上代码，但隐去了敏感信息和复杂的业务逻辑）

#### 极速服务 Shell

命名为 `<mip-shell-is>`，主要工作有：

1. 增加额外的 `isId` 配置项
2. 根据 `isId` 通过接口 __异步__ 获取站点的标题，LOGO 和按钮配置
3. 为添加的按钮增加点击响应
4. 因为涉及异步获取站点 `meta` 信息，因此首屏请求之后不再重复获取信息

* mip-shell-is.js

    ```javascript
    export default class MIPShellIS extends window.MIP.builtinComponents.MIPShell {
      constructor (...args) {
        super(...args)

        this.alwaysReadConfigOnLoad = false
        this.transitionContainsHeader = false
      }

      processShellConfig (shellConfig) {
        // 设置默认属性
        shellConfig.routes.forEach(routeConfig => {
          routeConfig.meta.header.title = '极速服务'
          routeConfig.meta.header.logo = 'https://www.baidu.com/favicon.ico'
          routeConfig.meta.header.bouncy = false
        })

        let isId = shellConfig.isId
        console.log('Simulate async request with isId:', isId)
        setTimeout(() => {
          shellConfig.routes[0].meta.header.title = '蓝犀牛搬家'
          shellConfig.routes[0].meta.header.logo = 'http://boscdn.bpc.baidu.com/assets/mip2/lanxiniu/logo.png'
          shellConfig.routes[0].meta.header.buttonGroup = [
            {
              name: 'share',
              text: '分享'
            },
            {
              name: 'indexPage',
              text: '首页'
            },
            {
              name: 'about',
              text: '关于蓝犀牛'
            },
            {
              name: 'cancel',
              text: '取消'
            }
          ]
          shellConfig.routes[1].meta.header.title = '红犀牛搬家'

          this.updateShellConfig(shellConfig)

          this.refreshShell({pageId: window.MIP.viewer.page.pageId})
        }, 1000)
      }

      handleShellCustomButton (buttonName) {
        if (buttonName === 'share') {
          console.log('click on share')
          this.toggleDropdown(false)
        } else if (buttonName === 'indexPage') {
          console.log('click on indexPage')
          this.toggleDropdown(false)
        } else if (buttonName === 'about') {
          console.log('click on about')
          this.toggleDropdown(false)
        }
      }
    }
    ```

* mip-shell-is.html

    只列出 `<body>` 部分。

    ```html
    <body>
        <mip-shell-is mip-shell>
            <script type="application/json">
            {
                "routes": [
                    {
                        "pattern": "*",
                        "meta": {
                            "header": {
                                "show": true
                            }
                        }
                    }
                ],
                "isId": 123
            }
            </script>
        </mip-shell-is>

        <p>This is MIP SHELL IS</p>

        <a class="link" href="./mip-shell-is-2.html" mip-link>Go to MIP SHELL IS 2</a>
        <div id="button">By viewer.open</div>

        <script src="../../dist/mip.js"></script>
        <script src="./components/mip-shell-is.js"></script>
    </body>
    ```

#### 百度小说 Shell

命名为 `<mip-shell-novel>`，主要工作有：

1. 增加额外的 `catalog` 配置项用以记录小说目录
2. 额外渲染底部菜单栏
3. 为底部菜单栏绑定点击事件，并提供解绑函数
4. 每个页面都包含目录信息，为性能考虑，只读取第一个页面的信息。

* mip-shell-novel.js

    ```javascript
    export default class MIPShellNovel extends window.MIP.builtinComponents.MIPShell {
      constructor (...args) {
        super(...args)

        this.alwaysReadConfigOnLoad = false
        this.transitionContainsHeader = false
      }

      processShellConfig (shellConfig) {
        this.catalog = shellConfig.catalog
      }

      renderOtherParts () {
        this.$footerWrapper = document.createElement('mip-fixed')
        this.$footerWrapper.setAttribute('type', 'bottom')
        this.$footerWrapper.classList.add('mip-shell-footer-wrapper')

        this.$footer = document.createElement('div')
        this.$footer.classList.add('mip-shell-footer', 'mip-border', 'mip-border-top')
        this.$footer.innerHTML = this.renderFooter()
        this.$footerWrapper.appendChild(this.$footer)

        document.body.appendChild(this.$footerWrapper)
      }

      updateOtherParts () {
        this.$footer.innerHTML = this.renderFooter()
      }

      renderFooter () {
        let pageMeta = this.currentPageMeta
        let {buttonGroup} = pageMeta.footer
        let renderFooterButtonGroup = buttonGroup => buttonGroup.map(buttonConfig => `
          <div class="button" mip-footer-btn data-button-name="${buttonConfig.name}">${buttonConfig.text}</div>
        `).join('')

        let footerHTML = `
          <div class="upper mip-border mip-border-bottom">
            <div class="switch switch-left" mip-footer-btn data-button-name="previous">&lt;上一章</div>
            <div class="switch switch-right" mip-footer-btn data-button-name="next">下一章&gt;</div>
          </div>
          <div class="button-wrapper">
            ${renderFooterButtonGroup(buttonGroup)}
          </div>
        `

        return footerHTML
      }

      bindHeaderEvents () {
        super.bindHeaderEvents()

        let me = this
        let event = window.MIP.util.event

        // 代理底部菜单栏的点击事件
        this.footEventHandler = event.delegate(this.$footerWrapper, '[mip-footer-btn]', 'click', function (e) {
          let buttonName = this.dataset.buttonName
          me.handleFooterButton(buttonName)
        })

        if (this.$buttonMask) {
          this.$buttonMask.onclick = () => {
            this.toggleDropdown(false)
            this.toggleDOM(this.$footerWrapper, false, {transitionName: 'slide'})
          }
        }
      }

      unbindHeaderEvents () {
        super.unbindHeaderEvents()

        if (this.footEventHandler) {
          this.footEventHandler()
          this.footEventHandler = undefined
        }
      }

      handleShellCustomButton (buttonName) {
        if (buttonName === 'share') {
          console.log('share')
          this.toggleDropdown(false)
        } else if (buttonName === 'setting') {
          this.toggleDOM(this.$buttonWrapper, false, {transitionName: 'slide'})
          this.toggleDOM(this.$footerWrapper, true, {transitionName: 'slide'})
        }
      }

      handleFooterButton (buttonName) {
        console.log('click on footer:', buttonName)
        this.toggleDOM(this.$buttonMask, false)
        this.toggleDOM(this.$footerWrapper, false, {transitionName: 'slide'})
      }
    }
    ```

* mip-shell-novel.html

    只列出 `<body>` 部分。

    ```html
    <body>
        <h2>第1章  灵魂重生</h2>

        <p>“贱人，你竟敢背叛我！”</p>

        <p>“宋凌云，你这个畜生，我视你如手足，当你如兄弟，是我亲手把你培育成无双战神，可你竟然与那贱人勾搭成奸，还要置我于死路，我做鬼都不会放过你。” </p>

        <p>陆宇猛然睁开眼睛，一下子坐起，双眼之中充满了愤怒与杀气，拳头握得死紧！ </p>

        <p>“不对，这是哪里？我明明在黑狱中灰飞烟灭，怎么可能还未死？” </p>

        <p>“难道说，我重生了？” </p>

        <p>陌生的环境让陆宇迅速清醒，过往的记忆逐一呈现在脑海里。 </p>

        <p>陆宇原本是神武天域的圣魂天师，开创了史无前例的武魂进化之术，将一个不起眼的辅助职业魂天师推到了巅峰极境，成为了神武天域有史以来第一个圣帝级魂天师，简称圣魂天师！ </p>

        <p>那是至高荣誉，堪称魂天师领域的万古第一人。 </p>

        <p>然而就在陆宇最风光，最得意，站在人生巅峰之际，一场背叛彻底将他摧毁。 </p>

        <p>陆宇这一生有三大引以为傲的事情，貌美无双的娇妻，神勇无敌的兄弟，功成名就的事业，那是无数人都梦寐以求的东西，他都得到了，可他却没有猜到结局。 </p>

        <p>陆宇的成长并不顺利，但是开创武魂进化之术改变了他的一生，让他娶到了神武天域十大美女之一的马灵月为妻，曾羡煞无数人。 </p>

        <p>后来，陆宇又结识了宋凌云，两人肝胆相照，成为了好兄弟。 </p>

        <p>身为魂天师，陆宇致力于研究武魂进化之术，并在娇妻与兄弟身上耗费了半生精力。 </p>

        <p>原本，马灵月和宋凌云的武魂都只是地级三品以下，注定成就有限。 </p>

        <p>但是陆宇却利用自己独创的武魂进化之术，让两人的武魂等级从地级三品提升到了天级八品，一跃成为了神武天域的至强者。 </p>

        <mip-shell-novel mip-shell>
            <script type="application/json">
            {
                "routes": [
                    {
                        "pattern": "/novel-\\d",
                        "meta": {
                            "header": {
                            "show": true,
                            "title": "神武天帝",
                            "buttonGroup": [{
                                "name": "share",
                                "text": "分享"
                            },{
                                "name": "setting",
                                "text": "设置"
                            },{
                                "name": "cancel",
                                "text": "取消"
                            }]
                            },
                            "footer": {
                                "buttonGroup": [{
                                    "name": "catalog",
                                    "text": "目录"
                                },{
                                    "name": "night",
                                    "text": "夜间模式"
                                },{
                                    "name": "setting",
                                    "text": "设置"
                                }]
                            }
                        }
                    }
                ],
                "catalog": [
                    {
                        "name": "第1章 灵魂重生",
                        "link":"novel-1.html"
                    },
                    {
                        "name": "第2章 武魂提升",
                        "link":"novel-2.html"
                    },
                    {
                        "name": "第3章 牛刀小试",
                        "link":"novel-3.html"
                    },
                    {
                        "name": "第4章 笑里藏刀",
                        "link":"novel-4.html"
                    },
                    {
                        "name": "第5章 云月儿",
                        "link":"novel-5.html"
                    }
                ]
            }
            </script>
        </mip-shell-novel>

        <script src="../../dist/mip.js"></script>
        <script src="./components/mip-shell-novel.js"></script>
    </body>
    ```
