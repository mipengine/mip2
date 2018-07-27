# 5. 完整示例代码

其实执行到上一步我们已经完成了示例的全部开发步骤。但为了清晰和可读性考虑，我们把最终形态的示例代码展示给开发者。

## index.html

```html
<html>
  <head>
    <meta charset="utf-8">
    <title>My First MIP Page</title>
    <meta name="apple-touch-fullscreen" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="format-detection" content="telephone=no">
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
    <link rel="stylesheet" href="https://c.mipcdn.com/static/v2/mip.css">
    <style mip-custom>
    h2 {
      text-align: center;
      margin: 10px auto;
    }

    .main-image {
      margin: 10px auto;
      display: block;
    }

    p {
      margin: 10px;
    }

    .next-link {
      float: right;
      margin-right: 10px;
      padding: 0 10px;
      background: #69f;
      border-radius: 20px;
      height: 40px;
      line-height: 40px;
      color: white;
    }
    </style>
  </head>
  <body>
    <h2>这是我的第一个 MIP 页面</h2>

    <mip-img src=" http://boscdn.bpc.baidu.com/assets/mip/codelab/shell/mashroom.jpg" width="300" height="300" class="main-image"></mip-img>

    <p>MIP 全称为 Mobile Instant Pages，因此是以页面 (Page) 为单位来运行的。开发者通过改造/提交一个个页面，继而被百度收录并展示。 </p>
    <p>但以页面为单位会带来一个问题：当一个 MIP 页面中存在往其他页面跳转的链接时，就会使浏览器使用加载页面的默认行为来加载新页面。这“第二跳”的体验比起从搜索结果页到 MIP 页面的“第一跳”来说相去甚远。 </p>
    <p>MIP 为了解决这个问题，引入了 Page 模块。它的作用是把多个页面以一定的形式组织起来，让它们互相之间切换时拥有和单页应用一样的切换效果，而不是浏览器默认的切换效果。这个功能大部分情况下对开发者是透明的，但也需要开发者遵守一定的页面编写规范。除此之外，一些和路由相关的信息和操作也会提供给开发者使用。这两部分将是本章节的主要内容。</p>

    <a mip-link href="./second.html" class="next-link">Next Page</a>

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
</html>

```

## second.html

```html
<html>
  <head>
    <meta charset="utf-8">
    <title>My Second MIP Page</title>
    <meta name="apple-touch-fullscreen" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="format-detection" content="telephone=no">
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
    <link rel="stylesheet" href="https://c.mipcdn.com/static/v2/mip.css">
    <style mip-custom>
    h2 {
      text-align: center;
      margin: 10px auto;
    }

    .main-image {
      margin: 10px auto;
      display: block;
    }

    p,h3 {
      margin: 10px;
    }
    </style>
  </head>
  <body>
    <h2>这是我的第二个 MIP 页面</h2>

    <mip-img src="https://www.mipengine.org/static/img/mip_logo_3b722d7.png" width="213" height="112" class="main-image"></mip-img>

    <p>MIP 为所有组件提供了一些常用的样式，避免开发者在编写组件时重复实现。这部分样式会在以后的迭代中逐步完善，敬请开发者们关注。</p>

    <h3>一像素边框</h3>

    <p>针对移动端浏览器在高清屏幕显示中最常见的“一像素边框”问题，MIP 给出了通用的解决方案。开发者只需要引入固定的类名即可绘制出真实的一像素边框。</p>

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
</html>

```
