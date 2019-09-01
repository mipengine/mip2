# 数据驱动与模板渲染

MIP 数据驱动机制通过数据绑定表达式来实现对节点属性和文本的控制，但在一些更为复杂的页面来说，还需要控制增删节点的能力，在这种情况下可以使用 [mip-list](https://www.mipengine.org/v2/components/dynamic-content/mip-list.html) 来实现这个需求。

[info] 本文的重点主要在于如何利用数据驱动 mip-list 来实现增删节点的功能，想要完整地了解 mip-list 的用法，可以查看 mip-list 的[组件文档说明](https://www.mipengine.org/v2/components/dynamic-content/mip-list.html)。

## mip-list 的模板渲染能力

mip-list 本身是一个列表渲染组件，通过异步加载分页数据，在前端渲染出新增的列表内容。mip-list 使用 mustache 语法来定义列表项的模板，因此基本满足简单到复杂的模板定义。

下面举一个较为复杂的数据结构和模板的例子：

```html
<mip-list>
  <script type="application/json">
  {
    "items": [{
      people: [
        { name: '李雷', gender: 'man' },
        { name: '韩梅梅', gender: 'woman' }
      ],
      "isMorning": true
    }]
  }
  </script>
  <template type="mip-mustache">
    <ul>
      {{#people}}
      <li class="{{gender}}">
        {{#isMorning}}早上好{{/#isMorning}}
        {{^isMorning}}您好{{/isMorning}}
        ，{{name}}
      </li>
      {{/people}}
    </ul>
  </template>
</mip-list>
```

有了模板，我们就可以通过操控数据来控制节点的渲染了，不同的数据将会渲染出不同的节点，从而起到控制增删节点的目的。

## mip-list 与 mip-data 的关联

mip-list 和 mip-data 一样，可以通过定义 `id` 和 `scope` 属性，这样 mip-list 的列表数据（数组）就会关联到 `id` 所指定的名字空间下了。

举个例子：

```html
<mip-list
  id="example2"
  scope
>
  <script type="application/json">
  {
    "items": [
      {
        "name": "李雷"
      },
      {
        "name": "韩梅梅"
      }
    ]
  }
  </script>
  <template type="mip-mustache">
    <div>你好，{{name}}</div>
  </template>
</mip-list>

<!-- 通过 p 标签观察 people 关联情况 -->
<p m-text="example2.map(item => item.name).join(', ')"></p>
```

效果如下所示：

<div class="example-wrapper">
  <mip-list
    id="example2"
    scope
  >
    <script type="application/json">
    {
      "items": [
        {
          "name": "李雷"
        },
        {
          "name": "韩梅梅"
        }
      ]
    }
    </script>
    <template type="mip-mustache">
      <div>你好，{{name}}</div>
    </template>
  </mip-list>

  <br>
  <br>
  <!-- 通过 p 标签观察 people 关联情况 -->
  <p m-text="example2.map(item => item.name).join(', ')"></p>
</div>

当 `<mip-list>` 加载完成时，就可以看到与 example2 进行文本绑定的 p 标签同时输出了 `李雷, 韩梅梅` 的文案，说明关联成功。这样，我们就可以通过操作 example2 实现对 mip-list 的操作。

- 新增列表项，本质上就是操作 example2 数组并往数组末尾增加新元素，本例使用了 `.concat` 方法实现。

在下边的示例代码实现的功能当中，用户可以通过 input 输入将要新增的节点的 name 属性，当输入值非空时再将其添加到列表当中，并同时清空输入框内容。

```html
<mip-form url="https://www.mipengine.org/api">
  <input m-bind:value="addName" type="text">
</mip-form>
<button
  on="tap:MIP.setData({
    example2: addName == ''
      ? example2
      : example2.concat({ name: addName }),
    addName: ''
  })"
>点击新增</button>
```

- 删除列表项，可以使用 `.filter` 或者 `.splice` 等方法，对满足条件的项进行过滤或删除。本例使用了 `.filter` 方法实现。

```html
<mip-form url="https://www.mipengine.org/api">
  <input m-bind:value="delName" type="text">
</mip-form>
<button
  on="tap:MIP.setData({
    example2: example2.filter(item => item.name === delName)
  })"
>点击删除</button>
```

- 修改某列表项，可以使用 `.map` 或者 `.splice` 等方法对满足条件的项进行替换。本里使用了 `.map`
 方法实现。

```html
<mip-form url="https://www.mipengine.org/api">
  <input m-bind:vaue="targetName" type="text">
  <input m-bind:value="modifyName" type="text">
</mip-form>
<button
  on="tap:MIP.setData({
    example2: example2.map(
      item => item.name === targetName
        ? { name: modifyName }
        : item
    )
  })"
>点击修改</button>
```

他们的效果如下所示：

<div class="example-wrapper">
  <mip-list
    id="example3"
    scope
  >
    <script type="application/json">
    {
      "items": [
        {
          "name": "李雷"
        },
        {
          "name": "韩梅梅"
        }
      ]
    }
    </script>
    <template type="mip-mustache">
      <div>你好，{{name}}</div>
    </template>
  </mip-list>

  <br>
  <br>
  <!-- 通过 p 标签观察 example3 关联情况 -->
  <p m-text="example3.map(item => item.name).join(', ')"></p>
  <div>
    <mip-form url="https://www.mipengine.org/api">
      <input m-bind:value="addName" type="text" placeholder="请输入新增名字" class="example-input">
    </mip-form>
    <button
      class="example-button"
      on="tap:MIP.setData({
        example3: addName == ''
          ? example3
          : example3.concat({ name: addName }),
        addName: ''
      })"
    >点击新增</button>
  </div>
  <div>
    <mip-form url="https://www.mipengine.org/api">
      <input m-bind:value="delName" type="text" placeholder="请输入要删除的名字" class="example-input">
    </mip-form>
    <button
      class="example-button"
      on="tap:MIP.setData({
        example3: example3.filter(item => item.name === delName)
      })"
    >点击删除</button>
  </div>
  <div>
    <mip-form url="https://www.mipengine.org/api">
      <input m-bind:vaue="targetName" type="text" placeholder="请输入原名字" class="example-input">
      <input m-bind:value="modifyName" type="text" placeholder="请输入新名字" class="example-input">
    </mip-form>
    <button
      class="example-button"
      on="tap:MIP.setData({
        example3: example3.map(
          item => item.name === targetName
            ? { name: modifyName }
            : item
        )
      })"
    >点击修改</button>
  </div>
</div>

## 渲染性能优化

mip-list 会监听数据列表的更改而重新编译 mustache 模板生成 HTML，如果直接将这些 HTML 将所有老节点全部替换掉将会导致糟糕的性能问题，因此我们在这里做了一些优化，在监听到数组数据发生更改时，都会对新旧数据进行 diff，然后对 diff 结果做以下操作：

1. 位置发生改变，但数据未发生变化的列表项，则只会操作数据所对应的节点进行移动操作；
2. 数据发生改变，但经过 mustache 渲染得到的 HTML 文本与旧数据一样，则进行操作 1；
3. 新增的列表项数据，将直接渲染出 HTML 并插入相应位置；
4. 移除的列表项数据，则直接将对应节点移除文档流；

因此在写 mustache 模板的时候，对于会经常变化的属性和文本，应采用数据绑定的方式，这样数据变化时经 mustache 渲染出来的 HTML 文本仍然是一样的，从而减少了不必要的节点操作。

下面举个简单的例子：

```html
<mip-list id="example4" scope>
  <script type="application/json">
  {
    "items": [
      {
        "name": "李雷",
        "index": 0
      },
      {
        "name": "韩梅梅",
        "index": 1
      }
    ]
  }
  </script>
  <template type="mip-mustache">
    <p m-text="'您好，' + example4[{{index}}].name"></p>
  </template>
</mip-list>
```

我们在前面例子的基础上，对数据项增加了 index 属性，并且将文本改成 `m-text` 绑定的方式，这样无论后续的交互当中，李雷的名称无论被修改成什么，对应的模板渲染出来的 HTML 都一直是：`<p m-text="'您好，' + example4[0].name"></p>`，根据前面提到的操作 2，就能够对原有节点进行复用，从而起到性能优化的目的。

