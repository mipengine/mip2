# 3. 项目初始化页面

通过前面两步，开发者可以初步预览到初始化项目的一个页面，如果要更好的开发，我们还需要对初始化的项目结构有一定的了解

1. 初始化项目结构

    ![myproject](http://bos.nj.bpc.baidu.com/assets/mip/codelab/project.jpg)


2. 如下图所示，初始化项目的预览页面 `example/index.html` 中给出了 MIP 页面的一个最基本的格式。

  - 开发时，可以在页面中直接修改页面 html 内容

    > 开发中需要遵循 MIP 的开发规范，[详细开发规范](../../guide/mip-standard/mip-html-spec.md)

  - 通过自定义标签的方式引入内容（如 `<mip-example>` 标签）

    > 开发自定义组件，详细请参照[如何开发自定义组件](../component-development/introduction.md)

    > MIP 提供了部分内置组件及个性化组件，方便开发者使用


  ``` html
<!-- 声明头必须 -->
<!DOCTYPE html>

<!--  mip 属性必须-->
<html mip>
  <head>
    <!-- utf-8 编码必须 -->
    <meta charset="utf-8">

    <!-- viewport 设置必须 -->
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">

    <title>MIP page</title>

    <!-- 必须：指向原h5页面链接 或 没有原页面指到当前页面链接，便于合并统计 -->
    <link rel="canonical" href="对应的原页面地址">

    <!-- 引入样式 mip.css 必须 -->
    <link rel="stylesheet" href="https://c.mipcdn.com/static/v2/mip.css">

    <!-- 若需自定义样式，mip-custom 属性必须-->
    <style mip-custom>
      /* 自定义样式 */
      h2 {
        margin: 50px auto;
        text-align: center;
      }
    </style>
  </head>

  <body>
    <div>
      <h2>First MIP page</h2>
      <h2>Add MIP components here</h2>

      <!-- 自定义组件引入方式 -->
      <mip-example></mip-example>

    </div>

    <!-- body的底部引入 mip.js 文件必须 & 自定义组件的 .js 文件 -->
    <script src="https://c.mipcdn.com/static/v2/mip.js"></script>
    <script src="/mip-example/mip-example.js"></script>

  </body>
</html>
  ```

> 下一节我们尝试应用内置组件，修改页面内容，加深大家的印象。

