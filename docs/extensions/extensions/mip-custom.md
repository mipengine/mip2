# mip-custom

## 文档信息

- 所属产品项目：定制化MIP
- 产品版本：v1.0.11
- 文档版本：v1.0.3

撰写人|修改日期|修改内容|更新版本
---|---|---|---
王培|2017-04-19|创建文档|v1.0.0
王培|2017-05-02|增加必要属性 title|v1.0.1
王培|2017-05-03|增加必要脚本说明|v1.0.2
王培|2017-06-06|修改文档示例|v1.0.3
董士浩|2017-09-08|引入`mipserver`字体文件|v1.0.16
董士浩|2017-10-20|定制化 MIP 支持A区渲染定制化内容|v1.2.0

## 说明

mip-custom 定制化 MIP 组件，想在页面中加入定制化内容，必须引入这个组件。MIP 页面改造参考官网文档：https://www.mipengine.org/doc/00-mip-101.html。

标题|内容
----|----
类型|通用
支持布局|responsive,fixed-height,fill,container,fixed
所需脚本|https://c.mipcdn.com/static/v1/mip-custom/mip-custom.js<br/> https://c.mipcdn.com/static/v1/mip-mustache/mip-mustache.js<br>https://c.mipcdn.com/static/v1/mip-fixed/mip-fixed.js

## 示例

### 基本用法

```html
<mip-custom>
    <script type="application/json">
        {
            "accid": "e2217bab684fbb898dccf04b",
            "title": "%E8%BF%99%E9%87%8C%E6%98%AF%E6%A0%87%E9%A2%98"
        }
    </script>
</mip-custom>
```

### 完整版示例

```html
<!DOCTYPE html>
<html mip>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
    <title>title</title>
    <link rel="stylesheet" type="text/css" href="https://c.mipcdn.com/static/v1/mip.css">
    <link rel="canonical" href="对应的 h5 页面 url">
    <style mip-custom>
    </style>
</head>
<body>
    <h2>定制化MIP示例页面</h2>
    <!-- 顶部定制化内容区域，可自由放置 -->
    <mip-custom position="top" source-type="med_tag">
       <script type="application/json">
            {
                "accid": "e2217bab684fbb898dccf04b",
                "title": "%E8%BF%99%E9%87%8C%E6%98%AF%E6%A0%87%E9%A2%98"
            }
        </script>
    </mip-custom>
    <p>正文</p>
     <!-- 底部定制化内容区域，必须放在内容的下方、`script`标签的上方 -->
    <mip-custom>
       <script type="application/json">
            {
                "accid": "e2217bab684fbb898dccf04b",
                "title": "%E8%BF%99%E9%87%8C%E6%98%AF%E6%A0%87%E9%A2%98"
            }
        </script>
    </mip-custom>
    <script src="https://c.mipcdn.com/static/v1/mip.js"></script>
    <script src="https://c.mipcdn.com/static/v1/mip-mustache/mip-mustache.js"></script>
    <script src="https://c.mipcdn.com/static/v1/mip-custom/mip-custom.js"></script>
</body>
</html>

```

## 属性

### position

说明：标识定制化分区，目前分为两个区域 
必选项：否 
类型：字符串  
取值范围：`top`：顶部区域，**必须和`source-type`配合使用才能正确渲染内容**。
单位：无   
默认值：`bottom`  

### source-type

说明：声明请求的资源 
必选项：否 
类型：字符串  
取值范围：百度官方给出的资源号，**必须和`position`配合使用才能正确渲染内容**。
单位：无   
默认值：空  

### accid

说明：分润平台帐号ID，暂时需要联系百度 PM 手工申请   
必选项：是   
类型：字符串  
取值范围：无  
单位：无   
默认值：无   
 
### title

说明：页面内容标题，需要对中文编码（encodeURIComponent）   
必选项：是   
类型：字符串   
取值范围：无   
单位：无   
默认值：无   

## 注意事项

- 每个 MIP 页面中的定制化模板，插入之前必须准备 **accid**，需要联系百度 PM 手工申请
- title 是页面中内容标题，**不是**`<title>`标签中的文本，同时需要对中文编码（encodeURIComponent） 


