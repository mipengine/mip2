## MIP HTML 规范

MIP规范是高性能 MIP页面的保证，其中最重要的规范是：MIP HTML规范。按照页面功能区域划分，MIP HTML规范主要分为以下列出的若干类型。
- 头部规范；
- 页面元素和属性规范；
- 自定义样式规范。
由于规范长期更新，更多最新规范可查阅MIP官方网站 MIP HTML规范章节。

### 1．头部规范
下面简要列出MIP页头部的使用规范。头部是MIP页的声明、配置信息、资源引入的主要区域。
  - 起始标签使用<!DOCTYPE html>：HTML5页面的唯一头部声明，告知浏览器当前 HTML页面的版本。
  - HTML标签必须加上 MIP标记，即<html mip>：告知搜索引擎此页面是MIP页面。
  - 必须包含<head>和<body>标签：HTML5的标准约定，通过这两个标签进行功能区块划分。
  - 必须在head标签中包含字符集声明: meta charset="utf-8"，字符集统一为utf-8。
  - 必须在head标签中包含 viewport 设置标签: <meta name="viewport" content="width=device-width,initial-scale=1">，推荐包含minimum-scale=1。
  - 必须在head标签中包含<link rel="stylesheet" type="text/css" href="https:// c.mipcdn.com/static/v1/mip.css" >：MIP 框架的主样式表，引入保证页面正常工作。
简单来说，MIP页头部规范包含这几种类型：① HTML5标准规范，HTML5标准规范是MIP页规范的基础，如对<!DOCTYPE html>的强制要求；② 对头部标签的属性限制和扩展，限制一些标签的属性来配合MIP 共同完成页面预期功能，如<meta charset="utf-8">；③ 引入MIP 资源，一般是引入有必要前置的样式表和脚本，同时也可以自定义插入样式。

### 2．页面元素和属性规范
MIP HTML规范对页面的元素和属性进行了约束和限制，目的是最大程度地提升页面性能、保证页面安全、提高开发效率。
对于页面元素来说，MIP HTML规范中主要做了以下几个限制。

（1）强制引用MIP 依赖脚本
必须在body标签中包含<script async src="https://c.mipcdn.com/static/v2/mip.js" </script>，建议使用最新版本的 mip.js 并且放在body的底部。这样做的目的是：引入MIP 主脚本，获得 MIP 最新核心功能；设置为async和放置于body底部，保证脚本的加载不会阻塞页面的加载和渲染，使页面第一时间展示给用户（如果有兴趣，读者可以查阅本书性能优化第六章的内容，也可以查阅首屏优化相关资料）。
（2）禁止使用对页面性能以及安全有较大影响的标签，请将其替换为MIP的特有标签
对于标签的限制是MIP HTML规范的重要部分，对若干性能差、安全性弱、开发不友好的标签限制使用，替换为MIP 提供的组件标签。这样很好地规避了问题，同时，使用MIP 精心设计的组件和其他站点贡献的组件，可以大大减小 MIP页面的开发量。以<img>为例，MIP 强制标签替换为<mip-img>，并且按照组件的使用方式调用。这样 MIP 框架可以对页面的所有图片进行统一管理和优化，如懒加载、webp等。

（3）为了搜索引擎抓取和收录，优化使用特定标签和属性
MIP页面本身具有良好的性能表现，结合搜索引擎和静态cache，性能优势能发挥到极致。对于搜索引擎的优化，主要靠标签的属性设置来告知搜索引擎 MIP页面的相关信息。如强制在head标签中包含 <link rel="canonical" href="https://xxx">，保证搜索引擎知晓 MIP页和HTML5页面的对应关系。

对于页面元素的属性来说，MIP HTML规范主要做了以下两个限制。
① 遵守 HTML5标准规范。
② 禁用事件相关属性on(xxx)。
例如，on、onclick、onmouseover等不能在MIP页使用。MIP 框架会代理主要的页面事件。对于一些影响性能和开发效率的属性，MIP 框架进行了优化，保证对整个页面事件的统一、安全地管理。

（4）MIP HTML中不允许使用style属性
内联 style 影响页面的渲染性能，MIP页中不允许在页面标签上使用style属性，所有的样式必须放置在头部 style标签中统一管理。

### 3．自定义样式规范
如前面所述：出于性能考虑，HTML中不允许使用内联 style，所有样式只能放到head的style标签里。样式在内容渲染前加载，可以减少重绘和回流（感兴趣的读者可以查阅重绘和回流相关资料），大大提升渲染性能。
以下案例从正反两方面说明 style的规范。

正确方式：
```js
<head>
    <style mip-custom>
        p { color: #00f;}
    </style>
</head>
<body>
    <p>Hello World!</p>
</body>
```

错误方式：

```html
<p style="color:#00f;">Hello World!</p>
<p>
    <style>
       p { color: #00f;}
    </style>
</p>
```