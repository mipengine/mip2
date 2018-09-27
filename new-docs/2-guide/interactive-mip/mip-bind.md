# mip-bind 绑定数据

MIP 中的 `mip-bind` 机制提供了两个指令给开发者用于在 HTML 元素上绑定和使用此前用 `mip-data` 设置的数据，以数据驱动页面更新（可以通过[示例](https://itoss.me/mip-test/src/mip-bind/view/ecommerce.html) 查看效果），下面我们来逐一介绍。

## 绑定指令 `m-bind`

绑定元素属性信息。具体格式为 `m-bind:attrs="value"`，即：将 attrs 属性值设置为 value 的值，value 为数据源中的属性名，多层数据可以以 `.` 连接，如：

```html
<!-- 绑定 placeholder 值 -->
<mip-data>
  <script type="application/json">
    {
      "placeholder": "请输入内容"
    }
  </script>
</mip-data>
<mip-form url="https://www.mipengine.org/">
  <input m-bind:placeholder="placeholder">
</mip-form>
```

```html
<!-- 变更样式 -->
<style mip-custom>
[data-clicked=true] {
  background: pink;
}
</style>
<mip-data>
  <script type="application/json">
    {
      "clicked": false
    }
  </script>
</mip-data>
<span m-bind:data-clicked="clicked" on="tap:MIP.setData({clicked:!m.clicked})">来点我呀！</span>
```

```html
<!-- 切换 tab 功能实现 -->
<style mip-custom>
#content, .filter {
  text-align: center;
  padding-top: 10px;
}
#content span,
#content mip-img,
#content mip-video {
  display: none;
}
.first span,
.second mip-img,
.third mip-video {
  display: block !important;
}
</style>
<mip-data>
  <script type="application/json">
    {
      "clickedClass": "second"
    }
  </script>
</mip-data>
<mip-vd-tabs>
  <section>
    <li>第一页</li>
    <li>第二页</li>
    <li>第三页</li>
  </section>
  <div class="filter">
    <span on="tap:MIP.setData({clickedClass:'first'})">文字</span>
    <span on="tap:MIP.setData({clickedClass:'second'})">图片</span>
    <span on="tap:MIP.setData({clickedClass:'third'})">视频</span>    
  </div>    
</mip-vd-tabs>
<div id="content" m-bind:class="clickedClass">
  <span>我是文案啦！</span>
  <mip-img layout="responsive" width="350" height="263" src="https://www.mipengine.org/static/img/sample_01.jpg"></mip-img>
  <mip-video poster="https://www.mipengine.org/static/img/sample_04.jpg" controls layout="responsive" width="640" height="360" src="https://gss0.bdstatic.com/-b1Caiqa0d9Bmcmop9aC2jh9h2w8e4_h7sED0YQ_t9iCPK/mda-gjkt21pkrsd8ae5y/mda-gjkt21pkrsd8ae5y.mp4"></mip-video>
</div>
<script src="https://c.mipcdn.com/static/v1/mip-vd-tabs/mip-vd-tabs.js"></script>
```

>**注意：**
>如果通过 `m-bind` 绑定的数据为空值，即 "" 时，则删除当前元素的该属性 attrs。

## 绑定指令 `m-text`
绑定元素 `textContent`。具体格式为 `m-text="value"`，即：将元素的 `textContent` 设置为 `value` 的值，同样 `value` 为数据源中的属性名，多层数据可以以 `.` 连接，如：

```html
<mip-data>
  <script type="application/json">
    {
      "loc": "北京",
      "job": {
        "desc": "互联网从业者"
      }
    }
  </script>
</mip-data>
<p>坐标：<span m-text="loc"></span></p>
<p>职位信息：<span m-text="job.desc"></span></p>
```

## 使用
### 在 HTML 页面中

在 HTML 页面中使用数据，可以通过 `m-bind` 或 `m-text` 来绑定数据。

### 在组件中

#### [规范]

1. 仅允许在 HTML 页面使用 `m-bind` 来绑定数据，以 `props` 的形式向组件传递数据。
2. 组件内部 ***不允许*** 使用 `m-bind` 语法来绑定全局数据，也无法直接读取到全局数据 `m`，仅允许绑定通过 `props `获得的数据。
3. 组件内部需要使用 `props` 预定义所需数据，并且显式指定一种数据类型。如果遵循了 Vue 语法指定了多种数据类型，MIP 将默认取第一种。
4. 如果组件内部实现存在自定义标签嵌套的情况，传递数据时 应按照 Vue 父子组件的写法来传递数据。

组件内部可以通过调用 `MIP.setData` 来修改全局数据，以此触发重新渲染。

如：

index.html：

```html
<mip-data>
  <script type="application/json">
    {
      "userInfo": {
        "name": "baidu"
      },
      "anotherObject": {
        "name": "sfe"
      },
      "list": [1, 2, 3],
      "num": 2,
      "msg": "info",
      "loading": false
    }
  </script>
</mip-data>
<mip-a
  m-bind:userinfo="userInfo"
  m-bind:another-object="anotherObject"
  m-bind:list="list"
  m-bind:num="num"
  m-bind:msg="msg"
  m-bind:loading="loading"></mip-a>
```

mip-a 组件内部：

```javascript
<template>
  <div>
    <mip-b :userinfo="userinfo"></mip-b>
    <p @click="changeData"></p>
    <p v-if="loading">{{msg}}</p>
  </div>
</template>

<script>
export default {
  props: {
    userinfo: {
      type: Object,
      default () {
        return {}
      }
    },
    anotherObject: {
      type: Object,
      default () {
        return {}
      }
    },
    list: {
      type: Array
    },
    num: Number,
    loading: Boolean,
    msg: String
  },
  methods: {
    changeData() {
      MIP.setData({
        userInfo: {
          name: 'baidu2'
        }
      })
    }
  }
}
</script>
```

mip-b 组件内部：

```javascript
<template>
  <p>{{userinfo.name}}</p>
</template>

<script>
export default {
  props: {
    userinfo: {
      type: Object,
      default () {
        return {}
      }
    }
  }
}
</script>
```
>**注：**
>请留意上面例子中 HTML 与 mip-a 组件实现两段代码里面的 userinfo 和 anotherObject 的绑定示例。由于 m-bind 的基本原理是将动态数据绑定到指定 attribute 上，而我们知道，HTML 标签的 attribute 要求小写（即使写了大写也会转换为小写），因此如果开发者想要在组件里使用驼峰命名变量，请使用短横线(kebab-case)的方式指定 attribute。

### 在 `mip-script` 组件中
`mip-script` 组件允许开发者编写自定义的 JavaScript 代码，作用类似于 script 标签。其具体用法和规范开发者将在后面的小节了解到。

此处我们将借这个组件来向开发者介绍一个读取数据的 API：`MIP.getData(value)`。`value` 为数据源中的属性名，多层数据可以以` . `连接。注意，`getData` 方法在组件中并不开放使用，请开发者遵循前面的在组件中使用数据的规范。

在使用 mip-script 自定义 JS 代码时，如有数据操作的需要，开发者可以通过 `getData` 方法读取和使用数据。下面的例子实现了一个简单的多选功能，最终输出选中的目录序号。例子中使用到的 setData 设置数据方法、watch 监控数据方法均在后面的小节会详细讲解。如:

```html
<mip-data>
  <script type="application/json">
    {
      "i": 0,
      "selectedStr": "",
      "selected": []
    }
  </script>
</mip-data>
<ul>
  <li on="tap:MIP.setData({i:1})">目录1</li>
  <li on="tap:MIP.setData({i:2})">目录2</li>
  <li on="tap:MIP.setData({i:3})">目录3</li>
</ul>
<p>selected: <span m-text="selectedStr"></span></p>

<mip-script>
  MIP.watch('i', function (newVal) {
    let selected = MIP.getData('selected')
    let index = selected.indexOf(newVal)

    if (index) {
      selected.splice(index, 1)
    } else {
      selected.push(index)
    }

    MIP.setData('selectedStr', selected.join(','))
  })
</mip-script>
```