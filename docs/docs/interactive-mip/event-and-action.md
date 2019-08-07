# MIP 事件绑定与行为触发

MIP 提供了 `on` 属性来定义对组件的事件绑定与事件触发时的行为。

## 事件绑定语法说明

`on` 属性的语法格式如下所示：

```html
<TAGNAME
  on="eventName:targetId.actionName[(...args)]"
>
</TAGNAME>
```

|参数名|是否必须|描述|
|-----|-------|----|
|eventName   |是|组件抛出的事件名|
|targetId    |是|要触发行为的组件元素 id，或者是特殊对象 MIP|
|actionName  |是|对应组件元素或对象所暴露的行为方法|
|args        |否|行为方法的参数，参数为空时可以不写|

## 多事件的监听与多行为的触发

`on` 语法支持监听多个事件，以及触发多个行为。多个事件和行为定义之间可以使用空格或者分号分开，也支持换行。例如：

```html
<mip-counter
  on="success:id1.close success.id2.close;
    error:id1.show error.id2.show"
></mip-counter>
```

在上面的例子中，当 mip-counter 抛出 “success” 事件时，将会触发 id1 与 id2 两个对象的 close 行为，抛出 “error” 事件时，将会触发 id1、id2 两个对象的 show 行为。

## 全局定义的事件和行为

### 事件

|事件名|描述|元素|数据|
|-----|----|---|---|
|tap            |点击触发                                        |任何 HTML 元素（包括原生 HTML 和 MIP 组件）|无|
|change         |元素 value 改变并提交时触发                       |input                                  |event.value|
|input-debounced|元素 value 改变 300ms 后触发                     |input                                  |event.value|
|input-throttled|元素 value 改变时每 100ms 最多触发一次             |input                                  |event.value|

```html
<button on="tap:light-box.open">打开弹框</button>
<mip-lightbox
  id="light-box"
  layout="nodisplay"
>
  <div class="lightbox">
    <p>Hello World!</p>
    <button on="tap:light-box.close">关闭弹框</button>
  </div>
</mip-lightbox>

<mip-data>
  <script type="application/json">
    {
      "text": 'Hello World!',
    }
  </script>
</mip-data>
<p>输入内容：<span m-text="text"></span></p>
<input on="change:MIP.setData({text: event.value})">
<input on="input-debounced:MIP.setData({text: event.value})">
<input on="input-throttled:MIP.setData({text: event.value})">
```

### 行为

[notice] `show` 只能显示被 `hide` 和 `toggleVisibility` 行为隐藏的元素，或者是使用 `hidden` 属性隐藏的元素。`show` 不支持显示 `display: none` 或者 `layout="nodisplay"` 的元素。

[notice] 可能存在组件自定义行为与全局行为重复的情况，比如 mip-toggle 具有自定义行为 `show` 和 `hide`，此时优先触发组件的自定义行为。

|行为|描述|
|-----|----|
|hide                                       |隐藏元素|
|show                                       |显示元素|
|toggleVisibility                           |切换显示和隐藏元素|
|toggleClass(class=STRING, force=BOOLEAN)   |切换元素类名。参数 `force` 可选，如果为 true，则只添加类名。如果为 false，则只移除类名|
|scrollTo(duration=INTEGER, position=STRING)|视口滚动到元素所在位置。参数 `duration` 可选，用于指定动画时间，单位 ms，默认是 0。参数 `position` 可选，只可取 `top`，`center` 或者 `bottom`，用于指定滚动后元素在视口的位置，默认是 `top`
|focus                                      |让元素获得焦点|

```html
<button on="tap:my-img.show">显示图片</button>
<button on="tap:my-img.hide">隐藏图片</button>
<button on="tap:my-img.toggleVisibility">显示/隐藏图片</button>
<button on="tap:my-img.toggleClass(class='mip-hide')">切换图片 mip-hide 类</button>
<button on="tap:my-img.scrollTo(duration=1000, position='center')">滚动到图片居中，动画时间为 1000ms</button>
<button on="tap:my-input.focus">focus 到 input 元素</button>

<mip-img
  id="my-img"
  layout="responsive"
  width="350"
  height="263"
  src="https://www.mipengine.org/static/img/sample_01.jpg"
></mip-img>
<input id="my-input">
```


<!-- MIP 定义了全局事件 `tap`，`tap` 事件可以在任何 HTML 元素（包括原生 HTML 和 MIP 组件）上进行监听，该事件通过点击行为触发。举个例子，通过点击按钮触发 mip-lightbox 组件的展现和消失，那么可以在按钮元素上绑定 `tap` 事件：

```html
<button on="tap:light-box.open">打开弹框</button>
<mip-lightbox
  id="light-box"
  layout="nodisplay"
>
  <div class="lightbox">
    <p>Hello World!</p>
    <button on="tap:light-box.close">关闭弹框</button>
  </div>
</mip-lightbox>
```

MIP 定义了全局行为 `show`, `hide` 和 `toggleVisibility`，这三个行为可以在任何 HTML 元素（包括原生 HTML 和 MIP 组件）上进行触发。举个例子，通过点击按钮展现和隐藏图片 mip-img，那么可以在按钮上触发 mip-img 的对应行为：

[notice] show 只能显示被 hide 和 toggleVisibility 行为隐藏的元素，或者是使用 hidden 属性隐藏的元素。show 不支持显示 display: none 或者 layout="nodisplay" 的元素。

[notice] 可能存在组件自定义行为与全局行为重复的情况，比如 mip-toggle 具有自定义行为 show 和 hide，此时优先触发组件的自定义行为。

```html
<button on="tap:my-img.show">显示图片</button>
<button on="tap:my-img.hide">隐藏图片</button>
<button on="tap:my-img.toggleVisibility">显示/隐藏图片</button>
<mip-img
  id="my-img"
  layout="responsive"
  width="350"
  height="263"
  src="https://www.mipengine.org/static/img/sample_01.jpg"
></mip-img>
```
-->

## 组件自定义事件和行为

除开全局事件和全局行为之外，每个组件也会根据其功能实现的需要抛出自定义事件或暴露出自定义行为。具体可以查阅对应的组件文档。

## 特殊对象 MIP

前面提到 targetId 可以传入特殊对象 MIP。在 `on` 语法中，MIP 对象暴露了如下行为。

|行为|描述|
|---|---|
|setData                                                     |将数据 merge 到 `mip-data` 中，参考[数据绑定](./data-binding/mip-bind.md)|
|navigateTo(url=STRING, target=STRING, opener=BOOLEAN)       |跳转到指定 `url` 页面，参数 `target` 只可取 `_top` 或 `_blank`，可选参数 `opener` 用于指定在 target=_blank 时新打开的页面能否访问到 `window.opener`|
|closeOrNavigateTo(url=STRING, target=STRING, opener=BOOLEAN)|关闭当前页面，如果失败则如 `navigateTo` 跳转。一般用作新打开页面的后退操作|
|scrollTo(id=STRING, duration=INTEGER, position=STRING)      |视口滚动到 `id` 元素的位置，类似于全局行为 `scrollTo`|
|goBack                                                      |返回上一个页面|
|print                                                       |打开当前页面的打印对话框|

```html
<button on="tap:MIP.navigateTo(url='https://www.mipengine.org', target='_blank', opener=true)">在新页面打开 mip 官网</button>
<button on="tap:MIP.closeOrNavigateTo(url='https://www.mipengine.org', target='_blank', opener=true)">关闭页面或者打开 mip 官网</button>
<button on="tap:MIP.scrollTo(id='target', duration=500, position='bottom')">滚动到 id 为 target 的元素位于视口底部，动画时间为 500ms</button>
<button on="tap:MIP.goBack">返回上页</button>
<button on="tap:MIP.print">打印页面</button>

<div id="target"></div>
```

<!-- 前面提到 targetId 可以传入特殊对象 MIP。在 `on` 语法中，MIP 对象暴露了 `setData` 方法，比如：

```html
<button on="tap:MIP.setData({buttonState: 'clicked'})">点击按钮</button>
```

在点击按钮时，数据 `buttonState` 将被赋值为 'clicked'。然后通过 [m-bind](./data-binding/mip-bind.md) 方法将 `buttonState` 绑定到节点属性上，就能够通过数据驱动的方式实现组件间通信。这块内容将在下一节[数据绑定](./data-binding/mip-bind.md) 中进行更为详细的说明。 -->
