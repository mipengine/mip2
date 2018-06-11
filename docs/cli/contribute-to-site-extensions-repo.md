# 提交站长组件

## 站长组件仓库说明

与 MIP 1.0 采用的方式不同，MIP 2.0 以项目（一个站点）的粒度来管理站长组件。每一个项目（使用 `mip2 init` 命令生成）中包含了这个站点所需的所有自定义组件。

MIP 2.0 的站长组件托管在 [Github 站长组件仓库](https://github.com/mipengine/mip2-extensions-platform)，项目结构大致如下：

```
├──sites
    ├── test.a.com
    │   ├── common
    │   ├── components
    │   ├── example
    │   ├── mip.config.js
    │   ├── node_modules
    │   ├── package-lock.json
    │   ├── package.json
    │   └── static
    └── test.b.com
        ├── common
        ├── components
        ├── example
        ├── mip.config.js
        ├── package-lock.json
        ├── package.json
        └── static
├── LICENSE
└── README.md

```

`sites` 目录即是站点项目的集合。示例中已经托管了 `test.a.com` 和 `test.b.com` 两个站点的自定义组件。站长各自在其 `components` 目录下[编写组件](./start-writing-first-mip.md#编写-mip-组件)。

本地需求实现并测试无误后，通过 `Pull Request` 的方式（暂时方案）提交审核，官方通过审核后会定期编译上线。

供站点使用的最终发布地址为：

```bash
https://c.mipcdn.com/extensions/platform/v2/{站点项目名}/{组件名}/{组件名}.js

# 例如 test.a.com 下的 mip-example 组件

https://c.mipcdn.com/extensions/platform/v2/test.a.com/mip-example/mip-example.js
```

## 站长组件开发、提交流程

1.**fork 官方组件仓库**

在 Github fork `https://github.com/mipengine/mip2-extensions-platform` 仓库，并 `clone` 到本地。

2.**开发**

我们进入 `sites` 目录，如果是第一次提交一个站点的组件，运行命令

```
$ mip2 init
```

按照提示输入项目名称，如 `cafe.com`，新增了一个站点项目。

```
$ cd cafe.com
```
切换到站点项目目录即可快速进行组件开发工作了：

- [新增组件](./start-writing-first-mip.md#2-新建一个自定义组件)
- [调试组件](./component-testing.md)
- [校验组件](./cli-usage.md#组件和页面校验)

3.**发起 Pull Request**

开发完成后，[发起 pull Request](https://help.github.com/articles/creating-a-pull-request-from-a-fork/)

4.**官方审核通过，合入上线**

官方审核通过后，代码将合入 `master` 分支并上线。若不通过，请根据反馈修改后再次提交。

5.**调用组件脚本**

```javascript
// 页面中引用
<script src="https://c.mipcdn.com/extensions/platform/v2/{站点项目名}/{组件名}/{组件名}.js"></script>
```


