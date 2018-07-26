# 2. 准备环境

## 安装命令行工具

打开命令行工具，输入：

``` bash
$ npm install -g mip2
```

输入 `mip2 -V`，若能正常显示版本号，说明已经安装成功。

## 初始化项目

### 站长自定义组件

1. fork 站长组件仓库

在 Github fork `https://github.com/mipengine/mip2-extensions-platform` 仓库到自己的 github，并将自己 github 的 fork 后的仓库 `clone` 到本地。

2. 安装依赖

```bash
$ cd mip2-extensions-platform
$ npm install
```

组件仓库中包含了 eslint 相关的依赖，提交代码时会自动检查书写规范，因此需要提前安装依赖。编写规范可以参考：[组件开发规范](../../guide/mip-standard/mip-components-spec.md)

3. 创建站点组件项目

在 clone 下来的项目中，我们进入 `sites` 目录，可以看到这里托管了各个站点的组件。我们使用命令行工具初始化一个以站点名称命名的目录，假设我们的站点名称为 `example.com`：

```bash
$ mip2 init

? 项目名称（mip-project）example.com
? 项目描述 (A MIP project) components of example.com
? 作者信息 (username (username@your-email.com))
INFO generate MIP project successfully!
```

按照提示依次输入，可以看到 `site` 目录下新增了一个 `example.com` 目录。

```bash
$ cd example.com
```

切换到站点项目目录即可快速进行组件开发工作了，可以选择您喜欢的编辑器(IDE)打开项目文件夹进行开发。

### 官方组件

如果您需要向官方组件仓库提交组件，则不需要进行项目初始化，在 Github fork 官方组件仓库 `https://github.com/mipengine/mip2-extensions` 到自己的 github，并从您 fork 后的 github 仓库 `clone` 到本地，即可开始开发。

组件开发请继续参考下一小节。
