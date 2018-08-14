# MIP Shell

开发者不能直接使用 MIP Shell 的方法，但可以通过继承的方式实现满足自身业务需求的“个性化 Shell”。

这里列举几个比较常见的通过个性化 Shell 可以实现的需求，供大家参考：

* 对于默认的头部标题栏样式或者 DOM 结构不满意，有修改的需求。

* 除了头部，还有底部栏或者侧边栏需要额外渲染和绑定事件。例如下图：

    ![Bottom Shell](https://boscdn.baidu.com/assets/mip2/page/bottom-shell-2.png)

* 开发者需要控制站点的 Shell 配置，修改/禁用/忽略某些选项。

    例如开发者希望忽略 HTML 中的配置项而固定选择某些按钮，或者希望在配置之外增加某些按钮等。

## 继承方式

全局的 MIP 对象会暴露一个 MIP Shell 基类供大家继承。例如我们要创建一个 MIP Shell Example 组件，我们可以写如下代码：

```javascript
export default class MIPShellExample extends window.MIP.builtinComponents.MIPShell {
    // Functions go here
}
```

类名使用驼峰命名，组件平台会自动把驼峰转化为符合 HTML 规范的短划线连接形式，如 `<mip-shell-example>`。

个性化 Shell 的编写规范和普通组件相同，同样在 mip2-extensions 项目中编写，如下：

![MIP Shell Folder](https://boscdn.baidu.com/assets/mip/page/mip-shell-folder.PNG)

## 使用个性化 Shell

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
                            "logo": "https://boscdn.baidu.com/assets/mip/codelab/shell/mashroom.jpg"
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

## 供子类继承的方法列表

### constructor

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

### showHeaderCloseButton

* __参数__： 无。
* __返回值__：__boolean__，默认 `true`。

MIP Shell 的头部标题栏右侧的按钮区域会根据 MIP 页面当前所处的状态来决定是否展示关闭按钮。当处于百度搜索结果页中（即拥有 SuperFrame 环境时）会额外渲染一个关闭按钮，点击效果用以通知 SuperFrame 关闭自身，如下图所示：

![Close Button](https://boscdn.baidu.com/assets/mip2/page/close-button.png)

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

### handleShellCustomButton

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

### processShellConfig

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
      shellConfig.routes[0].meta.header.logo = 'https://boscdn.baidu.com/assets/mip2/lanxiniu/logo.png'
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

### renderOtherParts

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

### updateOtherParts

* __参数__：无。
* __返回值__：无。

MIP 页面首次进入时会调用 `renderOtherParts()` 方法进行初始渲染。而后续切换页面时，MIP Page 会将目标页面的 `meta` 信息设置为 `this.currentPageMeta` 并调用 `updateOtherParts()` 方法以更新自定义部件。

在 `updateOtherParts()` 方法中，开发者仅需要更新 HTML 即可，不需要像 `renderOtherParts()` 那样创建 DOM 并插入到页面中。也因此，将 `renderFooter()` 独立出来有利于这里继续调用。示例如下：

```javascript
updateOtherParts() {
    this.$footer.innerHTML = this.renderFooter()
}
```

### beforeSwitchPage

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

### afterSwitchPage

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

## 个性化 Shell 实例

这里列出两个个性化 Shell 的实例（均为实际线上代码，但隐去了敏感信息和复杂的业务逻辑）

### 极速服务 Shell

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
          shellConfig.routes[0].meta.header.logo = 'https://boscdn.baidu.com/assets/mip2/lanxiniu/logo.png'
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

### 百度小说 Shell

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
