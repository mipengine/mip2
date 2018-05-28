# mip-list 列表组件

可以渲染同步数据，或者异步请求数据后渲染。

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, fill, container, fixed
所需脚本|https://c.mipcdn.com/static/v1/mip-list/mip-list.js<br/> https://c.mipcdn.com/static/v1/mip-mustache/mip-mustache.js

## 示例

### 基本用法

[info]JSONP 异步请求的接口需要遵循规范 `callback` 为 `'callback'`。

```html
<mip-list src="https://xxx" preLoad>
    <template type="mip-mustache">
        <div>
            <li>name: {{name}}</li>
            <li>alias: {{alias}}</li>
        </div>
    </template>
</mip-list>
```

### 定制模板

```html
<mip-list template="mip-template-id" src="https://xxx" preLoad>
    <template type="mip-mustache" id="mip-template-id">
        <div>
            <li>name: {{name}}</li>
            <li>alias: {{alias}}</li>
        </div>
    </template>
</mip-list>
```

### 同步数据

```html
<mip-list synchronous-data>
    <script type="application/json">
        {
            "items": [
                {
                    "name": "lee",
                    "alias": "xialong"
                }, {
                    "name": "ruige",
                    "alias": "ruimm"
                }, {
                    "name": "langbo",
                    "alias": "bobo"
                }
            ]
        }
    </script>
    <template type="mip-mustache">
        <div>
            <li>name: {{name}}</li>
            <li>alias: {{alias}}</li>
        </div>
    </template>
</mip-list>
```

### 点击加载更多

[info]有 `has-more` 属性时，`<mip-list>` 标签必须要有 `id` 属性，同时需要有点击按钮的 DOM 节点，并且此节点有 `on` 属性，属性值为：`tap:对应mip-list的id.more`

```html
<mip-list 
    template="mip-template-id"
    src="http://xxx?a=a&b=b"
    id="mip-list"
    has-more
    pnName="pageNum"
    pn=2
    timeout="3000"
    preLoad>
    <template type="mip-mustache" id="mip-template-id">
        <div>
            <li>{{key}}: {{value}}</li>
        </div>
    </template>
</mip-list>
<div class="mip-list-more" on="tap:mip-list.more"> 点击查看更多 </div>
```

## 属性

### src

说明：异步请求的数据接口，如果没有其他参数结尾请不要带 `？`      
必选项：否    
类型：字符串    
取值范围：必须是 HTTPS 的    
单位：无    
默认值：无

### synchronous-data

说明：使用同步数据开关属性    
必选项：否    
类型：字符串    
取值范围：无    
单位：无    
默认值：无 

### id

说明：`<mip-list>` 组件 `id`    
必选项：否    
类型：字符串    
取值范围：字符串    
单位：无    
默认值：无

### has-more

说明：是否有点击展开更多功能   
必选项：否    
类型：字符串    
取值范围：无    
单位：无    
默认值：无

### pnName

说明：翻页变量名     
必选项：否    
类型：字符串    
取值范围：无    
单位：无    
默认值：pn

### pn

说明：翻页初始页码，每次请求会自动加 1     
必选项：否    
类型：整数    
取值范围：无    
单位：无    
默认值：1 

### preLoad

说明：异步加载数据，如果添加 `preLoad` 参数，则在初始化时加载第一页内容     
必选项：否    

### timeout

说明：fetch-jsonp 请求的超时时间         
必选项：否   
类型：整数   
取值范围：无   
单位：ms   
默认值：5000

## 注意事项

- 接口返回的数据格式需要是如下格式：
    - status：0 表示请求成功。
    - items：[] 是需要渲染的数序。
    - isEnd：表示是否是最后一页，非必须。

```
{
    status: 0, 
    data: { 
        items: [], 
        isEnd: 1 
    }
}  
```    
