# MIP 事件绑定

## 事件绑定语法说明

MIP 提供了 `on` 属性来定义对组件的事件绑定与事件触发时的行为。

<div class="example-wrapper" id="top-example" hidden>
  <p>您已通过 MIP.scrollTo() 方法滚动到底部，请点击下方按钮返回原示例</p>
  <button id="top-button"
    class="example-button"
    on="tap:
      top-example.hide,
      MIP.scrollTo(id='mip-scrollto-button', duration=500, position='center')"
  >点击返回原示例</button>
</div>

### 单事件绑定语法

`on` 属性的语法格式如下所示：

```html
<TAGNAME
  on="eventName:targetId.actionName(args)"
>
</TAGNAME>
```

相关参数的说明如下表所示：

|参数名|是否必须|描述|
|-----|-------|----|
|eventName   |是|组件抛出的事件名|
|targetId    |是|要触发行为的组件元素 id，或者是特殊对象 MIP|
|actionName  |是|对应组件元素或对象所暴露的行为方法|
|args        |否|行为方法的参数，参数为空时可以不写|

下面的这些都是合法的 `on` 表达式：

```html
<!-- 定义一个 id 为 header-element 的元素 -->
<div id="header-element" hidden></div>

<!-- 触发 header-element 的显示 -->
<div on="tap:header-element.show()">点我</div>
<!-- 当方法不存在参数时，也可以将括号省略不写 -->
<div on="tap:header-element.show">点我</div>
<!-- 调用 MIP 特殊对象上的方法 -->
<div on="tap:MIP.setData({ a: 1 + 2 })"></div>
<div on="tap:MIP.navigateTo(url='https://www.baidu.com', target='_blank')">
```

### 多事件绑定与多行为触发

`on` 语法支持监听多个事件，以及触发多个行为。其中多个事件通过 `;` 进行分隔，单个事件的多个行为之间通过 `,` 分隔。例如：

```html
<input id="input-element"
  on="
    tap:
      input-element.scrollTo(duration=500, position='center'),
      MIP.setData({ clicked: clicked + 1 });
    change:
      MIP.setData({ value: event.value })
">
```

为了使得过长的 on 表达式更易于阅读，在分隔符前后允许存在换行符和空格进行表达式分段操作。

[notice] 定义在同一个事件下面的多个行为当中，只允许存在 1 个 `MIP.setData()` 方法，以免造成

## 支持的事件

MIP 提供的事件包括两类：全局事件和组件事件。其中全局事件由 MIP 核心提供，比如点击、输入等通用事件；组件事件则是由 MIP 组件自身实现和触发的自定义事件，具体的组件事件需要到对应的组件文档当中阅读 `事件` 一栏。

抛出的事件可能会携带数据，这些数据信息可以通过 `event.xxx` 表达式获取，比如 `<input>` `input-throttled` 事件，可以通过 `event.value` 获取当前输入框的输入信息：

```html
<!-- 监听 input-throttled 事件，并将输入框结果写入 text  -->
<input type="text" on="input-throttled:MIP.setData({ text: event.value })">
<!-- 将 text 绑定到 p 标签上将输入结果 -->
<!-- m-text 绑定语法更详细的说明将在数据绑定章节进行详细说明 -->
<p m-text="text"></p>
```

其效果如下所示:

<div class="example-wrapper">
  <mip-form url="https://www.baidu.com">
  <input
    class="example-input"
    type="text"
    on="input-throttled:MIP.setData({ text: event.value })"
    placeholder="请输入任意值"
  >
  </mip-form>
  <p m-text="text"></p>
</div>

### 全局事件

|事件名|描述|元素|数据|
|-----|----|---|---|
|tap |使用 `touch` 事件实现的点击触发事件。<br>较原生 click 事件有更快的响应速度。 |任何 HTML 元素（包括原生 HTML 和 MIP 组件） |无 |
|click|原生点击触发。<br>由于 click 事件在 iOS 下存在明显延迟，因此移动 MIP 页请优先使用 tap 事件。|任何 HTML 元素（包括原生 HTML 和 MIP 组件）|无 |
|change|元素 value 改变并提交时触发 |表单元素，包括 input、textarea、select |event.value|
|input-debounced|输入防抖，元素 value 改变 300ms 后触发，300ms 内存在任何 value 的改变都将重新计时 |表单元素，包括 input、textarea、select |event.value |
|input-throttled|输入截流，元素 value 改变时每 100ms 最多触发一次 |表单元素，包括 input、textarea、select |event.value|

### 组件事件

组件事件是 MIP 组件自身实现和触发的自定义事件，是全局事件的扩展和补充。具体的事件可以阅读具体的 [MIP 组件](https://www.mipengine.org/v2/components/index.html)文档当中的 `事件` 小节。

在这里列举出个别比较有意思的组件事件供大家参考：

#### mip-date-countdown

[倒计时组件](https://www.mipengine.org/v2/components/presentation/mip-date-countdown.html)，提供定时触发事件 `timeout`：

```html
<!-- 3000ms 后触发定时事件-->
<mip-date-countdown
  timeleft-ms="3000"
  when-ended="stop"
  on="timeout:toast.hide"
>
  <template type="mip-mustache">
  <div>{{ss}} {{seconds}}</div>
  </template>
</mip-date-countdown>
<!-- 3000ms 后触发 toast 的隐藏 -->
<span id="toast">欢迎欢迎热烈欢迎！</span>
```

#### mip-position-observer

[位置监听组件](https://www.mipengine.org/v2/components/dynamic-content/mip-position-observer.html)，用于用户滑动屏幕过程中监听元素的位置信息，发出 `enter`、`exit`、`scroll` 事件。

```html
<mip-position-observer
  layout="nodisplay"
  on="
    enter:toast-element.show;
    exit:toast-element.hide
  "
></mip-position-observer>
<div id="toast-element">欢迎欢迎热烈欢迎！</div>
```

## 触发行为

在监听到事件的触发后所执行的方法就是行为，与事件类似，分为以下 3 类：

1. 全局元素方法：任何元素（HTML 原生元素或 MIP 元素）都默认提供的方法，如 `show`、`hide` 等等；
2. 特殊对象方法：`MIP.xxx` 所提供的方法，如 `MIP.navigateTo`、`MIP.setData` 等等；
3. 组件自定义方法：需阅读 MIP 组件文档对应的 `行为` 或 `方法` 模块；

[info] 这些方法根据各自的实现不同，对参数的要求和形式会存在一些差别，因此在开发的时候需要仔细阅读对应方法的文档说明。

### 全局元素方法

MIP 为所有元素（包括普通 HTML 和 MIP 元素）都提供了一些默认方法，这样开发者就能够在 `on` 表达式当中去执行他们。

|行为|描述|
|-----|----|
|hide |隐藏元素。<br>如：`element-id.hide` |
|show |显示元素。<br>如：`element-id.show` |
|toggleVisibility |切换显示和隐藏元素。|
|toggleClass(<br>&nbsp;&nbsp;class=STRING,<br>&nbsp;&nbsp;force=BOOLEAN<br>) |切换元素类名。<br>参数 `force` 可选，如果为 true，则只添加类名。如果为 false，则只移除类名。<br> 如：`element-id.toggleClass(class='active')`|
|scrollTo(<br>&nbsp;&nbsp;duration=INTEGER,<br>&nbsp;&nbsp;position=STRING<br>)|视口滚动到元素所在位置。<br>参数 `duration` 可选，用于指定动画时间，单位 ms，默认是 0。<br>参数 `position` 可选，只可取 `top`，`center` 或者 `bottom`，用于指定滚动后元素在视口的位置，默认是 `top`。<br>如：`element-id.scrollTo(duration=500, position='center')`|
|focus                                      |让元素获得焦点。<br>如：`element-id.focus`|

[notice] 当 MIP 组件自定义方法与全局元素方法重名的情况下，比如 mip-toggle 具有自定义行为 `show` 和 `hide`，此时优先触发组件的自定义方法。


下面是全局元素方法的一些例子：

#### 隐藏或显示元素

需要注意的是，`show` 只能显示被 `hide` 和 `toggleVisibility` 行为隐藏的元素，或者是使用 `hidden` 属性隐藏的元素。如果当前元素是通过 class 添加的 `display: none`，请采用 `toggleClass` 移除节点相关 class。


```html
<!-- 点击显示添加了 hidden 属性的元素-->
<button on="tap:text1.show">显示文字1</button>
<!-- 点击隐藏 -->
<button on="tap:text1.hide">隐藏文字1</button>
<!-- 点击切换元素的隐藏和显示 -->
<button on="tap:text1.toggleVisibility">切换文字1的隐藏和显示</button>
<p id="text1" hidden>文字1</p>

```

效果如下所示：

<div class="example-wrapper">
  <!-- 点击显示添加了 hidden 属性的元素-->
  <button on="tap:text1.show" class="example-button">显示文字1</button>
  <!-- 点击隐藏 -->
  <button on="tap:text1.hide" class="example-button">隐藏文字1</button>
  <!-- 点击切换元素的隐藏和显示 -->
  <button on="tap:text1.toggleVisibility" class="example-button">切换文字1的隐藏和显示</button>
  <p id="text1" hidden>文字1</p>
</div>

#### 添加或移除 class

```html
<!-- 无法通过 text2.show 方法显示通过 display: none 定义样式的元素 -->
<button on="tap:text2.show">无法显示文字</button>
<!-- 通过 toggleClass 添加或移除 .hide 实现元素的隐藏或显示 -->
<button on="tap:text2.toggleClass(class='hide')">添加/移除 hidden class</button>
<!-- .hide { display: none; } -->
<p id="text2" class="hide">文字2</p>
```
效果如下所示：

<style>
.hide {
  display: none;
}
</style>

<div class="example-wrapper">
  <!-- 无法通过 text2.show 方法显示通过 display: none 定义样式的元素 -->
  <button on="tap:text2.show" class="example-button">无法显示文字</button>
  <!-- 通过 toggleClass 添加或移除 .hide 实现元素的隐藏或显示 -->
  <button on="tap:text2.toggleClass(class='hide')" class="example-button">添加/移除 hidden class</button>
  <!-- .hide { display: none; } -->
  <p id="text2" class="hide">文字2</p>
</div>

#### 滚动到具体元素

```html
<!-- 点击滚动到页面底部 -->
<button on="tap:bootm-button.scrollTo(duration=500, position='center')">点击滚动到底部</button>
```
效果如下所示：

<div class="example-wrapper">
  <button id="scroll-button"
    on="tap:
      bottom-example.show,
      bottom-button.scrollTo(duration=500, position='center')"
    class="example-button">点击滚动到底部</button>
</div>

#### 获取焦点

```html
<!-- 点击使 a 链获得焦点 -->
<button on="tap:a-link.focus">点击按钮，使下方 a 链获得焦点</button>
<a href="https://www.mipengine.org" id="a-link"><p>#a-link:focus p { color: red; } </p></a>
```
效果如下所示：

<style>
#a-link:focus p {
  color: red;
}
</style>

<div class="example-wrapper">
  <button on="tap:a-link.focus" class="example-button">点击使下方 a 链获得焦点</button>
  <a href="https://www.mipengine.org" id="a-link"><p>#a-link:focus p { color: red; } </p></a>
</div>


## 特殊对象方法

前面提到 targetId 可以传入特殊对象 MIP。在 `on` 语法中，MIP 对象暴露了如下行为。

|行为|描述|
|---|---|
|setData({<br>&nbsp;&nbsp;[name]: Expression<br>}) |将数据合并到到全局状态树中，结合数据绑定，写入数据时允许写有限的计算表达式进行运算。<br>更多内容请参考[数据绑定](./data-binding/mip-bind.md)<br>如：`MIP.setData({ a: 1 + 1, b: 'hello' })`|
|navigateTo(<br>&nbsp;&nbsp;url=STRING,<br>&nbsp;&nbsp;target=STRING,<br>&nbsp;&nbsp;opener=BOOLEAN<br>) |跳转到指定 `url` 页面。<br>参数 `url` 为必填参数，要跳转到的目标页面 URL<br>参数 `target` 为必填参数，只可取 `_top` 或 `_blank`。<br>`opener` 为可选参数，用于指定在 `target=_blank` 时新打开的页面能否访问到 `window.opener`。<br>如：`MIP.navigateTo(url='https://www.baidu.com', target='_blank')`|
|closeOrNavigateTo(<br>&nbsp;&nbsp;url=STRING, <br>&nbsp;&nbsp;target=STRING,<br>&nbsp;&nbsp;opener=BOOLEAN<br>)|关闭当前页面，如果失败则如 `navigateTo` 跳转。一般用作新打开页面的后退操作。<br>参数说明与示例用法同上。|
|scrollTo(<br>&nbsp;&nbsp;id=STRING,<br>&nbsp;&nbsp;duration=INTEGER,<br>&nbsp;&nbsp;position=STRING<br>) |视口滚动到 `id` 元素的位置，类似于全局元素方法 `element-id.scrollTo`。<br>参数 `id` 为必填参数，用于指定要滚动到的元素<br>参数 `duration` 为可选参数<br>参数 `position` 为可选参数。|
|goBack                                                      |返回上一个页面，效果等同于 `window.history.back()`<br>如：`MIP.goBack`|
|print                                                       |打开当前页面的打印对话框<br>如：`MIP.print`|

下面是一些 MIP 方法的一些使用示例：

#### MIP.setData

这个例子演示了通过 setData 完成对按钮点击次数的记录：

```html
<mip-data>
  <script type="application/json">
  {
    "count": 0
  }
  </script>
</mip-data>

<button on="tap:MIP.setData({ count: count + 1 })">点击次数 + 1</button>
<p>当前按钮点击次数为：<span m-text="count"></span></p>
```
其效果如下所示：

<mip-data >
  <script type="application/json">
  {
    "count": 0
  }
  </script>
</mip-data>

<div class="example-wrapper">
  <button
    class="example-button"
    on="tap:MIP.setData({ count: count + 1 })">点击次数 + 1</button>
  <p>当前按钮点击次数为：<span m-text="count"></span></p>
</div>

#### MIP.navigateTo 和 MIP.closeOrNavigateTo

需要说明的是，在通常情况下，应优先使用 `<a href="xxx"></a>` 的形式实现页面跳转，因为 a 链的形式更有利于搜索引擎的抓取和分析。

```html
<button on="tap:MIP.navigateTo(url='https://www.mipengine.org', target='_blank', opener=true)">在新页面打开 mip 官网</button>
<button on="tap:MIP.closeOrNavigateTo(url='https://www.mipengine.org', target='_blank', opener=true)">关闭页面或者打开 mip 官网</button>
```
效果如下所示：

<div class="example-wrapper">
  <button class="example-button" on="tap:MIP.navigateTo(url='https://www.mipengine.org', target='_blank', opener=true)">在新页面打开 mip 官网</button>
  <button class="example-button" on="tap:MIP.closeOrNavigateTo(url='https://www.mipengine.org', target='_blank', opener=true)">关闭页面或者打开 mip 官网</button>

</div>

#### MIP.scrollTo


```html
<button on="tap:MIP.scrollTo(id='top-example', duration=500, position='center')">滚动到顶部 id 为 top-button 的按钮处</button>
```

效果如下所示：

<div class="example-wrapper">
  <button
    class="example-button"
    id="mip-scrollto-button"
    on="tap:
      top-example.show,
      MIP.scrollTo(id='top-button', duration=500, position='center')"
  >滚动到顶部 id 为 top-button 的按钮处</button>
</div>

#### MIP.goBack 和 mip.print

```html
<button on="tap:MIP.goBack">返回上页</button>
<button on="tap:MIP.print">打印页面</button>
```

效果如下所示：

<div class="example-wrapper">
  <button class="example-button" on="tap:MIP.goBack">返回上页</button>
  <button class="example-button" on="tap:MIP.print">打印页面</button>
</div>

### 组件自定义方法

MIP 组件允许自定义方法，通过 `this.addEventAction` 进行自定义方法的注册。因此需要阅读对应 [MIP 组件文档](https://www.mipengine.org/v2/components/index.html)当中的 `行为` 或 `方法` 部分进行学习。



<div class="example-wrapper" id="bottom-example" hidden>
  <p>您已通过 bottom-button.scrollTo() 方法滚动到底部，请点击下方按钮返回原示例</p>
  <button id="bottom-button"
    class="example-button"
    on="tap:
      bottom-example.hide,
      scroll-button.scrollTo(duration=500, position='center')"
  >点击返回原示例</button>
</div>

