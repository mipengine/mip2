# 4. 使用自定义 Shell

经过前几个步骤，自定义 Shell 已经创建完成了。接下来我们要在页面中使用它，使用方法和内置的 `<mip-shell>` 是非常类似的。

## 添加标签和引用

在 `<body>` 内部引用 `mip.js` 之前使用我们刚才新建的自定义 Shell 的标签 `<mip-shell-example>`（取代默认的 `<mip-shell>`）。稍有不同的是需要在标签上添加属性 `mip-shell`，供 MIP 内部认识这个自定义标签并区别对待。

另外一个和 `<mip-shell>` 不同的是，自定义 Shell 的 js 文件需要额外引入，顺序在 `mip.js` 之后。

```html
<body>
  <!-- 其他 DOM 内容 -->
  <mip-shell-example mip-shell>
    <script type="application/json">
    {
      "routes": [
        {
          "pattern": "/use-shell.html",
          "meta": {
            "header": {
              "show": true,
              "title": "我的首页",
              "logo": "https://gss0.bdstatic.com/5bd1bjqh_Q23odCf/static/wiseindex/img/favicon64.ico"
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
  <script src="http://somecdn.com/mip-shell-example.js"></script>
</body>
```
