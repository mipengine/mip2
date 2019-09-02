# MIP 交互机制

MIP 提供了为数众多的官方组件来满足开发者的需求。这些组件一般都封装或者实现了一些特定的样式或者功能，开发者一般只需要通过堆砌 MIP 组件，修改它们的样式，配置好相应的属性，就可以获得相应的 MIP 页面。

当然，MIP 页面的组件与组件之间还需要通过交互机制将它们都串联起来，才能够让 MIP 页面的交互体验变得更好。

举个简单的例子，页面上点击某个按钮，然后弹出对话框。在这个例子里，涉及到了以下过程：

1. 按钮点击事件监听；
2. 按钮与对话框通信；
3. 对话框显示；

因此，MIP 需要提供一套机制来覆盖上述过程。MIP 组件在设计上遵循相互独立的原则，是某个功能或者样式的封装，通过对外暴露属性、事件和行为的方式来实现外部对组件的配置和使用。因此，在监听到组件抛出的事件时，动态地去触发别的组件的行为，或者是修改别的组件的属性，就可以实现组件之间的通信和交互。

## 知识索引

在本章节中，我们将学习到事件监听与行为触发的 “on” 语法规则与使用，以及基于“数据驱动”的数据绑定语法 “m-bind”，并会学习到自定义 JS 的书写规范。通过本章节所学习到的内容，我们将可以更有机地把 MIP 组件串联起来，增强 MIP 页面的可交互性。

- [MIP 事件机制](./event-and-action.md)
  + 介绍 on 语法是如何实现事件监听和行为触发的
  + 介绍 MIP 提供的全局事件和组件事件有哪些
  + 介绍 MIP 提供的全局方法和组件方法有哪些
- [MIP 数据驱动机制](./data-driven.md)
  + 介绍如何使用 mip-data 定义初始数据
  + 介绍如何绑定将数据绑定到属性、文字上
    * 包括文字绑定 m-text
    * class 和 style 绑定
    * 表单元素的 value 双向绑定
- [MIP 表达式](./expression.md)
  + 介绍 MIP.setData、数据绑定语法允许使用的表达式
- [数据驱动与模板渲染](./data-driven-and-dom-render.md)
  + 介绍如何使用 mip-list 配合数据驱动机制获得增删节点的能力
- [自定义 JS](./custom-js-by-using-mip-script.md)
  + 介绍如何使用 mip-script 扩充 MIP 表达式的计算能力

## MIP 交互机制示例

### 事件触发

下面的例子分别演示了点击按钮跳转到 `www.baidu.com`，点击按钮跳转到页面具体元素位置的功能。其关键代码如下所示：

```html
<button
  on="tap:MIP.navigateTo(url='https://www.baidu.com', target='_blank')"
>点击打开百度首页</button>

<button
  on="tap:bottom-item.scrollTo(duration=500, position='center')"
>点击跳转到页面底部</button>
```

效果如下所示：

<div class="example-wrapper">
  <button
    class="example-button"
    on="tap:MIP.navigateTo(url='https://www.baidu.com', target='_blank')"
  >点击打开百度首页</button>

  <button
    id="scroll-button"
    class="example-button"
    on="tap:bottom-button.scrollTo(duration=500, position='center')"
  >点击跳转到页面底部</button>
</div>

在上面的例子当中，分别演示了 MIP 全局行为和元素行为的效果，想要了解更多，请阅读[《事件监听与行为触发》](./event-and-action.md)。

### 属性绑定

下面举个简单的属性绑定的例子，通过点击按钮来实现文本颜色的随机改变。

其关键代码如下所示：

```html
<mip-data id="example1" scope>
  <script type="application/json">
  {
    "color": "rgb(0, 0, 0)"
  }
  </script>
</mip-data>

<p m-bind:style="{ color: example1.color }">点击下方按钮实现文本随机变色</p>

<button
  on="tap:MIP.setData({
    example1: {
      color: 'rgb('
        + Math.floor(Math.random() * 256) + ','
        + Math.floor(Math.random() * 256) + ','
        + Math.floor(Math.random() * 256)
        + ')'
    }
  })"
>更改</button>
```

我们需要准备一个数据源 `<mip-data>` 添加 `id` 和 `scope` 两个属性之后，这个数据块内部定义的数据将挂在 `id` 这个域下面，在这里我们定义了数据的域为 `example1`，里面定义了 `color` 的值，这个值可通过 `example1.color` 访问。

接下来准备按钮（button），定义它的 `on` 属性来实现对点击事件（`tap`）的监听；当点击事件触发的时候，调用 `MIP.setData` 方法计算并写入 `example1.color` 的数值，为了实现文字随机变色的效果，我们使用 `Math.floor(Math.random() * 256)` 来依次生成随机的 RGB 数值。

最后我们准备一个文本标签，并且通过 `m-bind` 表达式，将前面随机生成的 `example1.color` 的结果绑定到文本标签的样式上。

其效果如下所示：

<div class="example-wrapper">
  <mip-data id="example1" scope>
    <script type="application/json">
    {
      "color": "rgb(0,0,0)"
    }
    </script>
  </mip-data>
  <p m-bind:style="{ color: example1.color }">点击下方按钮实现文本随机变色</p>
  <button
    class="example-button"
    on="tap:MIP.setData({
      example1: {
        color: 'rgb('
          + Math.floor(Math.random() * 256) + ','
          + Math.floor(Math.random() * 256) + ','
          + Math.floor(Math.random() * 256)
          + ')'
      }
    })"
  >点击更改</button>
</div>

### 文本绑定

我们还可以通过 `m-text` 表达式，将 `example1.color` 的值以文本的形式展示出来，其关键代码如下所示：

```html
<!-- 直接使用 -->
<div m-text="example1.color"></div>
<!-- 也可以加入一定的运算 -->
<div m-text="'当前的颜色值为：' + example1.color"></div>
```

这样，当 `example1.color` 的值发生改变时，会将相应的结果以文本的形式展现出来：

<div class="example-wrapper">
  <p m-text="example1.color"></p>
  <p m-text="'当前的颜色值为：' + example1.color"></p>
</div>

### 双向绑定

除此之外，结合 `<mip-form>` 还可以实现表单数据的双向绑定：


```html
<mip-data id="example2" scope>
  <script type="application/json">
  {
    "inputValue": "Hello World"
  }
  </script>
</mip-data>

<p m-text="example2.inputValue"></p>

<mip-form url="https://path/to/your/api">
  <input type="text" m-bind:value="'结果：' + example2.inputValue">
</mip-form>

<button on="tap:MIP.setData({
    example2: {
      inputValue: ''
    }
  })"
>点击清空</button>
```

在这个示例中，我们定义了名为 `example2` 的数据块，并且将 `example2.inputValue` 通过 `m-bind:value` 绑定到 `<input>` 的 value 属性上，这样在输入文字时，就能够自动实现双向绑定，我们通过操控 `example2.inputValue` 来实现对 input 输入框内的内容进行更改。其效果如下所示：

<div class="example-wrapper">
  <mip-data id="example2" scope>
    <script type="application/json">
    {
      "inputValue": "Hello World"
    }
    </script>
  </mip-data>
  <p m-text="'结果：' + example2.inputValue"></p>

  <mip-form url="https://path/to/your/api">
    <input type="text" m-bind:value="example2.inputValue" class="example-input">
  </mip-form>

  <button class="example-button" on="tap:MIP.setData({
      example2: {
        inputValue: ''
      }
    })"
  >点击清空</button>
</div>

## 小节

MIP 交互机制旨在提升 MIP 页面的可交互性，在 MIP 核心机制和官方组件的配合下，基本能够覆盖大部分的前端业务场景，为 MIP 站点提供更为丰富和流畅的交互体验。

<div class="example-wrapper">
  <p>您已滚动至页面底部</p>
  <button class="example-button"
    id="bottom-button"
    on="tap:scroll-button.scrollTo(duration=1000, position='center')"
  >点击滚回原示例</button>
</div>




