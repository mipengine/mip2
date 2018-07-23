# MIP 页面编写规范

1. 所有页面 __必须__ 包含 `<html>`, `<head>`, `<body>`，组织方式和常规 HTML 相同：

    ```html
    <html>
        <head></head>
        <body></body>
    </html>
    ```

2. 所有页面 __必须__ 在 `<body>` 的 __最后__ 编写或引用 mip 相关的 js。其中顺序是：
    1. mip.js
    2. 各组件的 js。如有相互依赖，把被依赖项写在前面。

    举例来说，一个页面引用了两个组件 `component-a` 和 `component-b`，并且 `component-b` 依赖 `component-a` （例如在 `component-b` 的模板中出现了 `<mip-component-a>`），那么这个页面的组织结构应该是：

    ```html
    <body>
        <!-- DOM or MIP Component -->
        <script type="text/javascript" src="https://somecdn/mip.js"></script>
        <script type="text/javascript" src="https://somecdn/mip-component-a.js"></script>
        <script type="text/javascript" src="https://somecdn/mip-component-b.js"></script>
    </body>
    ```

3. MIP 页面中的链接依然使用 `<a>`，具体如下：

    1. 如果跳转到其他 __同域名的 MIP 页面__，使用 `mip-link` 属性或者 `data-type="mip"`：
        ```html
        <a href="https://somesite.com/mip/anotherMIPPage.html" mip-link>xxx</a>
        <a href="https://somesite.com/mip/anotherMIPPage.html" data-type="mip">xxx</a>
        ```
        1. `href` 指向当前域名的页面
        2. 不允许使用 `target` 属性

    2. 如果跳转到其他页面 ，不添加 `mip-link` 属性或者 `data-type="mip"`，进行普通跳转：
        ```html
        <a href="https://www.another-site.com/">Jump Out</a>
        ```

    3. `href` 属性值沿用[旧版 mip-link 规范](https://www.mipengine.org/examples/mip-extensions/mip-link.html)，取值范围：`https?://.*`, `mailto:.*`, `tel:.*`，__不允许使用相对路径或者绝对路径__。(如 `./relativePage.html`, `/absolutePage.html`)

    4. 和默认浏览器行为相同， `<a>` 也可以用作页面内部的快速定位滚动，只需要将 `href` 中包含 `#` 即可，如 `http://somesite.com/mip/page.html#second`。特别地，`#second` 作为 `href` 取值范围的例外也被认为合法，可以用作当前页面的快速定位。

    5. 默认情况下点击链接后会向 History 中 `push` 一条记录。如果想覆盖当前记录，可以在 `<a>` 元素上增加 `replace` 属性。

    6. 通过 `data-title` 和 `innerHTML` 可以设置下一个页面的标题。(详情可见 [MIP Shell 相关章节](./5-mip-shell.md))

4. 页面内元素的样式中 `z-index` 不能超过 10000，否则会引起页面切换时的样式遮盖问题。
