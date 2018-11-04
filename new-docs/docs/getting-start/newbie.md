# 新手指南

新手指南提供了 MIP 的一些技术指引，主要是后文的总体预览，详细内容可点击相关链接进行查看。

## 第一次使用 MIP 

本教程对初学者十分友好，点击下面的链接可以进行第一次 MIP 页面的开发与调试体验，还可以了解 MIP 在搜索中是如何生效的。
1. [创建第一个 MIP 页面](./start-writing-first-mip.md)
2. [调试与验证 MIP 页面](./debug-and-validate.md)
3. [MIP 搜索生效](./mip-in-search/introduction.md)

## MIP 规范

MIP 页面的高性能离不开规范的重要性。因为 MIP 主要由 MIP-HTML、MIP-JS 和 MIP-CACHE 三部分组成，所以主要的规范有：
- [MIP HTML 规范](../mip-standard/mip-html-spec.md)
- [MIP CACHE 规范](../mip-standard/mip-cache-spec.md)
- [MIP 组件规范](../mip-standard/mip-components-spec.md)
- ...

## 样式与布局

MIP 为了性能和易用性考虑，对 CSS 的使用做了一定的限制，与此同时，针对响应式设计，MIP 做出了一些扩展来更好地展示页面元素：
1. [支持的 CSS ](../style-and-layout/supported-css.md)
2. [组件布局](../style-and-layout/layout.md)
3. [媒体查询](../style-and-layout/meadia-query.md)
4. [占位符和备用行为](../style-and-layout/placeholder-and-fallback.md)

## 交互式设计

MIP 提供了为数众多的官方组件来满足开发者的需求。不过在一些复杂的可交互 MIP 页面中，只通过配置组件属性是达不到设计要求的。因此 MIP 组件通过对外暴露属性、事件和行为的方式来实现外部对组件的配置和使用。
- [事件监听与行为触发](../interactive-mip/event-and-action.md)
- [数据绑定](../interactive-mip/data-binding/introduction.md)
    - [数据定义](../interactive-mip/data-binding/data-definition.md)
    - [数据获取、修改与观察](../interactive-mip/data-binding/data-operation.md)
    - [数据绑定语法说明](../interactive-mip/data-binding/mip-bind.md)
    - [class 与 style 属性绑定语法说明](../interactive-mip/data-binding/class-and-style-binding.md)
- [自定义 JS](../interactive-mip/custom-js.md)

## 全站 MIP 开发

当一个 MIP 页面中存在往其他页面跳转的链接时，就会使浏览器使用加载页面的默认行为来加载新页面。这“第二跳”的体验比起从搜索结果页到 MIP 页面的“第一跳”来说相去甚远。由此便产生了全站 MIP 开发。

1. [全站 MIP 页面编写规范](../all-sites-mip/structure.md)
2. [页面切换方案](../all-sites-mip/switch-page.md)
3. [Page API](../all-sites-mip/page-api.md)
4. [MIP Shell](../all-sites-mip/mip-shell.md)
5. [MIP Viewer](../all-sites-mip/viewer.md)
6. [MIP 快捷方式](../all-sites-mip/style.md)

## 用户行为统计与分析

对于大多数网站，用户行为的统计与分析功能是必不可少的，MIP 正是考虑到了这些情形，所以提供了相应的组件供用户选择。
- [mip-pix](../analytics/mip-pix.md)
- [mip-analytics](../analytics/mip-analytics.md)

最后为了达到更好的用户体验和方便开发者的使用，本教程最后还提供了渐进增强式设计和辅助开发工具的相关内容，如下：
- [MIP 页离线可用](../progressive-enhancement-design/introduction.md)
- [mip-cli-plugin-site 使用说明](../assistant-development-tools/introduction.md)