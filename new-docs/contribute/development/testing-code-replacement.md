# 测试代码替换

在开发组件的时候经常会遇到部分变量或者代码块需要区分线下调试环境和线上生产环境的情况，这时候就需要进行测试代码替换。

MIP CLI 内置了 `webpack.DefinePlugin` 来解决这个问题。在调试模式下（mip2 dev 启动）和 编译模式下（mip2 build），组件代码中 `process.env.NODE_ENV` 的值分别等于 `development` 和 `production`，那么在组件代码里面需要区分线上线下环境的地方通过判断 `process.env.NODE_ENV` 即可。

最常见的就是远程接口请求替换，我们可以这么写：

```js
let api = 'https://path/to/online/api'

if (process.env.NODE_ENV === 'development') {
  api = '/offline/api'
}

fetch(api).then(response => {/* do something */})
```

在编译模式下，`if` 的条件语句会变成：

```js
if ('production' === 'development') {

}
```

再经过 uglify 压缩，这段代码就会被除掉了。

测试代码替换可以配合 MIP CLI 在开发模式下提供的 mock 数据机制来方便开发者进行组件调试。关于 mock 机制的说明和用法请参考文档 [在调试模式下使用 mock 数据](../development/mock-data.md)
