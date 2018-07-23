# MIP 快捷样式

MIP 为所有组件提供了一些常用的样式，避免开发者在编写组件时重复实现。这部分样式会在以后的迭代中逐步完善，敬请开发者们关注。

## 一像素边框

针对移动端浏览器在高清屏幕显示中最常见的“一像素边框”问题，MIP 给出了通用的解决方案。开发者只需要引入固定的类名即可绘制出真实的一像素边框。

### 使用方法

给需要添加边框的元素添加特定的类，如下：

* __mip-border__

  声明使用 MIP 提供的边框样式，__必须添加__。

* __mip-border-top__

  使用顶部边框。__可以和其他方向的边框叠加使用__。

* __mip-border-bottom__

  使用底部边框。__可以和其他方向的边框叠加使用__。

* __mip-border-left__

  使用左边边框。__可以和其他方向的边框叠加使用__。

* __mip-border-right__

  使用右边边框。__可以和其他方向的边框叠加使用__。

* __mip-border-all__

  使用所有方向的边框。

### 示例

```html
<!-- 使用四个方向的边框 -->
<mip-fixed class="mip-border mip-border-all" type="top"></mip-fixed>

<!-- 使用上下方向的边框，可以和其他自定义类配合使用 -->
<div class="wrapper mip-border mip-border-top mip-border-bottom"></div>
```

### 修改颜色和圆角

默认的边框颜色是 `#e1e1e1`，没有圆角。但根据业务需求可能会更改两者的属性。

虽然在 MIP 的源码中使用 less 把两者的修改包装成方法可以直接使用，但到开发者的环境中 less 已经变成了 css，因此自然也无法使用方法。我们可以使用 css 属性覆盖的方法解决这个问题。如果开发者使用了如 less, stylus 等 css 框架，也可根据对应框架的特点进行语法精简和改写。

我们以如下的 HTML 进行举例：

```html
<div class="wrapper mip-border mip-border-top mip-border-bottom"></div>
```

* 修改颜色

  ```css
  .wrapper {
    border-color: red;
  }

  .wrapper::after {
    border-color: red;
  }
  ```

* 修改圆角

  ```css
  .wrapper {
    border-radius: 2px;
  }

  .wrapper::after {
    border-radius: 4px;
  }
  ```

  注意因为 scale 的关系，在设置 `::after` 伪类时需要将圆角尺寸 __乘以 2__。
