# mip-bind

`<mip-bind>` 是以数据驱动页面更新的功能，开发者通过配置数据信息，并绑定在相应 DOM 上，就可以轻松做到数据变动后 DOM 元素随之变动的效果，可以通过[示例](https://itoss.me/mip-test/src/mip-bind/view/ecommerce.html) 查看效果。

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本|https://c.mipcdn.com/static/v2/mip-bind/mip-bind.js

## 使用方法

### 设置数据

其中 `<mip-data>` 元素用于在页面中设置数据源，一个页面中可以指定多个 `<mip-data>`，最终数据会合并到一个数据源对象上。数据源的设置可以通过以下两种方式：

#### 固定数据

不经过异步请求，可通过 `application/json` 形式写入，如：

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

- 接收到请求后，判断请求头中的 `origin` 是否是允许的，其中允许的包括 `https://mipcache.bdstatic.com`, `https://站点域名转换的字符串.mipcdn.com` 和开发者站点 `origin`；
- 如果 `origin` 在指定的列表中则设置 `response header` 中的 `Access-Control-Allow-origin` 为请求接收到的 `origin`，以 Nodejs 举例，如下所示：

    ```
    var origins = {
        'https://mipcache.bdstatic.com': 1,
        'https://www-mipengine-org.mipcdn.com': 1,
        'https://www.mipengine.org': 1
    }
    app.get('/bind', function (req, res) {
        var ori = req.headers.origin;
        if (origins[ori]) {
            res.header('Access-Control-Allow-Origin', ori);
            res.json({});
        }
    });

    ```

### 绑定指令

目前绑定数据只支持两种功能：

#### `m-bind`

绑定元素属性信息。具体格式为 `m-bind:attrs=value`，即：将 attrs 属性值设置为 value，如：

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

[info] 如果通过 `m-bind` 绑定的数据为空值，即 "" 时，则删除该属性。

#### `m-text`
绑定元素 `textContent`。具体格式为 `m-text=value`，即：将元素的 `textContent` 设置为 `value` 的值，同样 `value` 为数据源中的属性名，多层数据可以以 `.` 连接，如：

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

### 修改数据

设置数据也是通过在 HTML 元素中加入事件来完成，方式是在元素中加入 `on` 属性。

#### 书写格式

事件数据修改的绑定形式如下，可支持多个事件同时定义，以空格分隔。

```
on="事件:MIP.setData({}) 事件:MIP.setData({}) 事件:MIP.setData({})"
```

#### 事件类型

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

#### 具体操作

- 修改方式

    - `MIP.setData(data)`

        该方法会将新增数据加入到数据源中，重复数据会进行覆盖。

    - 变量赋值

        数据源中所有数据，都可以通过 `m.` 的形式获取到，可直接在组件中通过 JS 来进行操作，如：

        ```
        <mip-data>
            <script type="application/json">
            {
                "name": "张三",
                "age": 25
            }
            </script>
        </mip-data>

        // 以下为组件中使用的示例代码
        <script type="text/javascript">
            // 打印 “张三”
            console.log(m.name);
        </script>
        ```
- 数据源

    设置的数据按照层级被合并到总的数据源中，后设置的数据会覆盖前者，如：

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
            "home": "北京"
        }
        </script>
    </mip-data>
    ```

    此时页面维护的数据源为：

    ```json
    {
        "name": "张三",
        "age": 25,
        "home": "北京"
    }
    ```

    如果此时在进行数据的设置：

    ```
    <div on="tap:MIP.setData({job:'互联网从业者', home: '上海'})"></div>

    ```

    此时数据源将变为：

    ```json
    {
        "name": "张三",
        "age": 25,
        "home": "上海",
        "job": "互联网从业者"
    }
    ```

- 数据表达式

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
    <div></div>
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

### 自定义事件

目前官方只提供部分事件，如果开发者在组件中有需要触发设置数据的时机，可以通过自定义事件来完成，具体实现方式如下：

```
var viewer = require('viewer');
viewer.eventAction.execute(自定义事件名, 事件元素, 事件);
```

如：

```
<mip-data>
    <script type="application/json">
    {
        "title": "Hi"
    }
    </script>
</mip-data>
<div m-text="title"></div>
<mip-form url="https://www.mipengine.org/">
    <input on="blur:MIP.setData({title:'Hello!'})" id="price" type='text'>
</mip-form>
// 以下为组件中使用的示例代码
<script type="text/javascript">
    var viewer = require('viewer');
    var ele = document.querySelector('#price');
    ele.addEventListener('blur', function (event) {
        viewer.eventAction.execute('blur', event.target, event);
    });
</script>
```
