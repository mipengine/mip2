# 5. 完整示例代码

其实执行到上一步我们已经完成了示例的全部开发步骤。但为了清晰和可读性考虑，我们把最终形态的示例代码展示给开发者。

## mip-shell-example.js

```javascript
import './mip-shell-example.less'

export default class MIPShellExample extends window.MIP.builtinComponents.MIPShell {
  processShellConfig(shellConfig) {
    // 强制修改 HTML 中的按钮配置
    shellConfig.routes.forEach(route => {
      route.buttonGroup = [{
        "name": "setting",
        "text": "设置"
      },
      {
        "name": "cancel",
        "text": "取消"
      }]
    })
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

  renderFooter() {
    let pageMeta = this.currentPageMeta
    // 只为了简便，直接输出了一个字符串
    return 'hello ${pageMeta.header.title}!'
  }

  updateOtherParts() {
    this.$footer.innerHTML = this.renderFooter()
  }

  handleShellCustomButton (buttonName) {
    if (buttonName === 'setting') {
      this.$footerWrapper.style.display = 'block'
    }
  }

  bindRootEvents () {
    // 很重要！很重要！很重要！
    super.bindRootEvents()

    this.$footer.addEventListener('click', () => {
      // 点击隐藏底部栏
      this.$footerWrapper.style.display = 'none'
    })
  }
}
```

## index.html

只列出使用 `<mip-shell-example>` 的部分。

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
