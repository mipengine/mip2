/**
 * @file mip-bind
 * @author sfe
 */

// 为了兼容 mip 1.0 的语法，可以使用独立 js 的方式提供双向绑定功能
// mip 2.0 中建议在组件中处理所有的交互逻辑，尽量不要在 HTML 页面的 custom element 中处理交互相关的操作
// mip-bind 主要是为了识别 dom 中的 m-bind, m-text, on 属性，配合 <mip-data> 标签来做双向数据绑定
