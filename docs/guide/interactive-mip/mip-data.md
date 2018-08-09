# mip-data 设置数据

MIP 提供 `<mip-data>` 内置组件用于设置数据源。一个页面中可以使用多个 `<mip-data>`，最终数据会合并到一个数据源对象 `m` 上。MIP 仅支持开发者在 HTML 上使用数据表达式修改数据时使用 `m`（开发者将在后面修改数据的小节中了解到），而开发者自行开发的组件等运行在沙盒环境中的代码，将无法使用 `m` 对象。

数据源的设置可以通过以下两种方式：

## 内嵌数据

内嵌数据是指直接将数据嵌入到 HTML 页面中，提供给标签或自定义组件使用。要求符合 `JSON` 格式，如：

```html
<mip-data>
  <script type="application/json">
    {
      "name": "张三",
      "age": 25,
      "job": {
        "desc": "互联网从业者",
        "location": "北京"
      }
    }
  </script>
</mip-data>
```

## 异步数据

如果需要异步数据，则需指定 `src` 地址，请求回来的数据会自动合并到数据表里，如：

```
<mip-data src="https://www.example.org/data"></mip-data>
```

>**注意：**
> `src` 需要是 `https` 或 `//` 协议开头，否则在 HTTPS 环境下会无法正常加载

当使用这种方式获取异步数据时，请注意：**需要开发者服务端配置 CORS 跨站访问**，具体步骤如下：

- 接收到请求后，判断请求头中的 `origin` 是否是允许的，其中需要允许的域名包括：`https://mipcache.bdstatic.com`、开发者的站点`origin` 、`https://站点域名转换的字符串.mipcdn.com` 。站点域名转换的字符串是指开发者的站点origin通过一定的规则（点.转换为中横线-）转换的字符串，如下面代码中的origins数组所示：origins[1]为开发者的站点origin，origins[2]为转换后的 origin；
- 如果 `origin` 在指定的列表中则设置 `response header` 中的 `Access-Control-Allow-Origin` 为请求接收到的 `origin`，以 Node.js 举例，如下所示：

```javascript
let origins = {
  'https://mipcache.bdstatic.com': 1,
  'https://www-mipengine-org.mipcdn.com': 1,
  'https://www.mipengine.org': 1
}
app.get('/data', function (req, res) {
  let ori = req.headers.origin
  if (origins[ori]) {
    res.header('Access-Control-Allow-Origin', ori)
    res.json({})
  }
})
```