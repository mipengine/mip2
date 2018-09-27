# mip-app-banner App 调起组件

用于调起 App。

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, fill, container, fixed
所需脚本|https://c.mipcdn.com/static/v1/mip-app-banner/mip-app-banner.js

## 示例

### 基本用法
```html
<head>
    <meta name="apple-itunes-app" content="app-id=xxxx, app-argument=medium://xxxx">
    <link rel="manifest" href="xxxx/manifest">
</head>
...
<mip-app-banner id="my-app-banner" layout="nodisplay">
    <button open-button>打开app</button>
</mip-app-banner>
```

## 属性

### id

说明：组件 `id`，组件唯一标识  
必选项：是  
类型：字符串  
单位：无  
默认值：无  

### layout

说明：组件布局，只能设置值为 `nodisplay`  
必选项：是  
类型：字符串  
取值范围：`nodisplay`  
单位：无  
默认值：`nodisplay`  

### 子节点 `[open-button]`

说明：调起 App 的按钮，必须带有 `open-button` 属性  
必选项：是  
类型：HTML 节点  
取值范围：无  
单位：无  
默认值：`<button open-button>`

## 浏览器兼容性

浏览器|Android+chrome|Android+baidu|iOS+safari |其他情况
---|---|---|---|---
结果页打开|支持|不支持屏蔽|不支持，暂时屏蔽|支持
非结果页打开|不支持屏蔽|不支持屏蔽|浏览器 banner|支持


## 注意事项

- 在引用组件的页面头部head标签中需要加两个标签
    - iOS 使用：`<meta name="apple-itunes-app" content="app-id=app的id, app-argument=medium://xxxx">`。
    - Android 使用：`<link rel="manifest" href="https://xxxx/manifest.json">`。
    - manifest 的 url 必须是 HTTPS 的。

- manifest.json 示例

```
{
  "prefer_related_applications": true, 
  "related_applications": [
    {
      "platform": "play",
      "open": "scheme://xx",
      "install": "your download url"
    }
  ]
}
```
