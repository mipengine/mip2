# 4. 预览 & 校验

## 组件预览

组件功能已经实现完毕，现在我们要预览组件的效果。还是在我们的站点目录 `example.com` 下，运行 `mip2 dev` 命令，启动调试服务器。

```bash
$ mip2 dev
```

我们在浏览器地址栏输入预览组件的地址：

```html
http://127.0.0.1:8111/components/mip-example-imagehider/example/mip-example-imagehider.html
```

就可以看到效果了。

![组件预览](./images/codelab-dev-preview.png)

调试服务器默认开启了 livereload 功能，修改代码时会自动刷新页面。我们也可以在 `mip.config.js` 中进行配置。详情可以参考[组件调试](../../guide/mip-cli/component-testing.md)。

## 组件校验

功能开发完毕，我们可以使用 `mip2 validate` 命令校验组件是否符合[编写规范](../../guide/mip-standard/mip-components-spec.md)。

```bash
$ mip2 validate -c ./components/mip-example-imagehider
```

确认符合代码规范后，我们就可以提交组件到站长组件仓库进行发布了，下一节我们将介绍如何提交发布组件。
