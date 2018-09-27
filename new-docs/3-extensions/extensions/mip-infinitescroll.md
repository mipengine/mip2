# mip-infinitescroll 无限滚动

当用户滚动到页面底部时，异步加载更多数据。适用于信息推荐。

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, fill, container, fixed
所需脚本|https://c.mipcdn.com/static/v1/mip-infinitescroll/mip-infinitescroll.js<br/> https://c.mipcdn.com/static/v1/mip-mustache/mip-mustache.js

## 示例

### 最简单用法
异步获取 `number` 等数据，插入页面。

- `data-src` 填写 HTTPS 异步请求数据接口（仅支持 JSONP 请求）。
- 接口数据返回示例见文档下方[正常数据示例](#markdown-doc-%E6%AD%A3%E5%B8%B8%E6%95%B0%E6%8D%AE%E7%A4%BA%E4%BE%8B)。

```html
<mip-infinitescroll data-src="xxx">
    <template type="mip-mustache">
        <li>
            <p>序号{{number}} :{{title}}</p>
            <mip-img src="{{img}}"
                layout="responsive" width="100" height="100">
        </li>
    </template>
    <div class="mip-infinitescroll-results"></div>
    <div class="bg">
        <div class="mip-infinitescroll-loading"></div>
    </div>
</mip-infinitescroll>
```

### 根据返回值判断请求结束
如果数据量未知，可以填写 rn="[Infinity](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Infinity)"， 加载完所有数据后，服务端返回空数据自动停止请求。接口数据返回示例见文档下方[空数据示例](#markdown-doc-%E7%A9%BA%E6%95%B0%E6%8D%AE%E7%A4%BA%E4%BE%8B)。

[warning] 由于 `JSON.parse` 不能解析 `Infinity(number)`，配置需要写成字符串形式 `Infinity`。

```html
<mip-infinitescroll data-src="xxx">
    <script type="application/json">
        {
            "rn": "Infinity"
        }
    </script>
    <template type="mip-mustache">
        <li>
            <p>序号{{number}}: {{title}}</p>
            <mip-img src="{{img}}"
                layout="responsive" width="100" height="100">
        </li>
    </template>
    <div class="mip-infinitescroll-results"></div>
    <div class="bg">
        <div class="mip-infinitescroll-loading"></div>
    </div>
</mip-infinitescroll>
```

### 自定义更多配置
`rn`, `prn`, `timeout`, `loadingHtml`, `template` 等参数可以配置，可选项参考下文“参数配置”。

```html
<mip-infinitescroll data-src="xxx" template="myTemplate">
    <script type="application/json">
    {
        "rn": 40,
        "pn": 1,
        "prn": 6,
        "pnName": "pn",
        "bufferHeightPx": 40,
        "timeout": 5000,
        "loadingHtml": "更多数据正在路上",
        "loadFailHtml": "数据加载失败啦",
        "loadOverHtml": "没有数据了哦"
    }
    </script>
    <template type="mip-mustache" id="myTemplate">
        <li>
            <mip-img src="{{img}}"
                layout="responsive" width="100" height="100">
            </mip-img>
            <p>序号:{{number}}</p>
        </li>
    </template>
    <div class="mip-infinitescroll-results"></div>
    <div class="bg">
        <div class="mip-infinitescroll-loading"></div>
    </div>
</mip-infinitescroll>
```

## 属性

### data-src

说明：异步请求数据接口（仅支持 JSONP 请求）  
必选项：是   
类型：字符串   
取值范围：无   
单位：无   
默认值：无   

### template

说明：与模板 `id` 对应，用来标识所采用的模板，如不设置，则默认取组件子节点中的 `<template>`  
必选项：否   
类型：字符串   
取值范围：无   
单位：无   
默认值：无

## 参数配置

### rn

说明：results number，需要显示的结果总数量  
类型：整数，"[Infinity](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Infinity)" 字符串  
必选项：否   
取值范围：如果填写整数 n，则只会取 n 条数据。如果填写 "Infinity"，则无限加载数据，直到后端没有数据返回   
单位：无   
默认值：20

### pn

说明：page number，请求第几页  
必选项：否   
类型：整数    
单位：无   
默认值：1  

### prn

说明：page result number，每次请求所请求的数据条数       
必选项：否   
类型：整数   
取值范围：无   
单位：无   
默认值：6  

### pnName

说明：翻页关键字            
必选项：否   
类型：字符串   
取值范围：无   
单位：无   
默认值：pn    

### bufferHeightPx

说明：缓冲高度，距离底部一定高度时提前请求数据         
必选项：否   
类型：整数   
取值范围：无   
单位：无   
默认值：10   

### loadingHtml

说明：loading 时提示文案         
必选项：否   
类型：字符串   
取值范围：无   
单位：无   
默认值：加载中...

### loadFailHtml

说明：加载失败时提示文案，当异步请求超时或失败时触发  
必选项：否   
类型：字符串   
取值范围：无   
单位：无   
默认值：加载失败

### loadOverHtml

说明：加载完毕时提示文案         
必选项：否   
类型：字符串   
取值范围：无   
单位：无   
默认值：加载完毕

### timeout

说明：fetch-jsonp 请求的超时时间         
必选项：否   
类型：整数   
取值范围：无   
单位：ms   
默认值：5000

## 内部DOM说明
### `class="mip-infinitescroll-results"`
结果容器 DOM，初始为空。当数据渲染后，作为子节点插入结果容器。

### `class="mip-infinitescroll-loading"`
“加载中”文字容器 DOM，初始为空。当请求发出后，文字容器显示 `loadingHtml` 内容，请求返回后文字容器消失。当请求超时或请求失败时，文字容器显示 `loadFailHtml`。

## 注意事项

- 异步请求接口必须是 HTTPS
- 异步请求接口需要规范 `callback` 为 `'callback'`
- 接口返回的数据格式需要是如下格式：

```
{
    "status": 0, 
    "data": { 
        "items": [{}, {}]
    }
}
```
- status: 0 表示请求成功。
- items: 是需要渲染的数据。

## 异步接口示例

### 正常数据示例
```
{
    "status": 0,
    "data":
    {
        "items": [
        {
            "title": "风信子",
            "img": "https://ss0.baidu.com/6ONWsjip0QIZ8tyhnq/it/u=3495450057,3472067227&fm=5",
            "number": 1
        },
        {
            "title": "紫罗兰",
            "img": "https://ss2.baidu.com/6ONYsjip0QIZ8tyhnq/it/u=3903672296,3890938056&fm=5",
            "number": 2
        },
        {
            "title": "梅花",
            "img": "https://ss2.baidu.com/6ONYsjip0QIZ8tyhnq/it/u=1564909352,2801480363&fm=5",
            "number": 3
        },
        {
            "title": "茉莉花",
            "img": "https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=3761083504,3769519560&fm=5",
            "number": 4
        },
        {
            "title": "栀子花",
            "img": "https://ss2.baidu.com/6ONYsjip0QIZ8tyhnq/it/u=3554982299,3562031081&fm=5",
            "number": 5
        },
        {
            "title": "桃花",
            "img": "https://ss0.baidu.com/6ONWsjip0QIZ8tyhnq/it/u=2475781023,3185445088&fm=5",
            "number": 6
        }]
    }
}
```

### 空数据示例
当不在有数据时，返回如下数据，item 为空数组。
```
{
    "status": 0, 
    "data": { 
        "items": []
    }
}
```
