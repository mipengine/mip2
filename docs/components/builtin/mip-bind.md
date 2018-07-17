# mip-bind

`<mip-bind>` 是以数据驱动页面更新的功能，开发者通过配置数据信息，并绑定在相应 DOM 上，就可以轻松做到数据变动后 DOM 元素随之变动的效果，可以通过[示例](https://itoss.me/mip-test/src/mip-bind/view/ecommerce.html) 查看效果。

## 使用方法

### 1. 设置数据

其中 `<mip-data>` 元素用于在页面中设置数据源，一个页面中可以指定多个 `<mip-data>`，最终数据会合并到一个数据源对象 `m` 上。

MIP 仅支持开发者在 HTML 上使用数据表达式修改数据时使用 m（使用方法开发者将在后面的讲解中了解到），而开发者自行开发的组件等运行在沙盒环境中的代码，将**无法**使用 m 对象。

数据源的设置可以通过以下两种方式：

#### 内嵌数据

内嵌数据是指直接将数据嵌入到HTML页面中，提供给标签或自定义组件使用。要求符合 `JSON` 格式，如：

```
<mip-data>
    <script type="application/json">
    {
        "name": "张三",
        "age": 25,
        "job": {
            "desc": "互联网从业者",
            "location": "北京"
        }
    }
    </script>
</mip-data>
```

#### 异步数据

如果需要异步数据，则需指定 `src` 地址（**注：`src` 需要是 `https` 或 `//` 协议开头，否则在 HTTPS 环境下会出现问题**），请求回来的数据会自动合并到数据表里，如：

```
<mip-data src="https://www.example.org/data"></mip-data>
```

当使用这种方式获取异步数据时，**请注意：需要开发者服务端配置 cors 跨站访问，具体步骤如下**：

- 接收到请求后，判断请求头中的 `origin` 是否是允许的，其中需要允许的域名包括：`https://mipcache.bdstatic.com`、开发者的站点`origin` 、`https://站点域名转换的字符串.mipcdn.com` 。站点域名转换的字符串是指开发者的站点origin通过一定的规则（点.转换为中横线-）转换的字符串，如下面代码中的origins数组所示：origins[1]为开发者的站点origin，origins[2]为转换后的 origin；
- 如果 `origin` 在指定的列表中则设置 `response header` 中的 `Access-Control-Allow-Origin` 为请求接收到的 `origin`，以 Node.js 举例，如下所示：

    ```
    let origins = {
        'https://mipcache.bdstatic.com': 1,
        'https://www-mipengine-org.mipcdn.com': 1,
        'https://www.mipengine.org': 1
    }
    app.get('/bind', function (req, res) {
        let ori = req.headers.origin
        if (origins[ori]) {
            res.header('Access-Control-Allow-Origin', ori)
            res.json({})
        }
    })

    ```

#### 设置共享数据
详情请阅读 [MIP 2.0 的数据和应用](https://github.com/mipengine/mip2/blob/master/docs/components/data-and-method.md)

### 2. 使用数据
#### 绑定指令

MIP 通过 mip-bind 机制给开发者提供了两个绑定指令来绑定数据：

#### `m-bind`

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

[info] 如果通过 `m-bind` 绑定的数据为空值，即 "" 时，则删除当前元素的该属性 attrs。

#### `m-text`
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

#### 具体使用
##### 在 HTML 页面中

在 HTML 页面中使用数据，可以通过 `m-bind` 或 `m-text` 来绑定数据。

##### 在组件中

###### [规范]

1. 仅允许在 HTML 页面使用 `m-bind` 来绑定数据，以 `props` 的形式向组件传递数据。
2. 组件内部 ***不允许*** 使用 `m-bind` 语法来绑定全局数据，也无法直接读取到全局数据 `m`，仅允许绑定通过 `props `获得的数据。
3. 组件内部需要使用 `props` 预定义所需数据，并且显式指定一种数据类型。如果遵循了Vue语法指定了多种数据类型，MIP将默认取第一种。
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
      "list": [1, 2, 3],
      "num": 2,
      "msg": "info",
      "loading": false
    }
  </script>
</mip-data>
<mip-a m-bind:userinfo="userInfo"
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

#### class与style绑定
详情请阅读 [class与style绑定](https://github.com/mipengine/mip2/blob/master/docs/components/class-style-binding.md)

### 3. 修改数据
MIP 提供了全局方法 `MIP.setData(data)` 来让开发者修改数据，重复数据会进行覆盖。

这个方法接受一个对象作为参数，要设置的数据对象将按照层级被合并到总的数据源中，后设置的数据会覆盖前者（支持多层级的复杂对象的 deep 数据覆盖）。

如：

```
<mip-data>
    <script type="application/json">
    {
        "name": "张三",
        "age": 25
    }
    </script>
</mip-data>
<mip-data>
    <script type="application/json">
    {
        "detail": {
            "home": {
                "province": "北京",
                "city": "北京"
            }
        }
    }
    </script>
</mip-data>
```

此时页面维护的数据源为：

```json
{
    "name": "张三",
    "age": 25,
    "detail": {
        "home": {
            "province": "广东",
            "city": "深圳"
        }
    }
}
```

如果此时在进行数据的设置：

```
<div on="tap:MIP.setData({job:'互联网从业者',age:26})"></div>

```

此时数据源将变为：

```json
{
    "name": "张三",
    "age": 26,
    "detail": {
        "home": {
            "province": "广东",
            "city": "深圳"
        }
    },
    "job": "互联网从业者"
}
```

如果此时在进行数据的设置：

```
<div on="tap:MIP.setData({detail:{home:{city:'广州'}}})"></div>

```

此时数据源将变为：

```json
{
    "name": "张三",
    "age": 26,
    "detail": {
        "home": {
            "province": "广东",
            "city": "广州"
        }
    },
    "job": "互联网从业者"
}
```

需要注意的是，前面提到通过 `mip-data` 组件设置的数据要求符合标准的 JSON 格式。而 `setData` 方法虽然没有严格要求传 JSON 格式的对象，但是仅允许传 JSON 对象可以接受的数据，因此是不允许设置为 function 的。

修改数据既可以通过在 HTML 元素中加入事件来完成，方式是在元素中加入 `on` 属性监听事件以触发指定修改；也可以在组件代码中直接调用 `setData` 方法。

后者没有特殊要求，只需要开发者自行确认逻辑和数据即可。而前者的使用，对开发者的要求有两点：
1.	使用单引号来引用字符串；
2.	要修改的数据的值，如果是一个变量 `var`，需要是通过mip-data 组件设置的数据，并且通过 `m.var` 来获取

#### on 监听事件的书写格式

事件中数据修改的绑定形式如下，可支持多个事件同时定义，以空格分隔。

```
on="事件:MIP.setData({}) 事件:MIP.setData({}) 事件:MIP.setData({})"
```

##### 事件类型

针对所有元素

事件|描述
---|---
`tap`|单击事件
`doubletap`|双击事件
`swipe`|滑动事件

`<input>` 元素

事件|描述
---|---
`change`|输入框内容发生变化时候触发的事件

`<mip-form>` 元素

事件|描述
---|---
`submit`|提交时触发的事件
`submitSuccess`|提交成功后触发的事件
`submitError`|提交失败后触发的事件

#### setData 修改数据支持数据表达式

- 支持运算表达式解析，如：

```html
<mip-data>
    <script type="application/json">
    {
        "price": 20,
        "count": 2
    }
    </script>
</mip-data>
<div m-text="price"></div>
<button on="tap:MIP.setData({price:'30'})">30</button>
<button on="tap:MIP.setData({price:30*m.count})">30*m.count</button>
```

- 支持 dom 元素解析

`<mip-bind>` 支持 DOM 元素解析，在设置的数据中，可通过 DOM 变量来表示当前事件触发的源 DOM 元素，并可通过其获取元素上的属性值等，如：

```html
<mip-data>
    <script type="application/json">
    {
        "price": 20
    }
    </script>
</mip-data>
<div>
    DOM.value*m.price = <span m-text="price"></span>
</div>
<mip-form url="https://www.mipengine.org/">
    <input type='text' on="change:MIP.setData({price:DOM.value*m.price})">
</mip-form>
```

### 4. 观察数据

提供 `MIP.watch(value, cb)` 全局方法注册观察行为。

其中 `value` 为数据源中的属性名，多层数据可以以 `.` 连接，允许是单个字符串或字符串数组。
`cb` 为当被观察的属性 value 发生数据变化时要执行的回调函数，接收一个参数，为 `newValue`。

观察数据的前提，是这个数据已经通过 `mip-data` 组件设置过。假如是通过 `mip-data` 的异步方式获取数据的，还需要等待异步数据设置完成。 MIP 提供全局变量 `mipDataPromises`，这是一个获取异步数据的 Promise 对象数组，如果当前没有获取异步数据的任务或任务已完成，则该数组为空。若该数组不为空，同时开发者需要观察的数据即为异步数据时，为确保观察正常执行，需要把 `MIP.watch` 的执行放到 Promise 的回调函数中。

#### 示例：

通过调用 `watch` 方法，监听 num 和 img.first 的数据变化，并在 num 变化时改变 img.first 的值，从而触发 title 的数据变化。

```html
<mip-data>
    <script type="application/json">
    {
        "num": 1,
        "title": "Initial num = 1",
        "img": {
            "first": ""
        }
    }
    </script>
</mip-data>
<p m-text="title"></p>
<div>
    num = DOM.value = <span m-text="num"></span>
</div>
<input type='text' on="change:MIP.setData({num:DOM.value})">
<mip-script >
    MIP.watch('num', newValue => {
        MIP.setData({
            img: {
                first: 'img.first changed due to num changed to' + newValue
            }
        })
    })
    MIP.watch('img.first', newVal => {
        MIP.setData({
            title: newVal
        })
    })
    MIP.watch(['num', 'img.first'], newVal => {
        console.log('multiple')
    })
</mip-script>
```
