# mip-data MIP 数据加载

页面数据加载器，是 MIP 数据驱动机制的组成部分。

标题 | 内容
----|----
类型|通用
支持布局|nolayout
所需脚本|内置

## 简介

在 [MIP 数据驱动机制](../../docs/interactive-mip/data-driven.md) 当中，应首先定义好初始化数据，接下来才能够对这些数据进行操作。mip-data 就是用于加载这些数据的组件。

页面可以定义多个 `<mip-data>`，不同的数据块在各自的数据源解析加载完成后，自动合并到同一个 store 当中，因此应该尽量避免字段重复的情况。

### 合并规则

具体的数据合并规则为：

1. 当新旧属性值类型不同时，新属性值将会直接覆盖旧属性值；
2. 当新属性值为字符串、数字、数组和 null 时，新属性值将直接替换旧属性值；
3. 当新旧数据的属性的值均为字面量对象时，将会对子对象进行递归合并；

例如：

```html
<mip-data>
  <script type="application/json">
  {
    "a": 1,
    "b": [{c: 1}],
    "d": {
      "e": 3,
      "f": 4
    }
  }
  </script>
</mip-data>
<mip-data>
  <script type="application/json">
    {
      a: 'abc',
      b: [{d: 1}],
      d: {
        f: 5,
        g: 6
      }
    }
  </script>
</mip-data>
```

两组数据合并后，`<mip-data>` 所存的数据为：

```js
{
  a: 'abc',
  b: [{d: 1}],
  d: {
    e: 3,
    f: 5,
    g: 6
  }
}
```

[info] 所以对于需要替换整个对象的这类需求，为避免对象的递归合并造成替换失败，可以将替换对象放到一个数组里，再对数组做替换操作。

## 示例

数据定义有两种方式，同步数据和异步数据。

### 同步数据

同步数据需要在 `<mip-data>` 内定义 `<script type="application/json">` 数据块，这些数据块需要符合 `JSON` 所要求的数据格式，只包括 String、Number、Object、Array、null，而 Date、RegExp、Function、undefined 这些都是不允许的。如：

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

### 异步数据

可以在 `<mip-data>` 定义 `src` 属性去指定异步加载的数据源，请求链接需要满足三个条件：

1. 支持 HTTPS;
2. 服务端配置 CORS 跨站访问许可；
3. 支持 GET 请求；
4. 返回的数据格式必须是 `JSON` 格式；

这是因为 MIP 页面被 MIP-Cache 抓取缓存之后，被缓存的页面会以 MIP CDN 的 URL，这个 URL 是 HTTPS 的，因此要求发送的请求也同样需要 HTTPS。（仅当使用 127.0.0.1 的本地接口进行调试时可使用 HTTP），同时在这种情况下的资源请求必然存在跨域，因此需要服务端配置 [CORS 跨站访问许可](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)。

```html
<mip-data src="https://path/to/your/data"></mip-data>
```

控制异步数据加载的属性还包括：

1. `credentials`: `{string}` [fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch) 的 credentials 参数，默认值为 `omit`；
2. `timeout`: `{number}` 请求超时的时长，单位是 ms（毫秒），默认为 `5000`；

例如：

```html
<mip-data
  src="https://path/to/your/data"
  credentials="include"
  timeout=3000
></mip-data>
```

当数据加载失败时（数据格式错误、超时、请求 404 等等），会抛出 `fetch-error` 事件，可以通过 `on` 表达式进行事件监听：

```html
<mip-data
  src="https://path/to/your/404/data"
  on="fetch-error:MIP.setData({ msg: '数据加载出错' })"
></mip-data>

<!-- 打印错误提示 -->
<p m-text="msg"></p>
```

同时在配置了 `src` 属性的情况下，`<mip-data>` 还支持 `refresh` 方法对数据进行重新加载，重新加载的数据会根据前面提到的合并规则与原数据进行合并：

```html
<mip-data
  id="userInfo"
  src="https://path/to/your/data"
></mip-data>

<button on="tap:userInfo.refresh">点击刷新</button>
```

### 范围数据

`<mip-data>` 支持定义范围数据，具体做法是配置 `id` 和 `scope` 属性进行范围声明。其中 `id` 是用来标识数据的命名空间，`scope` 是用来声明

```html
<mip-data id="userInfo" scope>
  <script type="application/json">
  {
    "name": "Li,Lei"
  }
  </script>
</mip-data>
```

这样，这个 `<mip-data>` 数据块的内容将会全部放到 `userInfo` 字段下面。比如在数据绑定表达式里面，就可以通过 `userInfo.name` 获取数据：

```html
<span m-text="'你好，' + userInfo.name"></span>
```

[notice] `<mip-data>` 的 `id` 属性应该与变量命名要求保持一致，推荐采用驼峰命名法。比如中横线命名、中文命名的 id 将会导致数据无法通过数据绑定表达式获取。

## 属性

### id

说明：数据源名字空间，需配合 scope 属性一起使用<br>
必选项：否<br>
类型：字符串，需符合 JS 变量命名规则<br>
单位：无<br>
默认值：无

### scope

说明：标识数据源是否挂载到名字空间上，只有当设置了 id 时生效<br>
必选项：否<br>
类型：布尔<br>
单位：无<br>
默认值：无

### src

说明：数据源地址，数据源需配置 CORS 跨域支持，并且要求为 HTTPS<br>
必选项：否，在同步数据的方式下无需指定 src<br>
类型：字符串<br>
单位：无<br>
默认值：无

### credentials

说明：发送数据请求时 fetch 方法的 crendentials 参数<br>
必选项：否<br>
类型：字符串<br>
单位：无<br>
默认值：'omit'

### timeout

说明：发送请求的超时时间<br>
必选项：否<br>
类型：数字<br>
单位：ms<br>
默认值：5000<br>

## 可绑定属性

### src

说明：切换 src 时，会自动触发数据重新加载，并且将加载到的数据与原数据进行**递归合并**。

## 事件

### fetch-error

说明：当远程数据加载失败时抛出该事件
数据：错误信息 e

## 方法

### refresh

说明：重新加载当前 src 所对应的远程数据，并且将加载到的数据与原数据进行**递归合并**。如果没有配置 src，则不会进行任何操作。

