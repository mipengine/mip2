# MIP Access 原理剖析

## 什么是 MIP Access

MIP Access 由 MIP 团队开发的一种页面访问权限控制机制，能够允许网页发布者在页面元素中定义内容标记，并结合用户访问情况进行综合评价，从而展现或隐藏页面中内容，直至用户登录、订阅或付费后才能够查看隐藏内容的一种全新阅读模式。

## 优势在哪里

1. 方式新颖：页面中任何元素都能加入权限控制标记，并根据标记解析情况进行展示或隐藏，打破了传统阅读只展示前 n 个字的模式。
2. 形式多样：页面内容可以是任何元素，包括纯文本、图片、视频等。
3. 数据驱动：内容展现与否直接与发布者配置的数据相关联，根据解析情况决定是否展示相应元素。
4. 配置灵活：发布者可以根据不同的需求配置不同接口，如数据请求接口、访问记录接口、登录页面、退出页面等。

## 名词解释

在讲具体细节之前，大家先熟悉熟悉这些专有名词吧！

**Access Runtime**: 运行环境。
**MIP Access JS**：运行环境。
**Access Content Markup**: HTML 中以属性形式定义的，规定访问权限的标示。
**Authorization endpoint**: 授权接口，返回 markup 解析所需要的数据。
**Pingback endpoint**: 计量接口，存储访问相关信息。

## 使用方式

### 1. 开发者实现接口

所有接口的请求都依据 [CORS](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)方案，包括Authorization 接口(返回解析 DOM 元素展示与否的数据)、Pingback 接口，登录退出接口。

### 2. 引入MIP 脚本

如下面代码如所示：

```html
<script type="text/javascript " src="https://c.mipcdn.com/static/v1/mip.js"></script>
<script type="text/javascript " src="https://c.mipcdn.com/static/v1/mip-access/mip-access.js"></script>
```

### 3．定义 script 配置标签，并配置以下信息

如下面代码所示：

```html
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

1. authorization：授权接口，返回 MIP Access 表达式中需要进行计算的数据。
2. pingback：计量接口，每次访问页面之后，通过该URL发送请求到开发者服务器，由其对数据进行管理，如每访问一次计数减1。
3. noPingback：是否允许计量。
4. login：登录相关接口，可以是一个 map，如下面代码所示

```json
"login": {
  "login": "https://publisher.com/login.html?rid={READER_ID}",
  "logout": "https://publisher.com/logout.html?rid={READER_ID}"
}
```

5. authorizationFallbackResponse：如果 Authorization 接口请求失败，需要在这里配置相关接口参数作为后备，如下面代码所示。

```js
"authorizationFallbackResponse": {
  "error": true,
  "access": false
}
```

6. authorizationTimeout：Authorization 接口请求超时时间，默认为 3s。

### 4.以 mip-access 属性来书写表达式

如下面代码所示：

```html
<div mip-access="access AND subscriber">…</div>
```

## 实现细节

![MIP Access 实现的时序图](./images/mip-access.png)

上图为纯前端方式实现 Access 的时序图，用户在访问页面时，第一时间从服务器下载 HTML 文档并展示在浏览器上，而不是先通过 Access 机制处理后再进行展示，这样做的目的让用户能够第一时间看到页面，缩短页面展现的白屏时间。

在页面加载完成之后(DOM Ready 阶段)，MIP Access 运行环境自动执行，并将页面中以 `mip-access-hide` 属性标记的所有 DOM 元素筛选出来并隐藏，同时根据开发者提供的 Authorization 接口发起请求(该请求地址由开发者在页面指定的 script 中进行配置)，接口的主要作用是拿到解析 mip-access 表达式的数据。

Authorization 接口如果请求成功，筛选出页面中使用 `mip-access` 属性定义的元素，并根据 `mip-access` 中的表达式进行解析，解析结果为布尔值，如果结果为 `true` 则展示元素，否则隐藏；

如果请求失败，MIP 运行环境会寻找配置信息中的 `authorizationFallbackResponse` 字段，其值为一个 JSON 字符串，将该字符串进行 JSON 解析后作为解析 `mip-access` 表达式的数据；如果 `authorizationFallbackResponse` 未定义则解析失败。

最后一步是待页面加载完成后发起 Pingback 请求(该请求地址同样是由开发者在页面指定的 script 中进行配置)，这一步的主要目的是把页面访问信息记录到开发者后端数据库，并通过访问信息决定下一个页面的展示策略。如果开发者配置了 `noPingback:true` 的选项，则不会发起 Pingback 请求；否则发起请求并将数据传递给开发者服务器进行保存，待下次访问文章时根据存储的状态返回相应的数据以决定页面展示策略。

## 适用范围

目前来说，纯前端的 Access 实现方案适用一些不涉及用户信息和收费业务相关的简单页面，通过该方式可以自由化地配置页面中元素的展现方式，出于安全考虑和后续的需要，我们后续也会根据需求量采用 **前端 + server** 的处理方式处理 HTML 文档。
