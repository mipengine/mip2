# 5. 提交组件

开发、调试、修改规范这一系列流程完成之后，我们需要将 fork 到您自己 github 仓库的代码合入原始仓库 [https://github.com/mipengine/mip2-extensions-platform](https://github.com/mipengine/mip2-extensions-platform)，MIP 官方团队会定期将 `mip2-extensions-platform` 仓库中的组件资源上线发布到 mipcdn。

## 发起 Pull Request

提交代码到您 fork 到自己 github 的远程仓库，到 github 上找到对应的项目仓库并点击 `New pull request` 按钮，确认要 merge 的目标仓库是 `mipengine/mip2-extensions`，分支为 master，然后发起 PR。

## 调整和修改

Pull request 发起后会触发仓库的自动检查和部署预览等流程，官方团队进行审核后会给出相应的修改建议，您可以根据建议在您自己的项目仓库中进行调整和修改，然后继续提交发起 PR。

## 发布使用

经过修改后，如果 PR 最终能够合入了，等待官方上线后，您就能在 MIP 页面中使用了。

```html
<!-- 页面中引用 -->
<script src="https://c.mipcdn.com/extensions/platform/v2/example.com/mip-example-imageHider/mip-example-imageHider.js"></script>
```
