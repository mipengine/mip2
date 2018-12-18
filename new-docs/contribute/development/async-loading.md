# 模块异步加载

一般情况下，一个 MIP 组件所依赖的所有代码经过编译之后，会全部打包拼合到入口文件中。因此假设两个组件都引用了 lodash，那么编译完成后，这两个组件代码内部将各有一份 lodash 代码，造成组件代码体积过大。或者是组件的首屏渲染并不需要依赖某些体积过大的资源，可以考虑等首屏渲染结束之后再去异步加载。

MIP CLI 针对这类情况提供了异步加载机制，通过函数 `import()` 异步加载 lodash，那么在最终打包的时候，lodash 将生成独立文件，而不会这两个组件的代码中。举个例子，假设 mip-sample.js 需要在 connectedCallback 阶段异步加载 lodash，那么可以这么写：

```javascript
connectedCallback () {
  import('lodash').then(function (_) {
    console.log(_.VERSION)
  })
}
```

这样在 lodash 将在组件执行到生命周期 connectedCallback 时才会去异步加载。异步加载完毕后，将会在控制台输出 lodash 的版本号。假设多次调用`import('lodash')`，那么只会发送一次资源请求，其余的直接从缓存中读取。
