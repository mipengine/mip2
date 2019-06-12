# 如何从 MIP 1.0 迁移到 2.0

迁移包括以下部分：

## MIP 核心库迁移

将站点引用的 mip.js 和 mip.css 版本由 1.0 修改为 2.0。MIP 核心库 2.0 版本完全兼容 1.0 版本，开发者可放心升级。具体做法如下：

### mip.js 文件迁移

将站点中的所有如下引用：

`<script src="https://c.mipcdn.com/static/v1/mip.js"></script>` 

改为：

`<script src="https://c.mipcdn.com/static/v2/mip.js"></script>`。

### mip.css 文件迁移

将站点中的所有如下引用：

`<link rel="stylesheet" href="https://c.mipcdn.com/static/v1/mip.css">`

改为：

`<link rel="stylesheet" href="https://c.mipcdn.com/static/v2/mip.css">`

## 内置组件迁移

MIP 2.0 将使用频繁的组件由官方组件升级为内置组件。目前升级的主要有：

* `mip-fixed` 组件。`mip-fixed` 组件在 MIP 1.0 中需要额外引入 JS 文件 `<script src="https://c.mipcdn.com/static/v1/mip-fixed/mip-fixed.js"></script>` 后才能在页面中使用 `<mip-fixed>` 标签，由于在 2.0 中该组件已经内置，无需额外引入 JS 文件，因此在迁移时将对应的 `<script>` 标签删掉即可。

* `mip-bind` 组件。`mip-bind` 组件为新增的内置组件，能够让 MIP 页面获得数据驱动的能力，站长在进行迁移时可以考虑使用 `mip-bind` 丰富页面的交互性。mip-bind 的使用方法请参考文档：[《数据绑定》](../interactive-mip/data-binding/data-definition.md)。

## 官方组件迁移

判定站点中使用的组件是否为官方组件，请移步[官方组件列表](../../components/index.md)进行查找。

以 `mip-mustache` 组件为例：

将站点中如下引用：

`<script src="https://c.mipcdn.com/static/v1/mip-mustache/mip-mustache.js"></script>`

改为：

`<script src="https://c.mipcdn.com/static/v2/mip-mustache/mip-mustache.js"></script>`

其他组件同理操作，将如上 `mip-mustache` 修改为要迁移的组件名称即可。

[warning] 官方组件 2.0 版本与 1.0 版本基本保持一致。但是不能排除官方组件升级导致元素的层级关系或 CSS 样式发生变化的情况。因此，请开发者务必对于使用了官方组件的页面进行测试，防止出现功能无法使用或页面表现不良的情况。
