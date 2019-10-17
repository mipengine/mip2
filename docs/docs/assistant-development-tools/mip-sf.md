# SuperFrame 调试环境

*项目地址：[mip-cli-plugin-sf](https://github.com/mipengine/mip-cli-plugin-sf)*

MIP 页面在上线到搜索结果页之后，需要嵌入在 SuperFrame (简称 SF) 环境下运行。因此在开发后期，为了保证 MIP 页面的效果在上线后能保持一致，有必要创建一个线下 SF 调试环境并运行目标页面。

在 MIP 官网 [https://www.mipengine.org/debug](https://www.mipengine.org/debug) 已经有这样一个线下 SF 调试环境，但有一个最大的问题：MIP 官网是 `https` 协议，当使用线下调试并且目标页面地址是 `http` 协议或者干脆 `localhost` 时，浏览器会阻挡请求，因为从 `https` 请求 `http` 是不安全的，影响了正常调试。而事实上，`http` 协议或者 `localhost` 又是开发时最最常用的情况。

为了解决这个问题，我们应该在开发者本地启动一个服务。因为本身就启动在 `localhost`，因此无论是 `http` 还是 `https` 都是可以正常运行的，也就提供了 SF 线下调试和预览的机会。

## 快速开始

1. 全局安装 `mip2` 命令行工具

    `npm i mip2 -g`

2. 启动线下 SF 调试环境

    `mip2 sf`

3. 使用浏览器访问 (默认端口 8210)

    `http://localhost:8210/sf`

    ![](https://gss0.baidu.com/9rkZbzqaKgQUohGko9WTAnF6hhy/assets/mip/tools/mip-sf.png)

4. 在 URL 输入框 (第一个) 输入目标页面的 URL。__切记带上协议头，即 `http` 或者 `https`__

    例如 `http://localhost:8080/examples/page/index.html`

5. 点击最下方的“出发测试”按钮

    浏览器地址栏会变成 `http://localhost:8210/wishwing/c/xxxx`，而页面如下：

    ![](https://gss0.baidu.com/9rkZbzqaKgQUohGko9WTAnF6hhy/assets/mip/tools/mip-sf-view.png)

    从地址栏和页面右上角的更多（三个点）按钮都可以发现，页面已经位于 SuperFrame 环境内了。之后的页面跳转操作也可以正常进行。

## 支持链接的分享

有时候一个 MIP 页面是由多位开发者共同完成的，所以可能会有开发者 A 想把调试链接分享给开发者 B 的情况，直接分享 `http://localhost:8210/sf` 的话还需要 B 重新在 URL 框中输入地址，略微麻烦。因此这里我们还支持了 `url` 参数。

你可以直接分享 `http://localhost:8210/sf?url=xxxx` 给你的同事，当然前提是他也在 `localhost` 启动着服务。或者如果你们处于同一个网段，你把自己的内网 IP 地址替换 `localhost` 分享给同事（例如 `http://172.18.xx.xx:8210/sf?url=xxxx`），也是一个可行且简便的方案。

## 一些概念和选项的解释说明

* 线上/线下测试

  MIP 页面在上线后，会由 mip-cache 系统把页面及其使用的资源全部转存到 CDN 中，并生成一个额外的 URL，我们称之为 `CACHE URL`，与之相对，原来的 URL 就称为 `原始 URL`。

  举个例子，开发者开发了一个站点，入口页面为 `https://www.somesite.com/mip`，这就是 __原始 URL__。 上线并提交审核，同意收录之后，mip-cache 会把这个站点转存到 CDN 中，生成一个类似 `https://www-somesite-com.mipcdn.com/c/s/xxx` 之类的一个 URL，这就是 __CACHE URL__。注意到两个 URL 的域名并不相同，但当中有一些转化规则，可以让两者互相转化。这个规则开发者并不需要过多关心。

  所谓线上测试，就是使用 SF 环境打开 CACHE URL，因此主要针对上线之后的站点。而所谓线下测试，则是使用 SF 环境打开原始 URL，因此主要针对上线之前，开发状态的站点。开发者应该大部分情况使用的是线下测试。

  使用线上测试时， 会检查当前域名是否是百度域 (`*.baidu.com`)，如果不是，会返回 403 阻止请求。__因此想使用线上测试时，使用 `localhost` 是不行的。开发者需要配置 host，把例如 `test.baidu.com` 指向 `127.0.0.1`，之后使用 `test.baidu.com:8210/sf` 进行访问才可以正常显示页面。__

  另外，上述提到的原始 URL 和 CACHE URL 都是 iframe 的 `src`。最外层的 URL（即浏览器地址栏内的地址）是类似于 `/wishing/xxxxx`。这个 URL 和内部 MIP 页面关系并不大，作为 MIP 开发者不必过多关注。

* 目标页面的 LOGO URL 和标题

  在调试页面，除了 URL 输入框和最后的测试按钮之外，当中还有两个选填框。这是为了在点击测试，到实际展现页面之前，中间那个 SF 的 Loading 页面上显示 LOGO 和标题所用的。之所以选填，也是因为对实际测试影响很小，不追求完美的开发者可以忽略。

## 其他参数

* 指定端口号

  `mip2 sf -p 8080`

  可以在指定端口号启动 SF 调试服务，例如上面的命令可以用 `http://localhost:8080/sf` 进行访问。

* 启动后自动打开网页

  `mip2 sf -o`

  可以在命令启动后自动调用默认浏览器打开指定的 URL，例如 `mip2 sf -o http://localhost:8210/sf` 可以自动打开调试首页。
