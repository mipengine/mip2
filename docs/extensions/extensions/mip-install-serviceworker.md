# mip-install-serviceworker

`<mip-install-serviceworker>` 是实现离线可用的组件。

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本|https://c.mipcdn.com/static/v1/mip-install-serviceworker/mip-install-serviceworker.js

## 示例

### 基本用法

```
<mip-install-serviceworker src="/sw.js"
    data-iframe-src="https://mipexample.org/sw.html"
    layout="nodisplay"
    class="mip-hidden"
    data-no-service-worker-fallback-url-match=".*\.html"
    data-no-service-worker-fallback-shell-url="https://mipexample.org/shell/"
></mip-install-serviceworker>

<a href="https://mipexample.org/some/path/index.html">mip example link1</><br/>
<a href="http://mipexample.org/some/path/index.html">mip example link2</a><br/>
<a href="https://another.mipexample.org/some/path/index.html">mip example link3</>
```

## 属性

### src

说明：Service Worker 文件的路径，如果不在缓存路径下打开，会采用 `src` 注册 Service Worker  
必选项：否  
类型：字符串

### data-iframe-src

说明：安装 Service Workder 的页面地址，在缓存下打开，由于不同域，无法直接注册，所以采用 `<iframe>`  
必选项：否  
类型：字符串

### data-no-service-worker-fallback-url-match

说明：当当前环境不支持 Service Worker 的时候，可以通过制定一个特殊的同源 shell 页面，提前加载这个 shell 页面进行浏览器缓存，可以通过 `data-no-service-worker-fallback-url-match` 属性指定需要跳转到该 shell 页面的规则，该属性为正则表达式  
必选项：否  
类型：正则表达式

### data-no-service-worker-fallback-shell-url

说明：指定的 shell 页面的 url, 需要和 mip 页面保持同源，当该 shell 页面加载完成之后，有必须通过 url hash 后的参数 redirect 到原页面的逻辑  
必选项：否  
类型：字符串

## 工作机制

在这个组件里，提供了 `src` 和 `data-iframe-src` 两个属性，如果要让 Service Worker 能顺利注册，里那个属性都需要填写，因为 MIP 页不仅在搜索环境下打开，还可以被直接访问。

如果是直接通过 MIP 页的地址访问，以为着 Service Worker 的域名和当前站点一致，可以直接注册，这个时候我们需要 `src` 属性，会直接进行注册，如下：

```javascript
navigator.serviceWorker.register(src)
```

但是，MIP 页不仅能直接访问，还能被百度搜索缓存在 CDN 上，如果通过百度搜索结果页打开，那么这个这个页面的域名就不是站点本身的域名，无法通过 `navigator.serviceWorker.register` 直接注册，在这里我们通过嵌入站点自身的 iframe 来解决域名不同的问题，通过 iframe 来注册 Service Worker，提前缓存站点资源，这个 iframe 的地址就是 `data-iframe-src` 属性， iframe 页面内容可以很简单，如下：

```html
<script>
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/sw.js');
}
</script>
```
