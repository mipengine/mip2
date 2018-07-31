# Class 与 Style 绑定

操作元素的 class 列表和内联样式是数据绑定的一个常见需求。因为它们都是属性，所以我们可以用 `m-bind` 处理它们：只需要通过表达式计算出字符串结果即可。不过，字符串拼接麻烦且易错。因此，在将 `m-bind` 用于 `class` 和 `style` 时，MIP2 做了专门的增强。表达式结果的类型除了字符串之外，还可以是对象或数组。这个用法，与 Vue 的 v-bind 是一致的。

## 绑定 HTML Class

### 对象语法

我们可以传给 `m-bind:class` 一个对象，以动态地切换 class：

```html
<mip-data>
  <script type="application/json">
    {
      "isActive": true
    }
  </script>
</mip-data>
<div m-bind:class="{ active: isActive }"></div>
```

上面的语法表示 `active` 这个 class 存在与否将取决于数据属性 `isActive` 的 [truthiness](https://developer.mozilla.org/zh-CN/docs/Glossary/Truthy)。

你可以在对象中传入更多属性来动态切换多个 class。此外，`m-bind:class` 指令也可以与普通的 class 属性共存。当有如下模板 和 data:

```html
<mip-data>
  <script type="application/json">
    {
      "isActive": true,
      "hasError": false
    }
  </script>
</mip-data>
<div class="static" m-bind:class="{ active: isActive, 'text-danger': hasError }">
</div>
```

结果渲染为：

```html
<div class="static active"></div>
```

当 `isActive` 或者 `hasError` 变化时，class 列表将相应地更新。例如，如果 `hasError` 的值为 true，class 列表将变为 `"static active text-danger"`。

绑定的数据对象不必内联定义在模板里：

```html
<mip-data>
  <script type="application/json">
    {
      "classObject": {
        "active": true,
        "text-danger": false
      }
    }
  </script>
</mip-data>
<div m-bind:class="classObject"></div>
```

渲染的结果和上面一样。

### 数组语法

我们可以把一个数组传给 `m-bind:class`，以应用一个 class 列表：

```html
<mip-data>
  <script type="application/json">
    {
      "activeClass": "active",
      "errorClass": "text-danger"
    }
  </script>
</mip-data>
<div m-bind:class="[activeClass, errorClass]"></div>
```

渲染为：

```html
<div class="active text-danger"></div>
```

如果你也想根据条件切换列表中的 class，可以用三元表达式：

```html
<mip-data>
  <script type="application/json">
    {
      "isActive": true,
      "activeClass": "active",
      "errorClass": "text-danger"
    }
  </script>
</mip-data>
<div m-bind:class="[isActive ? activeClass : '', errorClass]"></div>
```

这样写将始终添加 `errorClass`，但是只有在 `isActive` 是 [truthy](https://developer.mozilla.org/zh-CN/docs/Glossary/Truthy) 时才添加 `activeClass`。

不过，当有多个条件 class 时这样写有些繁琐。所以在数组语法中也可以使用对象语法：

```html
<mip-data>
  <script type="application/json">
    {
      "isActive": true,
      "errorClass": "text-danger"
    }
  </script>
</mip-data>
<div m-bind:class="[{ active: isActive }, errorClass]"></div>
```

### 用在组件上

与 Vue 不同的是，当在一个自定义组件上使用 class 属性或 `m-bind:class` 绑定 class 属性时，这些类将 **不会** 被添加到该组件的根元素上面，只会被添加到自定义标签上。

假如开发者有一个自定义组件 mip-a，如：
```javascript
<template>
  <div class="mip-a-root"></div>
</template>
```

然后在使用它时添加一些 class 或通过 m-bind 绑定了 class，如:
```html
<mip-data>
  <script type="application/json">
    {
      "isActive": true
    }
  </script>
</mip-data>
<mip-a class="mip-a-outer" m-bind:class="{active: isActive}"></mip-a>
```

HTML 的渲染结果将如:
```html
<mip-a class="mip-a-outer active">
  <div class="mip-a-root"></div>
</mip-a>
```

## 绑定内联样式

### 对象语法

`m-bind:style` 的对象语法十分直观——看着非常像 CSS，但其实是一个 JavaScript 对象。CSS 属性名可以用驼峰式 (camelCase) 或短横线分隔 (kebab-case，记得用单引号括起来) 来命名：

```html
<mip-data>
  <script type="application/json">
    {
      "activeColor": "red",
      "fontSize": 13
    }
  </script>
</mip-data>
<div m-bind:style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>
```

直接绑定到一个样式对象通常更好，这会让模板更清晰：

```html
<mip-data>
  <script type="application/json">
    {
      "styleObject": {
        "color": "red",
        "fontSize": "13px"
      }
    }
  </script>
</mip-data>
<div m-bind:style="styleObject"></div>
```

渲染为：

```html
<div style="color:red;font-size:13px;"></div>
```

### 数组语法

`m-bind:style` 的数组语法可以将多个样式对象应用到同一个元素上：

```html
<mip-data>
  <script type="application/json">
    {
      "baseStyles": {
        "color": "red",
        "fontSize": "13px"
      },
      "overridingStyles": {
        "color": "blue"
      }
    }
  </script>
</mip-data>
<div m-bind:style="[baseStyles, overridingStyles]"></div>
```

渲染为：

```html
<div style="color:blue;font-size:13px;"></div>
```

### 自动添加前缀

当 `m-bind:style` 使用需要添加[浏览器引擎前缀](https://developer.mozilla.org/zh-CN/docs/Glossary/Vendor_Prefix)的 CSS 属性时，如 `transform`，MIP2 会自动侦测并添加相应的前缀。

### 多重值

你可以为 `style` 绑定中的属性提供一个包含多个值的数组，常用于提供多个带前缀的值，例如：

```html
<div m-bind:style="{ display: ['-webkit-box', '-ms-flexbox', 'flex'] }"></div>
```

这样写只会渲染数组中最后一个被浏览器支持的值。在本例中，如果浏览器支持不带浏览器前缀的 flexbox，那么就只会渲染 `display: flex`。
