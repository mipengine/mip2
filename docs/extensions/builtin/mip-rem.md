# mip-rem

`<mip-rem>` 用来设置文档根元素的 `font-size`，防止样式错乱问题。默认值为空，即跟随浏览器的默认设置。

## 示例

### 基本使用

```html
<mip-rem font-size='[{"maxWidth": 359, "size": 90}, {"maxWidth": 413, "size": 100}, {"maxWidth": 767, "size": 110}, {"maxWidth": 1023, "size": 200}, {"minWidth": 1024, "size": 270},]'></mip-rem>
<div style="font-size: 14px;">这是14px</div>
<div style="font-size: 0.5rem;">这是0.5rem</div>
```

## 属性

### font-size

说明：字体大小，作用于文档根元素  
必选项：否  
类型：特殊格式的字符串  
单位：无  
取值：必须是可以被解析的数组，数组内部的一个元素对应一个设备查询匹配项，每个元素包含一个对象，对象内的 `key` 只能是 `maxWidth`，`minWidth` 和 `size`，分别代表最大宽度，最小宽度和字体大小。匹配项从前向后进行，最后匹配的项目才会生效  
默认值：无，即跟随浏览器的默认设置 
