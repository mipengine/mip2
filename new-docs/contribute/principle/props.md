# 组件属性 Props

> 该页面假设你使用 Vue 组件的方式编写 MIP 组件。

## 组件数据传递

HTML 通过 MIP 组件标签属性传递数据到组件内部，目前支持 JSON 方式和属性两种方式。

### 通过 `script` JSON 方式传递：

  ```html
  <mip-example>
    <script type="application/json">
    {
      "mipProps": "mipProps",
      "arr": [1, 2]
    }
    </script>
  </mip-example>
  ```

通过 JSON 的方式传递，MIP 直接将 JSON 数据做类似 JSON.parse 处理传递给组件。

### 通过标签属性

  ```html
  <mip-example mip-props="mipProps" arr="[1,2]"></mip-example>
  ```

通过属性的方式传递，MIP 会对属性做 [**类型转换**](#数据转换规则)，并传递给组件。

组件内部定义 `props` 属性，上述两种传递数据方式在内部获取到的 prop 值一致

```html
<script>
  export default {
    created() {
      console.log(this.arr) // [1, 2]
      console.log(this.mipProps) // "mipProps"
    }
  }
</script>
```

### 组件 props 类型定义

组件内部定义 `props` 属性，上述两种传递数据方式在内部获取到的 prop 值一致

```html
<script>
  export default {
    props: {
      arr: Array,
      mipProps: String
    },
    created() {
      console.log(this.arr) // [1, 2]
      console.log(this.mipProps) // "mipProps"
    }
  }
</script>
```

由于 HMTL 中的标签属性值无法使用除字符串以外的数据类型，所以组件内必须定义 props 的类型，如果一个 prop 值定义了多个类型，转换时取类型数组中的第一个类型进行转换，如需支持多种类型，请使用 JSON 的方式传递数据。

## Prop 的大小写 (camelCase vs kebab-case)

HTML 中的特性名是大小写不敏感的，所以浏览器会把所有大写字符解释为小写字符。这意味着当你在 HTML 中使用 MIP 组件时，camelCase (驼峰命名法) 的 prop 名需要使用其等价的 kebab-case (短横线分隔命名) 命名。所以，对于简单的数据类型，建议使用属性方式传递，复杂的数据使用 JSON 形式传递。

## 通过 `m-bind` 绑定数据

  ```html
  <mip-example m-bind:mip-props="mipProps"></mip-example>
  ```

如果使用 `m-bind` 绑定数据，MIP 会先把对应的值设置到属性值上，再通过属性传递到组件内部，也会经过属性转换过程。

## 数据转换规则

根据 props 属性类型定义，对类型转换规则如下：

### Number

规则：

```js
parseFloat(value, 10)
```

```html
<!-- 42 -->
<mip-example num="42"></mip-example>
```

### Boolean

规则：

```js
value !== 'false'
```

**注意** 只有明确写 `false` 才会被转换成 `false`

```html
<!-- true -->
<mip-example checked></mip-example>
<!-- true -->
<mip-example checked=""></mip-example>
<!-- true -->
<mip-example checked="0"></mip-example>
<!-- true -->
<mip-example checked="true"></mip-example>

<!-- false -->
<mip-example checked="false"></mip-example>
```

### Array

规则：

```js
jsonParse(value)
```

```html
<!-- [42] -->
<mip-example num="[42]"></mip-example>
<!-- [{a: 1}] -->
<mip-example num="[{a:1}]"></mip-example>
```

**注意** 实际 jsonParse 的解析规则比 JSON.parse 要宽松。

**参考**：[MIP.util.jsonParse](../../api/util/jsonParse.md)

### Object

```js
jsonParse(value)
```

```html
<!-- {} -->
<mip-example num="{}"></mip-example>
<!-- {a: 1} -->
<mip-example num="{a: 1}"></mip-example>
```

## 混合

JSON 和 属性同时写的情况下，属性的优先级比 JSON 的优先级高。属性值会直接覆盖 JSON 对应的值，不会做数据合并。

  ```html
  <!-- this.mipProps === 'changed' -->
  <mip-example mip-props="changed">
    <script type="application/json">
    {
      "mipProps": "mipProps"
    }
    </script>
  </mip-example>
  ```
