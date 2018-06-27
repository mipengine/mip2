# MIP Shell 的使用方法

在实际项目中，我们很可能会有一些独立于页面内容之外的相对固定的部分，我们称之为外壳 (Shell)。在页面切换时，Shell 部分一般不跟随页面内容进行过场动画。如果用 Vue 来描述的话，Shell 就是位于 `<router-view>` 之外的部分。

一个最典型的 Shell 的例子就是头部标题栏：

![头部标题栏](http://boscdn.bpc.baidu.com/assets/mip2/page/mip-shell.png)

MIP Shell 使用配置进行工作。在编写配置项使用 MIP Shell 之前，我们需要先弄清楚 MIP Shell (或者说整个 MIP) 中参与的角色。这会让 Shell 后续的说明 (尤其是 Shell 的继承部分) 变的更加清晰。

## Shell 的使用方

涉及内置标签 `<mip-shell>` 的角色主要是两方：

* MIP 核心开发小组：即 MIP 核心的开发者，负责 MIP 本身和 `<mip-shell>` 标签的内部实现，也是本文的编写方。
* 站长或站点开发人员

开发者可以在每个页面中使用 `<mip-shell>` 标签来定义 Shell 的各项配置。目前 MIP 仅提供头部 Shell，但后续会陆续提供多种类型，多种样式的 Shell 供开发者选择。

#### 配置方法

在页面的 `<body>` 标签内编写 `<mip-shell>` 标签，写法如下：

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
2. `<mip-shell>` 的位置 __必须__ 位于 `<body>` 内部，并且 __必须__ 在 mip script，mip.js 和组件 js 文件之前。(见本文档前半部分 js 文件顺序章节)
3. `<mip-shell>` 内部只允许存在一个 `<script>` 节点，并且 `type` 必须设置为 `application/json`。
4. `<script>`内部是一个合法的 JSON 对象。

#### 配置项

目前 `<mip-shell>` 支持包含一个 **基于路由** 的，**全局性** 的配置对象。其中的 `routes` 存放了各个页面及其对应的配置对象，对应关系通过 `pattern` 描述。在各个页面切换时，会通过正则匹配页面 URL 和 `pattern`，应用对应的 App Shell 配置。

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

注意点：

* `*` 可以匹配所有 URL，建议放在 `routes` 数组的最后一项，并且在此设置整个站点的默认配置数据，例如默认标题等等。
* `pattern` 虽然是字符串类型，但其内容实质是一个正则表达式。因此也可以写成 `"/\w?detail$"` 用以匹配例如 `/detail`, `/productdetail` 这样的 URL。

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

    配置头部左侧的 LOGO 的 URL，建议是一个正方形的图片，长宽不小于 64px。如果不配置则不显示 LOGO，__不会留白__。

    ![MIP Shell header logo](http://boscdn.bpc.baidu.com/assets/mip2/mip-logo-2.png)

* header.xiongzhang
    __boolean__, 默认值：`false`

    配置站点为接入熊掌号极速服务的站点。使用熊掌号配置的站点，头部按钮不可配置，由熊掌号负责控制。因此会忽略 `header.buttonGroup` 配置项。

* header.buttonGroup
    __Array__, 默认值：`[]`

    配置头部右侧的按钮区域展开后展现的按钮及其文字，点击行为等。这个配置项是一个由对象组成的数组。__仅当 `header.xiongzhang` 为 `false` 或者不配置时生效。熊掌号的按钮不可配置__。

    右侧的关闭按钮在搜索结果页中会自动展现，单独打开时不展现，不需要额外配置。

    ![MIP Shell header button](http://boscdn.bpc.baidu.com/assets/mip2/mip-button-2.png)

    <!--TODO 增加一张浮层的图片-->

    每一个配置对象由 3 个属性构成，分别是 `name`, `text` 和 `link`。这三个配置项均 __没有__ 默认值，如果缺少某个则被认为非法配置，__会被跳过而不进行渲染__。

    * name: __string__。__必填__。标识按钮的名字。在点击按钮后，会向 __当前页面__ 触发名为 `appheader:click-[name]` 的事件供其他组件监听并处理。例如当 `name` 为 `search` 时，事件名称为 `appheader:click-search`。

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

#### 完整示例

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
                            "title": "Mip Index",
                            "logo": "https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3010417400,2137373730&fm=27&gp=0.jpg",
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

#### 默认配置

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
                    "xiongzhang": false,
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

#### 头部标题的生效顺序

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

那么在打开 B 页面时， B 页面的标题(包括 loading 页面) 将会是 `"Set in data"`。
如果没有设置 `data-title`，那么标题将是 `"Set in meta"`。
如果 `data-title` 和 `<mip-shell>` 均没有设置，那么标题将是 `"Set in HTML"`。
最后，如果都没有设置，将从 `<title>` 中读取，__但 loading 页面将不会展现标题__。
