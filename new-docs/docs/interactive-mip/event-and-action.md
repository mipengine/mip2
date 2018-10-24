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
|eventName   |是|所监听的组件抛出的事件名|
|targetId    |是|要触发行为的组件元素 id，或者是特殊对象 MIP 。|
|actionName  |是|对应组件元素或对象所暴露的行为方法|
|args        |否|行为方法的参数，参数为空时可以不写。|

## 多事件的监听与多行为的触发

`on` 语法支持监听多个事件，以及触发多个行为。多个事件和行为定义之间使用空格分开即可，例如：

```html
<mip-counter
  on="success:id1.close success.id2.close error:id1.show error.id2.show"
></mip-counter>
```

在上面的例子中，当 mip-counter 抛出 “success” 事件时，将会触发 id1 与 id2 两个对象的 close 行为，抛出 “error” 事件时，将会触发 id1、id2 两个对象的 show 行为。

## 全局定义的事件

MIP 定义了全局事件 `tap`，`tap` 事件可以在任何 HTML 元素（包括原生 HTML 和 MIP 组件）上进行监听，该事件通过点击行为触发。举个例子，通过点击按钮触发 mip-lightbox 组件的展现和消失，那么可以在按钮元素上绑定 `tap` 事件：

```html
<!-- preview -->
<!-- preset
<style mip-custom>
button {
  border: 1px solid #f1f1f1;
  border-radius: 5px;
  padding: 10px 20px;
  margin: 20px 0;
  font-size: 14px;
  background: #fff;
  display: block;
  box-sizing: border-box;
}

.lightbox {
  padding: 10px;
  background: white;
}

.lightbox p {
  margin: 80px 0;
  display: block;
}
</style>
<script src="https://c.mipcdn.com/static/v2/mip-lightbox/mip-lightbox.js"></script>
-->
<button on="tap:light-box.open">打开弹框</button>
<mip-lightbox
  id="light-box"
  layout="nodisplay"
>
  <div class="lightbox">
    <p>Hello World!</p>
    <button on="tap:light-box:close">关闭弹框</button>
  </div>
</mip-lightbox>
```

## 组件自定义事件

除开全局事件 `tap` 之外，每个组件也会根据其功能实现的需要抛出自定义事件。具体可以查阅对应的组件文档。

## 特殊对象 MIP

前面提到 targetId 可以传入特殊对象 MIP。在 `on` 语法中，MIP 对象暴露了 `setData` 方法，比如：

```html
<button on="tap:MIP.setData({buttonState: 'clicked'})">点击按钮</button>
```

在点击按钮时，数据 `buttonState` 将被赋值为 'clicked'。然后通过 [m-bind](./data-binding.md) 方法将 `buttonState` 绑定到节点属性上，就能够通过数据驱动的方式实现组件间通信。这块内容将在下一节[数据绑定](./data-binding.md) 中进行更为详细的说明。
