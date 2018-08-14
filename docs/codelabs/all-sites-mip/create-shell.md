# 4. 创建 Shell

通过链接和 MIP 的共同作用将页面串联在一起之后，在不同页面之间跳转可以获得如单页应用的效果。但在实际项目中，还可能有一些元素是独立于每个页面之外的（或者说每个页面都包含的内容），我们称之为外壳 (Shell)。在页面切换时，Shell 部分一般不跟随页面内容进行过场动画，是独立于每个页面之外的全局内容。MIP 为开发者提供了配置 Shell 的简单方式：使用 `<mip-shell>` 标签。

这里我们来创建一个默认的 Shell，表现为头部标题栏，内部包含后退按钮，标题，LOGO和更多按钮。还记得我们在上一步添加了从 `index.html` 到 `second.html` 的链接吗？但我们并没有创建反向的链接，所以用户到达 `second.html` 之后将无法回退（除非点击浏览器或者手机系统提供的返回按钮）。Shell 头部标题栏的后退按钮可以帮我们解决这个问题。

## 创建 MIP Shell 标签

我们需要在 __每个页面__ 的 `<body>` 标签内部（先于 `mip.js` 的引用）创建 `<mip-shell>` 标签。__每个页面只能至多创建一个__，可以不创建，即使用默认配置（之前的两个页面均是这类情况）。创建内容如下：

```html
<body>
  <!-- 其他 DOM 内容 -->
  <mip-shell>
    <script type="application/json">
    {
      "routes": [
        {
          "pattern": "/use-shell.html",
          "meta": {
            "header": {
              "show": true,
              "title": "我的首页",
              "logo": "https://gss0.bdstatic.com/5bd1bjqh_Q23odCf/static/wiseindex/img/favicon64.ico",
              "buttonGroup": [
                {
                    "name": "subscribe",
                    "text": "关注"
                },
                {
                    "name": "chat",
                    "text": "发消息"
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
              "show": true,
              "title": "其他页面"
            }
          }
        }
      ]
    }
    </script>
  </mip-shell>
  <script src="https://c.mipcdn.com/static/v2/mip.js"></script>
</body>
```

这里我们创建了两端规则，分别是：

1. 匹配 `/index.html` 规则的页面（例子中仅 `index.html`），设置如下：
  * 头部展现
  * LOGO 图片地址，标题文字“我的首页”
  * 设置了两个下拉按钮
  * 设置为首页 （首页标题栏左边没有后退按钮）

2. 匹配其他规则的页面（例子中仅 `second.html`），设置如下：
  * 头部展现
  * 标题文字“其他页面”，没有 LOGO
  * 没有下拉按钮
  * 不是首页

关于 `<mip-shell>` 标签更多的配置项和其他细节，您可以参阅 [Shell 文档](../../guide/all-sites-mip/mip-shell.md)。

## 预览效果

我们已经成功地为我们的两个页面添加了头部标题栏。打开 `index.html` 可以看到效果（虽然样式颇为简陋）：

![带 Shell 的示例](https://boscdn.baidu.com/assets/mip/codelab/shell/use-shell-2.png)

注意到右上角的三个点，点击之后可以展现更多按钮，即我们配置过的“关注”和“发消息”（还包含一个动画效果）：

![带 Shell 的示例下拉](https://boscdn.baidu.com/assets/mip/codelab/shell/use-shell-3.png)

最后我们看一下页面的切换效果。在切换到第二页时，因为 Shell 独立于页面之外且配置完整，因此头部标题可以直接出现在目标页面加载之前，大大提升了体验：

![带 Shell 的前进切换](https://boscdn.baidu.com/assets/mip/codelab/shell/transition-forward-2.png)

页面后退和前进时的动画略有不同：前进时需要载入目标页面，因此需要 loading；而后退的目标页面已经存在，因此可以直接展现，效果更好：

![带 Shell 的后退切换](https://boscdn.baidu.com/assets/mip/codelab/shell/transition-backward.png)

您可以启动静态服务器自己体验一下动态的效果，和普通的浏览器切换页面相比在体验上可以说是天壤之别！
