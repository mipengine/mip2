# MIP 2.0 的数据和应用

关于 MIP 2.0 的数据设置、绑定，请查看 `mip-bind` 章节，本节将介绍关于数据应用的实践。

## 支持多页共享数据

### 介绍

在 mip2 的环境里，我们提供整站沉浸式的体验，如果要打造复杂的业务场景，页面与页面之间共享数据是必不可少的。在原 `mip-data` 的基础上，mip2 新增了允许整站共享数据的概念

在讲解如何共享之前，我们首先来明晰一些概念

1. 页面数据：只有当前页面可以访问和使用
2. 共享数据：站内多页面可用
3. 页面可用数据/全局数据：页面数据 + 页面可用的共享数据
4. 站的概念：

    首次访问 mip2 页面 a.html 后，后续在 a.html 页面通过一定规则打开的其他 mip2 页面（假设为 b.html、c.html 等）都能读取和使用到 a 页面提供的共享数据， 同时b、c 页面也能够持续地丰富共享数据


### 具体使用方法

1. 设置数据时，如在需要共享的数据前添加 # 标识（仅检测数据第一层），该数据将被提升成共享态， 如：
    ```html
    <!-- a.html -->
    <mip-data>
        <script type="application/json">
            {
                "#global": 1,
                "#global2": 2,
                "name": "a"
            }
        </script>
    </mip-data>
    ```
    此时 a 页面可用的数据源为
    ```json
    {
        "global": 1,
        "global2": 2,
        "name": "a"
    }
    ```
    此时共享数据源为：
    ```json
    {
        "global": 1,
        "global2": 2
    }
    ```

2. 提升为共享态的数据将在站内每个页面(b、c)都能被读取和使用到;

    **如果** b 页面使用到了数据 global 而 b 页面自身的初始数据源中不存在该数据，mip2 将向上查找共享数据，如：
    ```html
    <!-- b.html -->
    <mip-data>
        <script type="application/json">
            {
                "name": "b",
                "age": 1
            }
        </script>
    </mip-data>
    ```
    此时 b 页面可用的数据源为
    ```json
    {
        "global": 1,
        "global2": 2,
        "name": "b",
        "age": 1
    }
    ```
    此时共享数据源为：
    ```json
    {
        "global": 1,
        "global2": 2
    }
    ```
    
    **如果** 页面自身的初始数据源存在与共享数据冲突的字段

	1. 若页面自身的数据没有 `#` 标识，将优先读取页面数据，不影响共享数据
    2. 若页面自身的数据带有 `#` 标识，将提升为共享数据，覆盖共享数据中同样字段的数据，同时影响其他使用了该共享数据的页面
        ```html
        <!-- c.html -->
        <mip-data>
            <script type="application/json">
                {
                    "#global": 2,
                    "global2": 2333,
                    "name": "c"
                }
            </script>
        </mip-data>
        ```
        此时 c 页面可用的数据源为
        ```json
        {
            "global": 2,
            "global2": 2333,
            "name": "c"
        }
        ```
        此时共享数据源为：
        ```json
        {
            "global": 2,
            "global2": 2
        }
3. 调用 MIP.setData 方法修改数据时
	1. 如果指定需要修改共享数据，则在数据前添加 `#` 标识，如：
        
        在 c 页面调用 `MIP.setData({'#global2': 3})`

        此时 c 页面可用的数据源为
        ```json
        {
            "global": 2,
            "global2": 2333,
            "name": "c"
        }
        ```
        此时共享数据源为：
        ```json
        {
            "global": 2,
            "global2": 3
        }

	2. 其余情况，mip2 会自行判断该数据是共享数据还是当前页面的数据，如果要修改的数据字段既存在于共享也存在于页面的数据源，将优先修改页面的数据源

        ① 如：在 c 页面调用 `MIP.setData({'global2': 3})`

        此时 c 页面可用的数据源为
        ```json
        {
            "global": 2,
            "global2": 3,
            "name": "c"
        }
        ```
        此时共享数据源不变，为：
        ```json
        {
            "global": 2,
            "global2": 2
        }
        ```

        ② 如：在 c 页面调用 `MIP.setData({'name': 'name-c'})`

        此时 c 页面可用的数据源为
        ```json
        {
            "global": 2,
            "global2": 2333,
            "name": "new-c"
        }
        ```
        此时共享数据源不变

## Html 页面中使用数据

如 `mip-bind` 章节介绍，在 html 页面中使用数据，可以通过 `m-bind` 或 `m-text` 来绑定数据。

## 组件内使用数据

**mip2 要求开发者以类单向数据流的方式使用数据**

仅允许在 html 页面使用 `m-bind` 来绑定数据，组件内部数据传递以 `props` 的形式传递。组件内部 ***不允许*** 使用 `m-bind` 语法来绑定全局数据。

如果组件内部实现存在自定义标签嵌套的情况，传递数据时 `应` 按照 vue 父子组件的写法来传递数据。

组件内部可以通过调用 `MIP.setData` 来修改全局数据，以此触发重新渲染。

如：

index.html：

```html
<mip-a m-bind:globaldata="globalState"></mip-a>
```

mip-a 组件内部：

```javascript
template: `
    <div>
        <mip-b :globaldata="globaldata"></mip-b>
        <p @click="changeData"></p>
    </div>
`,
props: {
    globaldata: {
        type: Object
    }
},
methods: {
    changeData() {
        MIP.setData({});
    }
}
```
