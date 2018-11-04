# 调试与验证 MIP 页面

MIP2 提供了一个命令行工具 mip2 CLI，它提供了脚手架、调试、预览、校验、构建等功能，方便开发者快速开发 MIP 页面及自定义组件。此外，基于 mip2 CLI 的插件模式，我们还开发了 mip-cli-plugin-site 以此来帮助开发者把开发插件和开发页面两部分融合，获取更好的开发体验。

现在简单描述一下这两个工具在调试与验证方面的功能。

在调试功能方面，mip2 CLI 主要是针对组件的调试，而 mip-cli-plugin-site 主要是针对站点的调试。
- mip2 CLI 中使用命令 mip2 dev
- mip-cli-plugin-site 使用命令 mip2 site dev

这两个命令在修改组件和页面的代码时，无需手动重启和刷新，服务器内部已经帮我们实现了这一功能。

不过 mip CLI 主要实现的功能是：
- 编译并调试 components 目录下的组件
- 在 example 中拼凑组件进行调试

而 mip2 site dev 的主要功能是：
- 官方的组件开发服务器，即 mip2 dev，可以对 MIP 组件进行调试
- SuperFrame 线下调试服务器，即 mip2 sf，可以使 MIP 页面在 SF 环境下预览
- 简易 nodejs 服务和模板渲染引擎，可以在拼装 MIP 页面时进行一些稍微复杂的操作

不难看出，mip-cli-plugin-site 的调试功能比 mip2 CLI 更加健全。

在验证方面，mip-cli-plugin-site 还没有独立的这方面的功能，而 mip2 CLI 中是有的。命令行校验功能简单举例如下：

```shell
# 校验 mip 组件，输入组件目录
$ mip2 validate -c ./components

# 校验 mip 页面，输入页面路径
$ mip2 validate -p page.html
```

命令行工具提供了校验功能，方便我们在开发阶段就能按照相关规范进行开发和调整。


