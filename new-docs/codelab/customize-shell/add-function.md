# 3. 添加方法

继承的子类已经完成了，接下来是继承一些特定的方法，以完成我们的业务需求。

## 固定下拉按钮的内容

MIP Shell 基类在每个页面的大致处理过程是：

1. 读取（自身标签内部的）页面配置
2. 根据配置渲染/更新显示内容（如头部标题栏或其他额外的内容）
3. 绑定并响应事件

如果我们要固定下拉按钮的内容，则应该在第一步完成后，第二步执行之前介入控制。MIP Shell 基类为我们提供了 `processShellConfig` 方法，参数只有一个，为当前读取到的 Shell 配置。因此我们只需要修改这个参数即可，如下：

```javascript
processShellConfig(shellConfig) {
  // 强制修改 HTML 中的按钮配置
  shellConfig.routes.forEach(route => {
    route.buttonGroup = [{
      "name": "setting",
      "text": "设置"
    },
    {
      "name": "cancel",
      "text": "取消"
    }]
  })
}
```

这样无论页面上的 Shell 配置如何编写都会被忽略，转而使用我们设置的这两个按钮。（按钮的响应操作在之后统一处理）

## 创建底部栏

除了头部标题栏之外，我们还需要一个独立于每个页面之外的底部设置栏。要实现这个需求，需要在 Shell 渲染头部之后介入，把我们想要的底部也一起进行渲染。这里我们会用到基类提供的 `renderOtherParts` 方法：

```javascript
renderOtherParts () {
  this.$footerWrapper = document.createElement('mip-fixed')
  this.$footerWrapper.setAttribute('type', 'bottom')
  this.$footerWrapper.classList.add('mip-shell-footer-wrapper')

  this.$footer = document.createElement('div')
  this.$footer.classList.add('mip-shell-footer', 'mip-border', 'mip-border-top')
  this.$footer.innerHTML = this.renderFooter()

  this.$footerWrapper.appendChild(this.$footer)
  document.body.appendChild(this.$footerWrapper)
}

renderFooter() {
  let pageMeta = this.currentPageMeta
  // 只为了简便，直接输出了一个字符串
  return 'hello ${pageMeta.header.title}!'
}
```

这里有几个注意点：

1. `renderOtherParts` 本身没有参数，但可以通过 `this.currentPageMeta` 来获取当前页面的 Shell 配置，从而进行绘制。
2. `renderFooter` 是子类方法，而不是继承自父类的。之所以要把 __绘制__ 和 __挂载__ 独立开来，是为了重用考虑。因为后续更新时只需要 __绘制__ 而不需要 __挂载__。
3. 如果需要创建 `position: fixed` 的 DOM 元素（如底部菜单栏），应当使用 `<mip-fixed>` 作为标签名，而非其他如 `<div>` 等 HTML 标准标签。这主要是为了解决 iOS 的 iframe 中 fixed 元素滚动抖动的 BUG。

## 更新底部栏

MIP 页面首次进入时会调用 `renderOtherParts()` 方法进行初始渲染。而后续切换页面时，MIP 会将目标页面的 `meta` 信息设置为 `this.currentPageMeta` 并调用 `updateOtherParts()` 方法以更新自定义部件。所以我们也要在这里更新底部栏。

刚才也提到过，在 `updateOtherParts()` 方法中，开发者仅需要更新 HTML 即可，不需要像 `renderOtherParts()` 那样创建 DOM 并插入到页面中。也因此，将 `renderFooter()` 独立出来有利于这里继续调用。示例如下：

```javascript
updateOtherParts() {
    this.$footer.innerHTML = this.renderFooter()
}
```

## 绑定事件

目前为止我们处理了两部分内容：头部固定了两个按钮，以及创建了一个底部栏。这里我们要为这两部分绑定事件。

### 头部按钮

头部按钮的绑定我们会用到基类提供的 `handleShellCustomButton` 方法，参数为 `buttonName`，表示点击的按钮的 `name` 属性。

```javascript
handleShellCustomButton (buttonName) {
  if (buttonName === 'setting') {
    this.$footerWrapper.style.display = 'block'
  }
}
```

因为示例的原因，这里只是简单调用了 `display = 'block'`，实际项目中可能还会牵涉到蒙层，动画等等逻辑，都可以在这里扩充。

另外我们在固定按钮内容时，其实还设置了一个 `name` 为 `cancel` 的取消按钮，在这里并没有绑定。这是因为 MIP 会对名字为 `cancel` 的按钮进行统一处理（动画隐藏下拉浮层），因此这里就可以省去一个判断了。

### 底部栏

底部栏是独立于每个页面之外的不变的内容，因此我们需要使用基类的 `bindRootEvents` 方法 （与之相对的是 `bindAllEvents` 方法处理所有页面内部的内容）。正常情况下底部栏还会有些许按钮，我们在这里给这些按钮绑定事件。

需要特别注意的是，这两个方法父类均有操作，因此 __不要忘记调用__ `super` ！

```javascript
bindRootEvents () {
  // 很重要！很重要！很重要！
  super.bindRootEvents()

  this.$footer.addEventListener('click', () => {
    // 点击隐藏底部栏
    this.$footerWrapper.style.display = 'none'
  })
}
```

这里给整个底部都绑定了点击事件，因此可以直接使用 `addEventListener`。如果在实际情况中，要给按钮绑定时，需要使用 __事件代理__，因为每次切换页面，底部栏是会重新渲染的，因此直接使用 `button.addEventListener` 将会失效。

## 添加样式

由于有涉及创建底部栏的工作，势必需要定义底部栏的样式。这里我们就需要引入额外的样式文件。和开发自定义组件一样，只要在 js 文件的头部应用样式文件即可，如下：

```javascript
import './mip-shell-example.less'
```
