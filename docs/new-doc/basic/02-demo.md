# 一个完整的例子

```html
<!DOCTYPE html>
<html mip>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <link rel="stylesheet" type="text/css" href="https://c.mipcdn.com/static/v2/mip.css">
    <!--TODO: canonical href需要替换成原页面url-->
    <link rel="canonical" href="https://www.example.com/your/path.html">
    <title>MIP页Demo效果</title>
    <!--TODO: 替换样式-->
    <style mip-custom>
      body {
        margin: 10px;
      }

      .red-text {
        color: #f00;
      }

      .middle-text {
        text-align: center;
        font-size: 20px;
      }

      hr {
        margin: 20px 0;
      }

      a {
        border: 1px solid #ddd;
        padding: 10px;
        display: block;
      }
    </style>
    <!-- noscript 标签是为了在不支持 script 的环境下快速的展现 MIP 页面，推荐使用 -->
    <noscript>
      <style mip-officialrelease>
        body {
          -webkit-animation: none;
          -moz-animation: none;
          -ms-animation: none;
          animation: none;
        }
      </style>
    </noscript>
  </head>
  <body>
    <!--自定义样式-->
    <p class="middle-text">增加样式</p>
    <p class="red-text">MIP页支持修改css样式</p>
    <hr>

    <!--跳转链接, 落地页同为MIP-->
    <p class="middle-text">mip 跳转链接</p>
    <a data-type="mip" data-title="目标页面标题" href="https://www.mipengine.org/doc/00-mip-101.html">跳转到MIP新手指南 (MIP)</a>
    <!--跳转链接, 落地页不是MIP-->
    <a target="_blank" href="https://github.com/mipengine">跳转到GitHub (非MIP)</a>
    <hr>

    <!--图片组件-->
    <p class="middle-text">mip-img 图片组件</p>
    <mip-img layout="fixed" width="200" height="130" src="https://www.mipengine.org/static/img/mip_logo_3b722d7.png" alt="MIP LOGO"></mip-img>
    <hr>

    <!--分享组件，外链mip-share.js-->
    <p class="middle-text">mip-share 分享组件</p>
    <mip-share title="分享：我的第一个MIP页面"></mip-share>
    <hr>

    <!--百度统计组件，外链mip-stats-baidu.js TODO: 修改token值-->
    <p class="middle-text">mip-stats-baidu 百度统计组件，代码可见</p>
    <mip-stats-baidu token="4e397f684261b9e4ff9d8"></mip-stats-baidu>

    <!--mip 运行环境-->
    <script src="https://c.mipcdn.com/static/v2/mip.js"></script>
    <!--分享组件 代码-->
    <script src="https://c.mipcdn.com/static/v1/mip-share/mip-share.js"></script>
    <!--百度统计组件 代码-->
    <script src="https://c.mipcdn.com/static/v1/mip-stats-baidu/mip-stats-baidu.js"></script>
  </body>
</html>
```
