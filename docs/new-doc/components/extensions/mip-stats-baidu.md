# mip-stats-baidu 百度统计

添加百度统计组件，用于统计页面数据。

标题|内容
----|----
类型| 通用
支持布局|N/S
所需脚本|https://c.mipcdn.com/static/v1/mip-stats-baidu/mip-stats-baidu.js

## 说明

MIP 百度统计组件基于[百度统计 API](http://tongji.baidu.com/open/api/more)，请参照 API 将参数配置在 MIP 页。目前事件追踪支持 `click`, `mouseup`, `load`，其它事件暂不支持。

## 示例

MIP 提供百度统计的插件，便于分析页面数据，需要提前到百度统计这边创建站点，在百度统计后台会自动生成 JS 代码。从中找出 `token` 后插入到 MIP 组件的 `token` 位置。方法为：

``` javascript
// 例：百度统计代码截取
hm.src = "https://hm.baidu.com/hm.js?02890d4a309827eb62bc3335b2b28f7f";
// hm.js? 后为你的统计 token。此例 token="02890d4a309827eb62bc3335b2b28f7f"
```

### MIP 插件引入

```
<mip-stats-baidu>
    <script type="application/json">
        {
            "token": "02890d4a309827eb62bc3335b2b28f7f",
            "_setCustomVar": [1, "login", "1", 2],
            "_setAutoPageview": [true]
        }
    </script>
</mip-stats-baidu>

```

### 事件追踪

事件追踪是百度统计提供的定制化方法，能够统计按钮点击次数。详见[百度统计 API](http://tongji.baidu.com/open/api/)。

[warning] `data-stats-baidu-obj` 要求配置外层为单引号，内层为双引号。或按照下文 **`data-stats-baidu-obj` 双引号配置方法** 处理。

```
<div data-stats-baidu-obj='{"type":"click","data":["_trackPageview", "/virtual/login"]}'>
    点击发送请求
</div>
 
```

## 属性

### token

说明：`token`，从百度统计代码中截取  
必填：是  
格式：字符串  

### _setCustomVar

说明：指定一个自定义变量，用于追踪用户使用行为等。参考([百度统计 API:_setCustomVar](http://tongji.baidu.com/open/api/more?p=ref_setCustomVar))  
必填：否  
格式：数组  

### _setAutoPageview

说明：用户访问一个安装了百度统计代码的页面时，代码会自动发送该页面的 PV 统计请求，如果不希望自动统计该页面的 PV，就可以使用本接口。主要用于 `iframe` 嵌套页面等情况。参考([百度统计 API:_setAutoPageview](http://tongji.baidu.com/open/api/more?p=ref_setAutoPageview))  
必填：否  
格式：数组  

### _trackPageview

说明：用于发送某个指定 URL 的 PV 统计请求，通常用于 AJAX 页面的 PV 统计。参考([百度统计 API:_trackPageview](http://tongji.baidu.com/open/api/more?p=ref_trackPageview))  
必填：否  
格式：数组

### 事件追踪

属性: `data-stats-baidu-obj`

#### type

说明：对应的触发事件(load 加载触发/click 点击触发/mouseup 触发)  
必填：是  
格式：字符串数组  

#### data

说明：用于事件追踪数据传递，参考([百度统计 API](http://tongji.baidu.com/open/api/))  
必填：是  
格式：字符串

备注：`_setAccount` 无需设置，`token` 合法会自动执行 `_hmt.push(['_setAccount',token])`


## 其它使用方式

> 可以正常运行，但不推荐

`token` 获取：

``` javascript
// 例：百度统计代码截取
hm.src = "https://hm.baidu.com/hm.js?02890d4a309827eb62bc3335b2b28f7f";
// hm.js? 后为你的统计 token。此例 token="02890d4a309827eb62bc3335b2b28f7f"
```

### MIP 插件引入

```
<mip-stats-baidu token="02890d4a309827eb62bc3335b2b28f7f"></mip-stats-baidu>

```

### 事件追踪:

[warning] `data-stats-baidu-obj` 要求配置外层为单引号，内层为双引号。或按照下文 **`data-stats-baidu-obj` 双引号配置方法** 处理。

```
<div data-stats-baidu-obj='{"type":"click","data":["_trackPageview", "/virtual/login"]}'>
    点击发送请求
</div>
```

## 属性

### token

说明：`token`，从百度统计代码中截取  
必填：是  
格式：字符串


### setconfig

说明：用于对整个页面统计的操作.如(`_setAutoPageview`, `_setCustomVar`)  
必填：否  
格式：字符串

### 备注

`setconfig` 值必须 `encodeURIComponent` 处理，如 `[_setAutoPageview, true]` 需转化为 ` %5B_setAutoPageview%2C%20false%5D` 字符串传递。

### 事件追踪

属性: `data-stats-baidu-obj`

#### type

说明：对应的触发事件(load 加载触发/click 点击触发)  
必填：是  
格式：字符串数组

#### data

说明：用于事件追踪数据传递参考([百度统计 API](http://tongji.baidu.com/open/api/))  
必填：是  
格式：字符串

#### data-stats-baidu-obj 双引号配置方法

`data-stats-baidu-obj` 值必须 `encodeURIComponent` 处理, 方法如下：

```
// 理想配置
{"type":"click","data":["_trackPageview", "/virtual/login"]};

// 处理配置方法
encodeURIComponent(JSON.stringify({type: "click", data: ["_trackPageview", "/virtual/login"]}))

// 最终DOM配置效果
data-stats-baidu-obj="%7B%22type%22%3A%22click%22%2C%22data%22%3A%5B%22_trackPageview%22%2C%22%2Fvirtual%2Flogin%22%5D%7D"
```
