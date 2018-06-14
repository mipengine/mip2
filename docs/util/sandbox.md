# 沙盒机制

MIP 允许开发者通过提交 MIP 组件和写 `<mip-script>` 等方式去写 JS，但是从性能和代码维护的层面考虑，部分 `API` 是不应该使用的，比如 `alert`、`confirm` 等等，因此我们提供了沙盒机制，去屏蔽和限制这类 API/属性 的使用。

## 实现方式

相关工具：

1. [mip-cli](https://github.com/mipengine/mip2/tree/master/packages/mip-cli)
2. [mip-sandbox](https://github.com/mipengine/mip2/tree/master/packages/mip-sandbox)

我们通过**白名单**的机制对 API/属性 进行限制，即开发者只能使用白名单上的 API，如果调用白名单以外的，会拿不到对象。在具体实现上，我们使用 MIP 编译工具 mip-cli 在组件调试和编译上线的时候调用 mip-sandbox 工具，将**限制使用**的 API 对象代码注入 `MIP.sandbox` 前缀，比如 `window` 将会编译得到 `MIP.sandbox.window`，然后通过控制对 MIP.sandbox.window 上属性或方法的定义，从而实现沙盒的白名单机制。

举个例子，假设 js 代码如下所示：

```javascript
function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time))
}

export default {
  async mounted() {
    await sleep(3000)
    console.log('mounted')
    alert('mounted')
    eval('console.log("mounted")')
    window.setTimeout(() => {
      console.log('mounted')
    }, 3000)
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
    MIP.sandbox.alert('mounted')
    MIP.sandbox.eval('console.log("mounted")')
    MIP.sandbox.window.setTimeout(() => {
      console.log('mounted')
    }, 3000)
  }
}
```

可以看到 alert eval window 全被注入了 MIP.sandbox 前缀。

## 白名单