# 5. 提交组件

开发、调试、修改规范这一系列流程完成之后，我们需要将 fork 出来的仓库代码合入原始仓库，MIP 官方团队会定期将组件资源上线发布到 mipcdn。

## 发起 Pull Request

提交代码到 fork 的远程仓库，点击 `New pull request` 按钮，确认要 merge 的目标仓库是 `mipengine/mip2-extensions`，分支为 master，然后发起PR。

## 调整和修改

Pull request 发起后会触发仓库的自动检查和部署预览等流程，官方团队进行审核后会给出相应的修改建议，我们可以根据建议进行调整和修改。

## 发布使用

经过修改 PR 终于能合入了！等待官方上线后，我们就能在 MIP 页面中使用了：

```html
<!-- 页面中引用 -->
<script src="https://c.mipcdn.com/extensions/platform/v2/example.com/mip-example-imageHider/mip-example-imageHider.js"></script>
```
