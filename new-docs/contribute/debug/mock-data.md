# 在调试模式下使用 mock 数据

部分组件在开发的时候可能需要向后端发请求，但是在调试组件的时候并不需要获取真实的线上数据进行调试，因此 MIP CLI 提供了一个简单的 mock 数据的方法，这样就可以通过构造简单的线下数据来进行调试了。

具体的使用方法如下：

1. 首先需要在组件代码发请求的地方使用 `process.env.NODE_ENV` 来区分线上和线下请求接口地址：

```js
let req = 'https://path/to/online/api'

if (process.env.NODE_ENV === 'development') {
  req = '/mock/offline-api.json'
}

fetch(req).then(res => {/* do something */})
```

这样在组件开发模式下，会将请求指向 `/mock/offline-api.json` 这个地方。

2. 在组件仓库根目录下准备 mock 文件夹，该文件夹里准备 offline-api.json 文件，文件的内容就是需要 mock 的数据返回结果即可，这样 MIP CLI 提供了静态服务器会直接将这个文件直接返回。这样我们就实现了 mock 数据这样的开发需求。

关于 mock 数据的格式并不一定都是 json 格式，开发者可以根据实际期望的接口返回数据格式来准备 mock 数据文件。

在调试模式下使用 mock 数据需要注意两点：

1. mock 数据的这个功能只会在组件开发模式下生效，不允许在线上逻辑中使用。因此一定要使用 `process.env.NODE_ENV` 来区分开发和线上逻辑；

2. mock 数据一定要放到 `mock` 文件夹下面来明确这些是 mock 数据，放在别的地方将不会访问到。对于多个组件都使用到的 mock 数据，需要在代码仓库根目录下新建 `mock` 文件夹，而对于只有单个组件才会用到的 mock 数据，可以在组件目录（`components/[组件名]/`）下面新建 `mock` 文件夹。
