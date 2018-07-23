# mip-access

`<mip-access>` 能够根据用户访问页面的情况，协同开发者配置接口返回的数据，对页面内容进行访问权限控制，如文章最多能够访问 n 篇，超过之后不能直接访问，需要通过一些策略，如登陆、付费后才能继续。

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本|https://c.mipcdn.com/static/v1/mip-access/mip-access.js

## 示例

[mip-access 示例](https://www.mipengine.org/samples-templates/mip-access/list)

## 使用方式

开发者在使用 `<mip-access`> 组件实现页面内容访问权限控制时，需要通过脚本引入、表达式书写、参数配置等几个步骤，以下分别对这几步做详细讲解：

### 1. 脚本引入

```
<script type="text/javascript" src="https://c.mipcdn.com/static/v1/mip.js"></script>
<script type="text/javascript" src="https://c.mipcdn.com/static/v1/mip-access/mip-access.js"></script>
```

### 2. 表达式书写
`<mip-access>` 是通过表达式计算得出的结果来决定一个元素是否能够展示的，如：

```
<!-- 其中 access 和 subscriber 均为第 3 步中配置的 authorization 接口所返回 -->
<!-- 假如返回数据中 access=true，subscriber=true，则 access AND subscriber 解析为 true，元素展示；否则为 false，元素不展示 -->
<div mip-access="access AND subscriber">展示元素</div>
<!-- 假如返回数据中 access=false，subscriber=false，则 access AND subscriber 解析为 false，元素不展示；否则为 true，元素展示 -->
<div mip-access="access OR subscriber">展示元素</div>
```

表达式中可以使用的运算符在 [access-expr-impl.jison](https://github.com/mipengine/mip-extensions/blob/master/src/mip-access/mip-access-expr-impl.jison) 中全部列举，其中主要运算符如下：

#### 逻辑运算符

运算符|描述|例子
---|---|---
AND|“且”运算|A AND B
OR|“或”运算|A OR B
NOT|“非”运算|NOT A

#### 比较运算符

运算符|描述|例子
---|---|---
=|是否相等|A = B
!=|是否不等|A != B
<|小于|A < B
<=|小于等于|A <= B
\>|大于|A > B
\>=|大于等于|A >= B

### 3. 参数配置
`<mip-access>` 使用时需要配置一些参数才能够进行使用，这些参数配置在 `<script id="mip-access" type="application/json"></script>`，如：

```
<script id="mip-access" type="application/json">
{
    "authorization": "https://publisher.com/mip-access/api/mip-authorization.json?rid=READER_ID&url=CANONICAL_URL",
    "pingback": "https://publisher.com/mip-access/api/mip-pingback?rid=READER_ID",
    "login": "https://publisher.com/mip-access/login/?rid=READER_ID&url=CANONICAL_URL",
    "authorizationFallbackResponse": {
        "error": true,
        "access": false
    }
}
</script>
```

其中涉及到的参数及其对应的功能描述列举如下：

#### authorization

授权接口（数据接口）。该接口返回的数据提供给第 2 步中的表达式解析使用，接口返回的数据名可直接写在表达式中，然后 MIP 会自动根据返回数据进行解析，如：

```
<!-- authorization 接口返回的数据 -->
{
    login: true,
    access: false
}

<!-- 表达式书写，以下表达式解析为 false，元素不展示 -->
<div mip-access="login AND access">展示元素</div>
```

#### pingback

计数接口。该接口触发的时机是在 authorization 接口数据返回成功，同时页面表达式解析完成之后。该接口的作用主要是通知开发者，当前页面（文章）已经访问完成，可以采取策略来控制（为下一篇文章的展现做数据准备），如接到计数接口请求之后，使免费文章总访问减 1，然后访问下一篇文章时再请求 authorization 接口，里面的数据就已是减 1 之后的。

#### noPingback

是否需要在页面表达式解析完成后发出 pingback 请求，设置为 true 则是不需要。

#### login
登陆相关接口，可以是一个字符串，用于配置登录页面地址。也可以是一个对象，其中配置登录和登出的页面地址，如:

```
"login": {
     "login": "https://publisher.com/login.html?rid={READER_ID}",
     "logout": "https://publisher.com/logout.html?rid={READER_ID}"
}
```

#### authorizationFallbackResponse

如果 authorization 接口请求失败，开发者也可以配置备用数据，通过备用数据决定页面内元素的展现，如：

```
<!-- 备用数据 -->
"authorizationFallbackResponse": {
    "error": true,
    "access": false
}
<!-- 表达式书写，以下表达式解析为 false，元素不展现 -->
<div mip-access="error AND access">展示元素</div>
```

#### authorizationTimeout

authorization 接口请求超时时间，默认为 3s。

### URL 参数

`<mip-access>` 同样为 URL 定制了一些常量，可以允许开发者直接在 URL 中进行使用，如：

```
<!-- 设置的 URL -->
https://www.mipengine.org/?rid=READER_ID&url=SOURCE_URL"
<!-- 解析后的 URL -->
https://www.mipengine.org/?rid=mip-142313cb090fa43b7ebecee9089f15b0&url=https%3A%2F%2Fwww.mipengine.org%2F"
```

具体可使用的参数如下：

- READER_ID: 获取访问用户的 ID，该 ID 是可以理解为区分用户的唯一标示，通过 localStorage 的进行存储（清除 localStorage 后会再次生成）。
- SOURCE_URL: 当前页面 URL，即 `window.location.href`。
- MIPDOC_URL: MIP 原站点 URL，非 MIP-Cache URL。
- CANONICAL_URL: MIP 站点对应的原 h5 站点 URL，如果 h5 站点不存在，则为当前页面 URL。
- DOCUMENT_REFERRER: 页面访问的 referer。
- RANDOM: 随机数。

## 注意点

- 请求如何配置？

    `<mip-access>` 中所有接口的请求都依据 [cors](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch) 方案，需要后端配置 `Access-Control-Allow-origin` 为允许的 origin，其中包括 `mipcache.bdstatic.com` 、 `*.mipcdn.com` 和 站点自身 URL origin。

## 属性

### mip-access

说明：控制 DOM 元素展示或隐藏的计算表达式      
必选项：是   
类型：字符串   
单位：无   
取值：无   
默认值：无

### mip-access-hide

说明：DOM 元素在表达式计算完成之前默认是展现的，如果在这段时间里希望隐藏元素，则通过设置该属性即可   
必选项：否   
类型：字符串   
单位：无   
取值：无   
默认值：无
