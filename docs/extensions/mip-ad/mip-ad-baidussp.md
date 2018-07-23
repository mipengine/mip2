# mip-ad:ad-baidussp 百度 SSP 直投广告

`<mip-ad>` 的一种类型：百度 SSP 直投广告。  产品介绍见[具体文档](http://yingxiao.baidu.com/zhichi/knowledge/detail.action?channelId=24&classId=14547&knowledgeId=14745)。

标题|内容
----|----
类型|通用
支持布局|reponsive, fixed-height
所需脚本|https://c.mipcdn.com/static/v1/mip-ad/mip-ad.js

## 示例

### 基本使用

```html
<mip-ad 
    type="ad-baidussp"
    sspId="xxx">
</mip-ad>
```

## 属性

### type

说明：广告类型  
必选项：是  
类型：字符串  
取值：`ad-baidussp`  
默认值：无

## 注意事项

SSP 直投富媒体在满足以下 3 个条件

- 支持 HTTPS。
- 可以异步执行。
- 嵌入广告（非悬浮）。

以上条件，在网盟侧未做强制要求。  
