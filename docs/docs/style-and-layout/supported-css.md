# 支持的 CSS

正如前文所述，在 MIP 中使用 CSS 是有所限制的，这么做主要是为了性能和易用性考虑。这里可以分为两部分进行描述：1、组件代码中的 CSS；2、页面 (Page) 中的 CSS。

而组件代码的 CSS 规范在[前文](../mip-standard/mip-components-spec.md)已有所涉及，这里不再赘述。下面针对页面 (Page) 中的 CSS 进行详细说明。

## 禁止使用的样式

MIP 页面中不能使用如下样式：

| 禁止使用的样式 | 说明 |
| -- | -- |
| 内嵌样式属性 | 所有样式要在 `head` 中进行定义，并位于 `<style mip-custom>` 标记中。 |
| 类名如 mip- 和 i-mip-  | 开发者自定义的样式表中，类名不能以 `mip-` 作为开头，这些是预留给 MIP 使用的。此外，用户在使用 CSS 选择器的时候一般情况下不要去搜索这些类。 |

MIP 页面中允许使用 `<link rel=”stylesheet”>` 、`!important `、 涉及 CSS3 的动画如 `transition` 和其他常规的 CSS 用法和写法。但是 CSS3 的兼容性需要用户自己考虑。

还有更多的校验规则可以使用 `mip-validator` 这个库来进行校验，或者直接点击这个链接 [MIP 代码校验工具](https://www.mipengine.org/validator/validate )，输入代码进行在线校验。
