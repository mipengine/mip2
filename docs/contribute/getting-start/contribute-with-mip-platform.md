# 利用 MIP 组件审核平台贡献组件代码

[notice]站长组件是扩展 MIP 功能的一种形式，在开发提交站长组件之前，请首先阅读[《请优先使用 MIP 现有机制和官方组件来实现业务功能》](./use-official-mip-first.md)一文，看看所需要开发的站长组件是否已被 MIP 现有的机制和官方组件覆盖了，从而减少开发和审核的时间成本。

在一般情况下，我们建议直接通过上一篇文章的方式，也就是直接拉取 github 代码，然后提交 Pull Request 的方式进行组件代码提交。这种方式要求站长需要有 github 账号，并且需要掌握一定的 git 使用方法，这对于程序员来说应该属于必备能力。除开这种方式之外，MIP 站长组件平台也提供了直接上传组件代码的方式来兼容原有的组件提交逻辑，这样站长无需 github 账号也能够提交代码了。

## 打包组件代码

MIP 2.0 以站点项目的粒度来对站长组件进行维护，一个站点里可能存在多个站长组件，站长可以对各自站点的站长组件进行增减，最后提交的代码包应该包括整个站点文件夹。以下面的文件结构为例，假如需要提交 `test.a.com` 下面的某个站长组件，则应该对 `test.a.com` 这个文件夹进行 `zip` 打包，然后做下一步上传处理。


```bash
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

需要注意的是，打包的代码不应该包含 `.gitignore` 文件里所定义的文件或文件夹，尤其是 `node_modules` 目录，在打包前应该将其移除以避免打包后的文件体积过大导致上传失败。

```bash
├── test.a.com
       ├── common
       ├── components
       ├── example
       ├── mip.config.js
       ├── package-lock.json
       ├── package.json
       └── static
```

如果使用 `linux` 或者 `mac` 的同学，可以通过 `zip` 命令进行打包：

```shell
cd sites
zip -r test.a.com.zip test.a.com/
```

对于使用使用工具进行 zip 压缩的同学，只需要满足打包好的文件在当前文件夹执行解压的时候能够得到原先的 `test.a.com` 文件夹即可。

## 提交代码包

提交代码跟原来步骤一样，打开 [MIP 组件审核平台 - 我的组件](https://www.mipengine.org/platform/mip)，点击“上传组件”按钮，将上一步打包好的文件进行上传即可。

![上传组件](https://gss0.baidu.com/9rkZbzqaKgQUohGko9WTAnF6hhy/v1/assets/mip/docs/contribute/mip-upload-code.png)

上传完成之后会在“我的组件”条目多出当前提交的站点，点击提交审核，站长平台会自动发起 GitHub 的 PR，接下来就能够点击查看相应的 PR 查看代码审核意见了。与原先一样，当 PR 要求修改或者被打回时，站长组件平台的站点条目会显示“需修改”或者已打回，站长需要根据修改意见重新修改代码并重新打包提交。在组件状态为“需修改”的情况下，如果对审核意见有异议的话，可以点击链接到相应的评论下面添加留言（这步要求站长有 GitHub 账号）。

## 小节

目前通过 MIP 组件审核平台提交第三方站长组件代码的方式属于对原有站长组件提交模式的兼容，站长在提交 MIP 2.0 组件时最好还是通过提交 GitHub PR 的方式完成。我们的初衷都是为了降低站长的使用成本，因此在使用 MIP 组件审核平台遇到任何问题，可以通过邮件（mip-support@baidu.com）或者是 QQ 群（580967494）及时向我们反馈，我们会努力解决问题，逐步把流程优化到最好。


