# 提交组件到官方组件仓库

当前 MIP 的官方组件在[Github](https://github.com/mipengine/mip2-extensions)上托管，开发者可以通过提交 Pull Request 的方式来贡献优秀的组件。

## 步骤

1.**fork 官方组件仓库**

在 Github fork `https://github.com/mipengine/mip2-extensions` 仓库，并 `clone` 到本地。

2.**开发**

`git clone` 出来的项目结构与 `mip2 init` 命令初始化的项目结构类似，我们可以在 `components` 目录新增组件。

- [组件开发](./start-writing-first-mip.md#编写-mip-组件)
- [调试](./cli-usage.md#启动调试服务器)
- [校验](./cli-usage.md#组件和页面校验)

3.**发起 Pull Request**

开发完成后，[发起 pull Request](https://help.github.com/articles/creating-a-pull-request-from-a-fork/)

4.**官方审核通过，合入上线**

官方审核通过后，代码将合入 `master` 分支并上线。若不通过，请根据反馈修改后再次提交。


