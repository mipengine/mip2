# 沙盒机制

MIP 以浏览体验与加载速度为优先考量点，因此在组件开发的时候，MIP 只开放了部分原生 JS 供组件开发者使用，以尽量避免组件开发出有悖 MIP 站点体验的组件。这个实现部分开放原生 JS API 的机制就是 MIP 的加载机制。

## 部分开放的 JS API

1. MIP 鼓励使用 JS 进行计算，进行逻辑实现等等。因此这类工具型 API、数据结构对象等等具有完全的功能，比如 Math.*、Array、Object、Map、RegExp、setTimeout、setInterval、encodeURI 等等。

2. DOM 操作相关提供限制型功能，因为部分属性读取和节点插入删除等等会频繁触发重绘重排，因此需要进行一些限制。MIP 对于这类 API 比较谨慎，会采取逐渐从严的措施收敛此类 API 的开放，并引导开发者使用 MIP 封装好的 API 、引导开发者使用别的方式去实现或者下架相关功能等等。具体操作上可能是官网通告，使用组件的站点对应控制台提示 `[deprecated]` 声明等等。开发者在使用这类函数时，应首先查阅 MIP API 文档看看是否已经有相关的功能实现。

3. 比如 `alert` 会打断视图并且阻塞 UI 线程；`document.write` 修改注入代码；`document.create('script')` 插入未经审核的第三方 JS 等等；location 修改 URL 等等，这些行为有的会严重降低 MIP 站点体验，有的绕过了 MIP 的监管或者影响了 MIP 的机制等等，这些行为都是 MIP 不鼓励并且禁止的。开发阶段 CLI 工具会直接在控制台报错，对应的代码逻辑即使上了线，对应的功能也不会生效并且直接抛出异常。

4. MIP 采用白名单机制来限制 JS API，总的来说，MIP 对于视图展现、前后端通信等等基本上给予充分的自由度，开放的 JS API 基本满足绝大部分 MIP 组件开发。不在白名单上的 API 默认不可用。开发者可以向 MIP 提出白名单申请，我们会基于 MIP 的优先考量点并且持谨慎态度进行讨论研究，然后选择通过或者打回。

目前白名单的地址请参考 [mip-sandbox](https://www.npmjs.com/package/mip-sandbox#%E5%8F%AF%E7%94%A8%E5%85%A8%E5%B1%80%E5%8F%98%E9%87%8F)。

## 沙盒机制说明

相关工具：

1. [mip-cli](https://github.com/mipengine/mip2/tree/master/packages/mip-cli)
2. [mip-sandbox](https://github.com/mipengine/mip2/tree/master/packages/mip-sandbox)

会被沙盒注入的对象为**全部白名单以外的原生对象**和**全部作用域链上未定义的变量**。我们通过**白名单**的机制对原生对象进行限制，即开发者只能使用白名单上的对象，如果调用白名单以外的，会拿不到对象。在具体实现上，我们使用 MIP 编译工具 mip-cli 在组件调试和编译上线的时候调用 mip-sandbox 工具，将白名单之外的对象代码注入 `MIP.sandbox` 前缀，比如 `window` 将会编译得到 `MIP.sandbox.window`，然后通过控制对 MIP.sandbox 上属性或方法的定义，从而实现沙盒的白名单机制。

举个例子，假设 js 代码如下所示：

```javascript
function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time))
}

export default {
  async mounted() {
    await sleep(3000)
    console.log('mounted')
    window.setTimeout(() => {
      console.log('mounted')
    }, 3000)
    a = 1 + 1
    alert('mounted')
  }
}
```

将会编译生成：

```javascript
function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time))
}

export default {
  async mounted() {
    await sleep(3000)
    console.log('mounted')
    MIP.sandbox.window.setTimeout(() => {
      console.log('mounted')
    }, 3000)
    MIP.sandbox.a = 1 + 1
    MIP.sandbox.alert('mounted')
  }
}
```

可以看到 alert window 全被注入了 MIP.sandbox 前缀，a 由于没有在作用域链上声明，因此也被注入 MIP.sandbox 前缀。由于 MIP.sandbox.alert 不在白名单里，因此程序执行到此处将报错并且控制台打印以下错误信息：

```shell
> Uncaught TypeError: MIP.sandbox.alert is not a function
```
