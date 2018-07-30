# 2. 创建自定义 Shell

MIP Shell 本质上也是一个 MIP 组件，因此它的开发方式和普通的自定义组件开发方式类似，也需要 fork 代码仓库 - 开发 - 调试 - 提交到仓库 这样几个步骤。关于自定义组件的开发方式可以参考[这里](../../guide/mip-cli/component-development.html)。

不过 Shell 作为一个特别的组件，和普通的 MIP 组件开发又略有不同，主要有以下几点：

1. 普通组件采用 `.vue` 的扩展名，以 Vue 的语法进行编写。而 Shell 采用 `.js` 作为扩展名，以 Javascript Class (ES6) 的格式进行书写。

2. MIP 默认提供了 Shell 的基类，所有自定义 Shell __必须__ 继承 Shell 的基类。

## 识别需求

自定义 Shell 非常灵活，可以完成各类业务需求。在本篇文档中，我们假设我们要完成如下需求：

* 固定下拉按钮的内容，忽略页面上的配置
* 额外渲染底部栏，并绑定事件

## 创建 js 文件

假设我们要创建一个 MIP Shell Example 组件，我们需要新建一个 `mip-shell-example.js` 文件，并在其中编写初始内容：

```javascript
export default class MIPShellExample extends window.MIP.builtinComponents.MIPShell {
    // TODO
}
```

类名使用驼峰命名，组件平台会自动把驼峰转化为符合 HTML 规范的短划线连接形式，如 `<mip-shell-example>`。
