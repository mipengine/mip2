# 新手指南

新手指南提供了 MIP 的一些技术指引，主要是后文的总体预览，详细内容可点击相关链接进行查看。

## 第一次使用 MIP

本教程对初学者十分友好，点击下面的链接可以进行第一次 MIP 页面的开发与调试体验，还可以了解 MIP 在搜索中是如何生效的。

1. [创建第一个 MIP 页面](./start-writing-first-mip.md)
2. [调试与验证 MIP 页面](./debug-and-validate.md)
3. [MIP 搜索生效](../mip-in-search/introduction.md)

## 如何从 MIP 1.0 迁移到 2.0

相较于 MIP 1.0，MIP 2.0 版本提供了更多新特性，对于使用 MIP 1.0 的开发者可以通过[迁移](./migrate-v1-to-v2.md)获取更多新功能。

## MIP 规范

MIP 页面的高性能离不开规范的重要性。因为 MIP 主要由 MIP-HTML、MIP-JS 和 MIP-CACHE 三部分组成，所以主要的规范有：

- [MIP HTML 规范](../mip-standard/mip-html-spec.md)
- [MIP Canonical 使用规范](../mip-standard/mip-canonical.md)
- [MIP CACHE 规范](../mip-standard/mip-cache-spec.md)
- [MIP 校验工具错误信息说明](../mip-standard/mip-validate.md)

## 样式与布局

MIP 为了性能和易用性考虑，对 CSS 的使用做了一定的限制，与此同时，针对响应式设计，MIP 做出了一些扩展来更好地展示页面元素：

1. [组件布局](../style-and-layout/layout.md)
2. [内置样式](../style-and-layout/builtin-style.md)
3. [自定义样式规范](../style-and-layout/supported-css.md)

## 交互式设计

MIP 提供了为数众多的官方组件来满足开发者的需求。不过在一些复杂的可交互 MIP 页面中，只通过配置组件属性是达不到设计要求的。因此 MIP 组件通过对外暴露属性、事件和行为的方式来实现外部对组件的配置和使用。

- [MIP 事件机制](../interactive-mip/event-and-action.md)
  + 介绍 on 语法是如何实现事件监听和行为触发的
  + 介绍 MIP 提供的全局事件和组件事件有哪些
  + 介绍 MIP 提供的全局方法和组件方法有哪些
- [MIP 数据驱动机制](../interactive-mip/data-driven.md)
  + 介绍如何使用 mip-data 定义初始数据
  + 介绍如何绑定将数据绑定到属性、文字上
    * 包括文字绑定 m-text
    * class 和 style 绑定
    * 表单元素的 value 双向绑定
- [MIP 表达式](../interactive-mip/expression.md)
  + 介绍 MIP.setData、数据绑定语法允许使用的表达式
- [数据驱动与模板渲染](../interactive-mip/data-driven-and-dom-render.md)
  + 介绍如何使用 mip-list 配合数据驱动机制获得增删节点的能力
- [自定义 JS](../interactive-mip/custom-js-by-using-mip-script.md)
  + 介绍如何使用 mip-script 扩充 MIP 表达式的计算能力

## 全站 MIP 开发

当一个 MIP 页面中存在往其他页面跳转的链接时，就会使浏览器使用加载页面的默认行为来加载新页面。这“第二跳”的体验比起从搜索结果页到 MIP 页面的“第一跳”来说相去甚远。由此便产生了全站 MIP 开发。

1. [全站 MIP 页面编写规范](../all-sites-mip/structure.md)
2. [页面切换方案](../all-sites-mip/switch-page.md)
3. [Page API](../all-sites-mip/page-api.md)
4. [MIP Shell](../all-sites-mip/mip-shell.md)
5. [MIP Viewer](../all-sites-mip/viewer.md)
6. [MIP 快捷方式](../all-sites-mip/style.md)

## 用户行为统计与分析

对于大多数网站，用户行为的统计与分析功能是必不可少的，MIP 正是考虑到了这些情形，所以提供了相应的组件供用户选择。

- [mip-pix](https://www.mipengine.org/v2/components/analytics/mip-pix.html)
- [mip-analytics](https://www.mipengine.org/v2/components/analytics/mip-analytics.html)

