# layout 布局规范

布局是开发 Web 页面最常接触的一个方面，也是页面最直观的一种展现方式。然而在开发前端页面的时候很多工程师会为布局感到头疼，不仅是因为不同浏览器厂商兼容程度的不同，而且还有诸多如适配不同分辨率屏幕所带来的问题、实现起来比较复杂的问题等种种情况。不过在使用了 MIP 之后我们不需要再为这些问题烦恼，MIP 提供了一整套完备的组件布局系统，支持不同布局类型和方式，开发者需要做的仅仅是为组件指定布局属性即可。

## 使用方式

在使用 MIP 布局时，开发者无需关心任何场景和兼容性问题，仅仅只需要在组件加入 layout 属性即可，如下面所示。

```html
<mip-img layout="responsive" src="https://image.com/img.jpeg"></mip-img>
```

## 组件布局方式

MIP 根据主流布局方式考虑，封装了 7 大布局法则，具体如下面表格所示：

| 类  别 | 强制 width | 强制 height | 详细说明 |
|-------|---|---|----|
| responsive | 是 | 是 | 能够根据 width、height 的值，算出元素对应的比例，在不同屏幕宽度上做自适应，非常适合图片、视频等需要大小自适应的组件|
|fixed-height | 否 | 是 | 元素的高度固定，width 缺省或者取值为 auto，比较适合 `<mip-carousel>` |
|fill | 否 | 否 | 元素的大小根据父节点的大小自动撑开|
|container | 否 | 否 | 元素的大小由它们的子节点大小决定，与 HTML 的 div 标签类似|
|nodisplay | 否 | 否 | 元素不展现，即 `display:none;` 的时候，这种元素可应用于它自身展现依赖用户的点击等行为的触发|
|fixed | 是 | 是 | 元素根据 width和 height 固定高宽，不随 media 变化|
|flex-item | 否 | 否 | 元素通过 flex 进行布局，需设置父元素为 `display:flex;`|

## 实现原理

本节会深入到 layout 源码中来具体剖析布局的实现细节，源码实现部分主要包括 layout 准备工作、元素宽高获取、有效 layout 计算、设置布局等几个方面，我们也将围绕这些方面来进行讲解。

### layout 实现的准备工作

我们可以看下在实现 layout 前需要准备些什么：

```js
// 判断元素是否已经进行了layout 处理，如果已经处理则终止代码执行
if (element._layoutInited) {
  return
}
element._layoutInited = true
// 获取组件上设定的属性
let layoutAttr = element.getAttribute('layout')
let widthAttr = element.getAttribute('width');
let heightAttr = element.getAttribute('height')
let sizesAttr = element.getAttribute('sizes')
let heightsAttr = element.getAttribute('heights')
// 解析正确的layout类型
let inputLayout = layoutAttr ? this.parseLayout(layoutAttr) : null
// 解析正确的输入宽度
let inputWidth = (widthAttr && widthAttr != 'auto') ?
  this.parseLength(widthAttr) : widthAttr
// 解析正确的输入高度
let inputHeight = heightAttr ? this.parseLength(heightAttr) : null
```

这一部分主要获取 layout 布局所需要的参数，将绑定在元素上的属性进行一层处理，使其成为精准的 layout 属性。

- **layout 属性处理**：如果是 MIP 规定的 layout 类型则保留，否则默认输入为空。
- **宽高处理**：这部分主要是将输入的宽高变成「值 + 单位」的形式，如果输入的为纯数字，则单位默认为 `px`；如果不是尺寸单位，则直接返回空。
- **元素宽高计算**：根据布局的不同类型来决定是直接使用输入的宽高还是通过 `getNaturalDimensions()` 获取宽高，`getNaturalDimensions()` 函数实现如下面代码所示(如果没有宽高参数，则将元素插入页面，获取渲染后的宽高作为真实尺寸)。

```js
getNaturalDimensions(element) {
  /*...*/
  if (!NATURAL_DIMENSIONS[tagName]) {
    var temp = doc.createElement(naturalTagName)
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    doc.body.appendChild(temp);
    NATURAL_DIMENSIONS[tagName] = {
      width: (temp.offsetWidth || 1) + 'px',
      height: (temp.offsetHeight || 1) + 'px',
    }
  }
  /*...*/
  return NATURAL_DIMENSIONS[tagName]
}
```

`getNaturalDimensions()` 是针对白名单中的组件(`mip-pix`，`mip-stats`，`mip-audio`)进行处理的，这些组件在不同浏览器中处理结果各不相同，所以通过该方法能获取精确的尺寸，如下面代码所示。

```js
// 如果layout不存在或layout是fixed、fixed-height类型
// 且元素没有绑定 width 或height
// 且当前组件不是无 layout 布局的组件
// 那么它的宽度是取决于输入宽度和layout是否为FIXED_HEIGHT，如果满足其中一个条件，则宽度为以上计算出的宽度，否则通过getNaturalDimensions 获取宽度
// 高度值在上面计算的高度及通过getNaturalDimensions 获取的高度中选择非空数值
if ((!inputLayout || inputLayout == LAYOUT.FIXED ||
    inputLayout == LAYOUT.FIXED_HEIGHT) &&
  (!inputWidth || !inputHeight) && this.hasNaturalDimensions(element.tagName)) {
  let dimensions = this.getNaturalDimensions(element)
  width = (inputWidth || inputLayout == LAYOUT.FIXED_HEIGHT)
    ? inputWidth
    : dimensions.width
  height = inputHeight || dimensions.height
}
// 否则 width，height为上一步计算出来的数据
else {
  width = inputWidth
  height = inputHeight
}
```

### 有效 layout 计算

计算出组件 layout 缺省情况下的默认值，这些默认值主要是根据除 layout 外其他属性的设置情况而决定的，如下面代码所示。

```js
if (inputLayout) {
  layout = inputLayout
} else if (!width && !height) {
  layout = LAYOUT.CONTAINER
} else if (height && (!width || width == 'auto')) {
  layout = LAYOUT.FIXED_HEIGHT
} else if (height && width && (sizesAttr || heightsAttr)) {
  layout = LAYOUT.RESPONSIVE
} else {
  layout = LAYOUT.FIXED
}
```

根据上面代码判断可以得知，目前在布局参数缺省时，即 layout、sizes 等参数没有指定时，会对应一套缺省规则，具体参见下面表格。

|width | height | 其他属性 | 默认布局|
|----|----|----|----|
|有 | 有 | 无 | fixed|
|有 | 有 | 存在sizes 参数 responsive|
|无或取值为 auto | 有 | 无 | fixed-height|
|无 | 无 | 无 | container|

### 设置布局

在 layout、宽高尺寸属性等都计算完成之后，根据不同 layout 值给对应的组件赋予不同的尺寸值，如下面代码所示。

```js
element.classList.add(this.getLayoutClass(layout))
if (this.isLayoutSizeDefined(layout)) {
  //加入overflow: hidden 样式
  element.classList.add('mip-layout-size-defined')
}
if (layout == LAYOUT.NODISPLAY) {
  element.style.display = 'none'
} else if (layout == LAYOUT.FIXED) {
  element.style.width = width
  element.style.height = height
} else if (layout == LAYOUT.FIXED_HEIGHT) {
  element.style.height = height
} else if (layout == LAYOUT.RESPONSIVE) {
  let space = element.ownerDocument.createElement('mip-i-space')
  space.style.display = 'block'
  space.style.paddingTop = ((
    this.getLengthNumeral(height) / this.getLengthNumeral(width)
  ) * 100) + '%'
  element.insertBefore(space, element.firstChild)
  element._spaceElement = space
} else if (layout == LAYOUT.FILL) {
  // ...
} else if (layout == LAYOUT.CONTAINER) {
  // ...
} else if (layout == LAYOUT.FLEX_ITEM) {
  if (width) {
    element.style.width = width
  }
  if (height) {
    element.style.height = height
  }
}
```

实际 layout 的计算也是需要通过以上代码策略来进行的，当前 layout 确认的情况下布局设置可以分为以下几种情况：

- 如果 layout 为 nodisplay，则隐藏该元素；
- 如果 layout 为 fixed，则设置其宽高为计算后的值；
- 如果 layout 为 fixed-height，则只设置其高度；
- 如果 layout 为 responsive，则设置 paddingTop 样式；
- 如果 layout 为 fill, container 则不进行处理；
- 如果 layout 为 flex，且计算后的宽高存在，则将其设置为它的宽高。
