# Vue 自定义元素接口

Vue 自定义元素组件是在 MIP.CustomElement 的基础上进行封装的，暴露的接口和 Vue Component 选项基本一致，除此之外还暴露了部分 MIP.CustomElement 的接口。对于部分不支持的 API 依然会列出来，并标识 **不支持**。

## 选项 / 渲染时机

### prerenderAllowed

  - **MIP 组件新增**

  - **类型**：`{ Function }`

  - **详细**：

    出于性能考虑，正常组件的 Vue 实例初始化的时机是 [firstInviewCallback](#firstInviewCallback) 生命周期，如果需要提前渲染可以通过设置 prerenderAllowed 返回 true 提前到 [connectedCallback](#connectedCallback) 生命周期执行

  - **参数**
    - elementRect `{Rect}` element 的位置信息，包含 `{left, top, width, height, right bottom}`
    - viewportRect `{Rect}` viewport 的位置信息, 包含 `{left, top, width, height, right bottom}`

## 选项 / 数据

### data

- **类型**：`Object | Function`

- **限制**：组件的定义只接受 `function`。

- **详细**：

  Vue 实例的数据对象。Vue 将会递归将 data 的属性转换为 getter/setter，从而让 data 的属性能够响应数据变化。**对象必须是纯粹的对象 (含有零个或多个的 key/value 对)**：浏览器 API 创建的原生对象，原型上的属性会被忽略。大概来说，data 应该只能是数据 - 不推荐观察拥有状态行为的对象。

  一旦观察过，不需要再次在数据对象上添加响应式属性。因此推荐在创建实例之前，就声明所有的根级响应式属性。

  实例创建之后，可以通过 `vm.$data` 访问原始数据对象。Vue 实例也代理了 data 对象上所有的属性，因此访问 `vm.a` 等价于访问 `vm.$data.a`。

  以 `_` 或 `$` 开头的属性 **不会** 被 Vue 实例代理，因为它们可能和 Vue 内置的属性、API 方法冲突。你可以使用例如 `vm.$data._property` 的方式访问这些属性。

  当一个**组件**被定义，`data` 必须声明为返回一个初始数据对象的函数，因为组件可能被用来创建多个实例。如果 `data` 仍然是一个纯粹的对象，则所有的实例将**共享引用**同一个数据对象！通过提供 `data` 函数，每次创建一个新实例后，我们能够调用 `data` 函数，从而返回初始数据的一个全新副本数据对象。

- **示例**：

  ``` html
  <script>
    export default {
      data() {
        return {
          name: 'fake'
        }
      }
    }
  </script>
  ```

  注意，如果你为 `data` 属性使用了箭头函数，则 `this` 不会指向这个组件的实例，不过你仍然可以将其实例作为函数的第一个参数来访问。

  ```js
  data: vm => ({ a: vm.myProp })
  ```

### props

- **类型**：`Array<string> | Object`

- **详细**：

  props 可以是数组或对象，用于接收来自父组件的数据。props 可以是简单的数组，或者使用对象作为替代，对象允许配置高级选项，如类型检测、自定义校验和设置默认值。

  在 MIP 标签上传入的属性值会通过 props 定义的第一个类型进行转换，但是通过 `<script type="application/json">{}</script>` 传入的 props 数据不会进行数据转换，而是通过 JSON parse 直接解析，如果不符合 props 定义的类型校验，在开发环境下会警告。

- **示例**：

  ``` html
  <script>
    // 简单语法
    export default {
      props: ['size', 'myMessage']
    }
  </script>
  ```

  ``` html
  <script>
    // mip-example
    export default {
      // 检测类型
      height: Number,
      // 检测类型 + 其他验证
      age: {
        type: Number,
        default: 0,
        required: true,
        validator: function (value) {
          return value >= 0
        }
      }
    }
  </script>
  ```
  ```html
  <!--  警告 age 没有传递  -->
  <mip-example></example>

  <!--  自动类型转换，取到 Number 类型的 1  -->
  <mip-example age="1"></example>

  <!--  取到 NaN  -->
  <mip-example age="one"></example>

  <!--  取到 "1", 并警告类型错误  -->
  <mip-example>
    <script type="application/json">
      {
        "age": "1"
      }
    </script>
  </example>
  ```

  对于一个 prop 需要同时支持多个类型的组件，请使用 `<script type="application/json"></script>` 方式声明 props 值。

- **参考**：[Vue Props](https://cn.vuejs.org/v2/guide/components.html#Props)

### propsData

- **类型**：`{ [key: string]: any }`

- **详细**：

  创建实例时传递 props。主要作用是方便测试。

- **示例**：

  ``` html
  <script>
    export default {
      propsData: {
        age: 1
      }
    }
  </script>
  ```

### computed

- **类型**：`{ [key: string]: Function | { get: Function, set: Function } }`

- **详细**：

  计算属性将被混入到 Vue 实例中。所有 getter 和 setter 的 this 上下文自动地绑定为 Vue 实例。

  注意如果你为一个计算属性使用了箭头函数，则 `this` 不会指向这个组件的实例，不过你仍然可以将其实例作为函数的第一个参数来访问。

  ```js
  computed: {
    aDouble: vm => vm.a * 2
  }
  ```

  计算属性的结果会被缓存，除非依赖的响应式属性变化才会重新计算。注意，如果某个依赖 (比如非响应式属性) 在该实例范畴之外，则计算属性是**不会**被更新的。

- **示例**：


  ``` html
  <script>
    export default {
      data: { a: 1 },
      computed: {
        // 仅读取
        aDouble: function () {
          return this.a * 2
        },
        // 读取和设置
        aPlus: {
          get: function () {
            return this.a + 1
          },
          set: function (v) {
            this.a = v - 1
          }
        }
      }
    }
  </script>
  ```

- **参考**：[Vue 计算属性](https://cn.vuejs.org/v2/guide/computed.html)

### methods

- **类型**：`{ [key: string]: Function }`

- **详细**：

  methods 将被混入到 Vue 实例中。可以直接通过 Vue 实例访问这些方法，或者在指令表达式中使用。方法中的 `this` 自动绑定为 Vue 实例。

  > 注意，**不应该使用箭头函数来定义 method 函数** (例如 `plus: () => this.a++`)。理由是箭头函数绑定了父级作用域的上下文，所以 `this` 将不会按照期望指向 Vue 实例，`this.a` 将是 undefined。

- **示例**：

  ``` html
  <script>
  export default {
    data: { a: 1 },
    methods: {
      plus: function () {
        this.a++
      }
    }
  }
  </script>
  ```

### watch

- **类型**：`{ [key: string]: string | Function | Object | Array }`

- **详细**：

  一个对象，键是需要观察的表达式，值是对应回调函数。值也可以是方法名，或者包含选项的对象。Vue 实例将会在实例化时调用 `$watch()`，遍历 watch 对象的每一个属性。

- **示例**：

  ``` html
  <script>
  export default {
    data: {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: {
        f: {
          g: 5
        }
      }
    },
    watch: {
      a: function (val, oldVal) {
        console.log('new: %s, old: %s', val, oldVal)
      },
      // 方法名
      b: 'someMethod',
      // 深度 watcher
      c: {
        handler: function (val, oldVal) { /* ... */ },
        deep: true
      },
      // 该回调将会在侦听开始之后被立即调用
      d: {
        handler: function (val, oldVal) { /* ... */ },
        immediate: true
      },
      e: [
        function handle1 (val, oldVal) { /* ... */ },
        function handle2 (val, oldVal) { /* ... */ }
      ],
      // watch vm.e.f's value: {g: 5}
      'e.f': function (val, oldVal) { /* ... */ }
    }
  }
  </script>
  ```

  > 注意，**不应该使用箭头函数来定义 watcher 函数** (例如 `searchQuery: newValue => this.updateAutocomplete(newValue)`)。理由是箭头函数绑定了父级作用域的上下文，所以 `this` 将不会按照期望指向 Vue 实例，`this.updateAutocomplete` 将是 undefined。

## 选项 / 生命周期钩子

所有 Vue 的生命周期钩子自动绑定 `this` 上下文到实例中，因此你可以访问数据，对属性和方法进行运算。这意味着**你不能使用箭头函数来定义一个生命周期方法** (例如 `created: () => this.fetchTodos()`)。这是因为箭头函数绑定了父上下文，因此 `this` 与你期待的 Vue 实例不同，`this.fetchTodos` 的行为未定义。但是由于部分 MIP.CustomElement 的生命周期钩子执行时 Vue 实例还未创建，所以自动绑定 `this` 上下文到 CustomElement 实例中。

### beforeCreate

- **类型**：`Function`

- **上下文**: Vue 组件实例

- **详细**：

  在实例初始化之后，数据观测 (data observer) 和 event/watcher 事件配置之前被调用。

### created

- **类型**：`Function`

- **上下文**: Vue 组件实例

- **详细**：

  在实例创建完成后被立即调用。在这一步，实例已完成以下的配置：数据观测 (data observer)，属性和方法的运算，watch/event 事件回调。然而，挂载阶段还没开始，`$el` 属性目前不可见。

### beforeMount

- **类型**：`Function`

- **上下文**: Vue 组件实例

- **详细**：

  在挂载开始之前被调用：相关的 `render` 函数首次被调用。


### mounted

- **类型**：`Function`

- **上下文**: Vue 组件实例

- **详细**：

  `el` 被新创建的 `vm.$el` 替换，并挂载到实例上去之后调用该钩子。如果 root 实例挂载了一个文档内元素，当 `mounted` 被调用时 `vm.$el` 也在文档内。

  注意 `mounted` **不会**承诺所有的子组件(内部 Vue 组件，并非 MIP 组件)也都一起被挂载。如果你希望等到整个视图都渲染完毕，可以用 `vm.$nextTick` 替换掉 `mounted`：


### beforeUpdate

- **类型**：`Function`

- **上下文**: Vue 组件实例

- **详细**：

  数据更新时调用，发生在虚拟 DOM 打补丁之前。这里适合在更新之前访问现有的 DOM，比如手动移除已添加的事件监听器。

### updated

- **类型**：`Function`

- **上下文**: Vue 组件实例

- **详细**：

  由于数据更改导致的虚拟 DOM 重新渲染和打补丁，在这之后会调用该钩子。

  当这个钩子被调用时，组件 DOM 已经更新，所以你现在可以执行依赖于 DOM 的操作。然而在大多数情况下，你应该避免在此期间更改状态。如果要相应状态改变，通常最好使用[计算属性](#computed)或 [watcher](#watch) 取而代之。

  注意 `updated` **不会**承诺所有的子组件也都一起被重绘。如果你希望等到整个视图都重绘完毕，可以用 [vm.$nextTick](#vm-nextTick) 替换掉 `updated`：

  ``` js
  updated: function () {
    this.$nextTick(function () {
      // Code that will run only after the
      // entire view has been re-rendered
    })
  }
  ```

### beforeDestroy

- **类型**：`Function`

- **上下文**: Vue 组件实例

- **详细**：

  实例销毁之前调用。在这一步，实例仍然完全可用。

### destroyed

- **类型**：`Function`

- **上下文**: Vue 组件实例

- **详细**：

  Vue 实例销毁后调用。调用后，Vue 实例指示的所有东西都会解绑定，所有的事件监听器会被移除，所有的子实例也会被销毁。

### firstInviewCallback

- **MIP 组件新增**

- **类型**：`Function`

- **上下文**: Vue 组件实例

- **参数**
    - element `{Element}` Element 实例

- **详细**：

    自定义元素的生命周期钩子，在元素挂载到 DOM 上之后，首次出现在视口内上时执行。适合做懒加载之类的功能。

### connectedCallback

- **MIP 组件新增**

- **类型**：`Function`

- **上下文**: CustomElement

- **参数**
    - element `{Element}` Element 实例

- **详细**：

    自定义元素的生命周期钩子，元素挂载到 DOM 上之后执行，该钩子在执行 mounted 之后执行。

### disconnectedCallback

- **MIP 组件新增**

- **类型**：`Function`

- **上下文**: CustomElement

- **参数**
    - element `{Element}` Element 实例

- **详细**：

    自定义元素的生命周期钩子，元素从 DOM 上移除之后执行。

## 选项 / 资源

### directives

- **类型**：`Object`

- **详细**：

包含 Vue 实例可用指令的哈希表。

- **参考**：[自定义指令](https://cn.vuejs.org/v2/guide/custom-directive.html)

### filters

- **类型**：`Object`

- **详细**：

包含 Vue 实例可用过滤器的哈希表。

- **参考**：[`Vue.filter`](https://cn.vuejs.org/v2/guide/filters.html)

### components

- **类型**：`Object`

- **详细**：

包含 Vue 实例可用组件的哈希表。

- **参考**：[组件](https://cn.vuejs.org/v2/guide/components.html)

## 选项 / 组合

### mixins

- **类型**：`Array<Object>`

- **详细**：

  `mixins` 选项接受一个混入对象的数组。这些混入实例对象可以像正常的实例对象一样包含选项，他们将在 `Vue.extend()` 里最终选择使用相同的选项合并逻辑合并。举例：如果你的混入包含一个钩子而创建组件本身也有一个，两个函数将被调用。
  Mixin 钩子按照传入顺序依次调用，并在调用组件自身的钩子之前被调用。

- **示例**：

  ``` html
  <script>
  let mixin = {
    created: function () { console.log(1) }
  }
  export default {
    created: function () { console.log(2) },
    mixins: [mixin]
  })
  // => 1
  // => 2
  </script>
  ```

- **参考**：[混入](https://cn.vuejs.org/v2/guide/mixins.html)

### extends

- **类型**：`Object | Function`

- **详细**：

  允许声明扩展另一个组件(可以是一个简单的选项对象或构造函数)，而无需使用 `Vue.extend`。这主要是为了便于扩展单文件组件。

  这和 `mixins` 类似。

- **示例**：

  ``` html
  <script>
    let CompA = { ... }

    export default {
      created: function () { console.log(2) },
      extends:  // 在没有调用 `Vue.extend` 时候继承 CompA
    })
  </script>
  ```

## 选项 / 其它

### name

- **类型**：`string`

- **限制**：只有作为组件选项时起作用。

- **详细**：

  允许组件模板递归地调用自身。注意，组件在全局用 `Vue.component()` 注册时，全局 ID 自动作为组件的 name。

  指定 `name` 选项的另一个好处是便于调试。有名字的组件有更友好的警告信息。通过提供 `name` 选项，可以获得更有语义信息的组件树。

## 实例属性

### vm.$data

- **类型**：`Object`

- **详细**：

  Vue 实例观察的数据对象。Vue 实例代理了对其 data 对象属性的访问。

- **参考**：[选项 / 数据 - data](#data)

### vm.$props

- **类型**：`Object`

- **详细**：

  当前组件接收到的 props 对象。Vue 实例代理了对其 props 对象属性的访问。

### vm.$el

- **类型**：`HTMLElement`

- **只读**

- **详细**：

  Vue 实例使用的根 DOM 元素。实际是 MIP 自定义元素的第一个子元素

### vm.element

- **MIP 新增**

- **类型**：`HTMLElement`

- **只读**

- **详细**：

  MIP 自定义元素的真实 element 实例。可以通过该属性访问到自定义元素的 Element 实例。 也可以获取 CustomElement 实例。

  ```html
  <script>
    export default {
      created() {
        // <mip-example><div class="child"></div></mip-example>
        console.log(this.element)

        // VueCustomElement
        console.log(this.element.customElement)
      }
    }
  </script>
  ```

  ```html
  <mip-example>
    <div class="child"></div>
  </mip-example>
  ```

### vm.$options

- **类型**：`Object`

- **只读**

- **详细**：

  用于当前 Vue 实例的初始化选项。

### vm.$parent

- **类型**：`Vue instance`

- **只读**

- **详细**：

  父实例。

### vm.$root

- **类型**：`Vue instance`

- **只读**

- **详细**：

  当前组件树的根 Vue 实例。

### vm.$children

- **类型**：`Array<Vue instance>`

- **只读**

- **详细**：

  当前实例的直接子组件。**需要注意 `$children` 并不保证顺序，也不是响应式的。**如果你发现自己正在尝试使用 `$children` 来进行数据绑定，考虑使用一个数组配合 `v-for` 来生成子组件，并且使用 Array 作为真正的来源。

### vm.$slots

- **类型**：`{ [name: string]: ?Array<Node> }`

- **只读**

- **详细**：

  **这里的 $slots 元素不是 VNode，而是 DOM Node**，这点和 Vue 的 VNode 不一致，不建议通过 JS 获取 $slots 节点。
  用来访问被插槽分发的内容。每个具名插槽有其相应的属性 (例如：`slot="foo"` 中的内容将会在 `vm.$slots.foo` 中被找到)。`default` 属性包括了所有没有被包含在具名插槽中的节点。

### vm.$refs

- **类型**：`Object`

- **只读**

- **详细**：

  一个对象，持有注册过 [`ref` 特性](#ref) 的所有 DOM 元素和组件实例。

### vm.$attrs

- **不支持**

- **类型**：`{ [key: string]: string }`

- **只读**

- **详细**：不支持从 MIP 组件中获取全部属性，请通过通过 getAttribute 获取未在 props 中定义的属性


### vm.$listeners

- **类型**：`{ [key: string]: Function | Array<Function> }`

- **只读**

- **详细**：

  包含了父作用域中的 (不含 `.native` 修饰器的) `v-on` 事件监听器。它可以通过 `v-on="$listeners"` 传入内部组件——在创建更高层次的组件时非常有用。

## 实例方法 / 数据

### vm.$watch( expOrFn, callback, [options] )

- **参数**：
  - `{string | Function} expOrFn`
  - `{Function | Object} callback`
  - `{Object} [options]`
    - `{boolean} deep`
    - `{boolean} immediate`

- **返回值**：`{Function} unwatch`

- **用法**：

  观察 Vue 实例变化的一个表达式或计算属性函数。回调函数得到的参数为新值和旧值。表达式只接受监督的键路径。对于更复杂的表达式，用一个函数取代。

  > 注意：在变异 (不是替换) 对象或数组时，旧值将与新值相同，因为它们的引用指向同一个对象/数组。Vue 不会保留变异之前值的副本。

- **示例**：

  ``` js
  // 键路径
  vm.$watch('a.b.c', function (newVal, oldVal) {
    // 做点什么
  })

  // 函数
  vm.$watch(
    function () {
      return this.a + this.b
    },
    function (newVal, oldVal) {
      // 做点什么
    }
  )
  ```

  `vm.$watch` 返回一个取消观察函数，用来停止触发回调：

  ``` js
  let unwatch = vm.$watch('a', cb)
  // 之后取消观察
  unwatch()
  ```

- **选项：deep**

  为了发现对象内部值的变化，可以在选项参数中指定 `deep: true` 。注意监听数组的变动不需要这么做。

  ``` js
  vm.$watch('someObject', callback, {
    deep: true
  })
  vm.someObject.nestedValue = 123
  // callback is fired
  ```

- **选项：immediate**

  在选项参数中指定 `immediate: true` 将立即以表达式的当前值触发回调：

  ``` js
  vm.$watch('a', callback, {
    immediate: true
  })
  // 立即以 `a` 的当前值触发回调
  ```

### vm.$set( target, key, value )

- **参数**：
  - `{Object | Array} target`
  - `{string | number} key`
  - `{any} value`

- **返回值**：设置的值。

- **用法**：

  这是全局 `Vue.set` 的**别名**。

- **参考**：[Vue.set](https://cn.vuejs.org/v2/api/#Vue-set)

### vm.$delete( target, key )

- **参数**：
  - `{Object | Array} target`
  - `{string | number} key`

- **用法**：

  这是全局 `Vue.delete` 的**别名**。

- **参考**：[Vue.delete](https://cn.vuejs.org/v2/api/#Vue-delete)

## 实例方法 / 事件

### vm.$on( event, callback )

- **参数**：
  - `{string} event`
  - `{Function} callback`

- **用法**：

  1. 监听当前实例上的自定义事件。事件可以由`vm.$emit`触发。回调函数会接收所有传入事件触发函数的额外参数。

  2. 同时绑定执行绑定 MIP 组件的 addEventAction 方法

  ```js
  this.$element.customElement.addEventAction('actionName', function (event, str) {})
  ```

### vm.$once( event, callback )

- **参数**：
  - `{string} event`
  - `{Function} callback`

- **用法**：

  监听一个自定义事件，但是只触发一次，在第一次触发之后移除监听器。

### vm.$off( [event, callback] )

- **参数**：
  - `{string} event`
  - `{Function} [callback]`

- **用法**：

  移除自定义事件监听器。

  - 如果没有提供参数，则移除所有的事件监听器；

  - 如果只提供了事件，则移除该事件所有的监听器；

  - 如果同时提供了事件与回调，则只移除这个回调的监听器。

### vm.$emit( eventName, [...args] )

- **参数**：
  - `{string} eventName`
  - `[...args]`

  1. 触发当前实例上的事件。

  2. 触发 MIP 组件自定义事件，同 `MIP.viewer.eventAction.execute(eventName, element, event)`

  3. 触发 MIP 组件标签的原始事件

  - **示例**

  ``` html
  <mip-a id="counter"></mip-a>
  <mip-b on="show:counter.add(1)"></mip-b>
  ```

  MIP extensions `mip-a`
  ```html
  <template>
    <div >
      counter: {{count}}
    </div>
  </template>
  <script>
  export {
    data() {
      return {
        count: 0
      }
    },
    mounted() {
      // 添加 add 行为
      this.$on('add', (event, num) => this.add(parseInt(num, 10)))
    },
    methods: {
      add(num) {
        this.count += num
      }
    }
  }
  <script>
  ```

  MIP extensions `mip-b`
  ```html
  <template>
    <div >
      <div @click="onClick">
        <span v-if="show">点击隐藏内容</span>
        <span v-else>点击显示内容</span>
      </div>
      <div v-if="show">
        MIP 提供了强大的组件DOM通信，组件间通信功能，以解决在MIP组件开发中遇到的组件交互问题。可以通过 DOM 属性来触发某个 MIP 元素的自定义事件。
      </div>
    </div>
  </template>
  <script>
  export {
    data() {
      return {
        show: false
      }
    },
    methods: {
      onClick() {
        this.show = !this.show
        // 触发 show 事件
        this.$emit(this.show ? 'show' : 'close', {})
      }
    }
  }
  <script>
  ```

  从上述例子中 `mip-a` 向外暴露了 `add` 行为 (action)，`mip-b` 向外暴露了 `show` 和 `close` 事件 (event)

## 实例方法 / 生命周期

### vm.$mount( [elementOrSelector] )

- **不支持**

### vm.$forceUpdate()

- **示例**：

  迫使 Vue 实例重新渲染。注意它仅仅影响实例本身和插入插槽内容的子组件，而不是所有子组件。

### vm.$nextTick( [callback] )

- **参数**：
  - `{Function} [callback]`

- **用法**：

  将回调延迟到下次 DOM 更新循环之后执行。在修改数据之后立即使用它，然后等待 DOM 更新。它跟全局方法 `Vue.nextTick` 一样，不同的是回调的 `this` 自动绑定到调用它的实例上。

  如果没有提供回调且在支持 Promise 的环境中，则返回一个 Promise。

- **示例**：

  ``` html
  <script>
    export default {
      // ...
      methods: {
        // ...
        example: function () {
          // 修改数据
          this.message = 'changed'
          // DOM 还没有更新
          this.$nextTick(function () {
            // DOM 现在更新了
            // `this` 绑定到当前实例
            this.doSomethingElse()
          })
        }
      }
    }
  </script>
  ```

- **参考**：[Vue.nextTick](https://cn.vuejs.org/v2/api/#Vue-nextTick)

### vm.$destroy()

- **不支持**：

## 指令

### v-text

- **预期**：`string`

- **详细**：

  更新元素的 `textContent`。如果要更新部分的 `textContent` ，需要使用 `{{ Mustache }}` 插值。

- **示例**：

  ```html
  <span v-text="msg"></span>
  <!-- 和下面的一样 -->
  <span>{{msg}}</span>
  ```

- **参考**：[数据绑定语法 - 插值](https://cn.vuejs.org/v2/guide/syntax.html#插值)

### v-html

- **预期**：`string`

- **详细**：

  更新元素的 `innerHTML` 。**注意：内容按普通 HTML 插入 - 不会作为 Vue 模板进行编译** 。如果试图使用 `v-html` 组合模板，可以重新考虑是否通过使用组件来替代。

  在网站上动态渲染任意 HTML 是非常危险的，因为容易导致 [XSS 攻击](https://en.wikipedia.org/wiki/Cross-site_scripting)。只在可信内容上使用 `v-html`，**永不**用在用户提交的内容上。

  在单文件组件里，`scoped` 的样式不会应用在 `v-html` 内部，因为那部分 HTML 没有被 Vue 的模板编译器处理。如果你希望针对 `v-html` 的内容设置带作用域的 CSS，你可以替换为 [CSS Modules](https://vue-loader.vuejs.org/en/features/css-modules.html) 或用一个额外的全局 `<style>` 元素手动设置类似 BEM 的作用域策略。

- **示例**：

  ```html
  <div v-html="html"></div>
  ```

- **参考**：[数据绑定语法 - 插值](https://cn.vuejs.org/v2/guide/syntax.html#纯-HTML)

### v-show

- **预期**：`any`

- **用法**：

  根据表达式之真假值，切换元素的 `display` CSS 属性。

  当条件变化时该指令触发过渡效果。

- **参考**：[条件渲染 - v-show](https://cn.vuejs.org/v2/guide/conditional.html#v-show)

### v-if

- **预期**：`any`

- **用法**：

  根据表达式的值的真假条件渲染元素。在切换时元素及它的数据绑定 / 组件被销毁并重建。如果元素是 `<template>` ，将提出它的内容作为条件块。

  当条件变化时该指令触发过渡效果。

  > 当和 `v-if` 一起使用时，`v-for` 的优先级比 `v-if` 更高。详见[列表渲染教程](https://cn.vuejs.org/v2/guide/list.html#v-for-with-v-if)

- **参考**：[条件渲染 - v-if](https://cn.vuejs.org/v2/guide/conditional.html)

### v-else

- **不需要表达式**

- **限制**：前一兄弟元素必须有 `v-if` 或 `v-else-if`。

- **用法**：

  为 `v-if` 或者 `v-else-if` 添加“else 块”。

  ```html
  <div v-if="Math.random() > 0.5">
    Now you see me
  </div>
  <div v-else>
    Now you don't
  </div>
  ```

- **参考**：[条件渲染 - v-else](https://cn.vuejs.org/v2/guide/conditional.html#v-else)

### v-else-if

- **类型**：`any`

- **限制**：前一兄弟元素必须有 `v-if` 或 `v-else-if`。

- **用法**：

  表示 `v-if` 的 "else if 块"。可以链式调用。

  ```html
  <div v-if="type === 'A'">
    A
  </div>
  <div v-else-if="type === 'B'">
    B
  </div>
  <div v-else-if="type === 'C'">
    C
  </div>
  <div v-else>
    Not A/B/C
  </div>
  ```

- **参考**：[条件渲染 - v-else-if](https://cn.vuejs.org/v2/guide/conditional.html#v-else-if)

### v-for

- **预期**：`Array | Object | number | string`

- **用法**：

  基于源数据多次渲染元素或模板块。此指令之值，必须使用特定语法 `alias in expression` ，为当前遍历的元素提供别名：

  ``` html
  <div v-for="item in items">
    {{ item.text }}
  </div>
  ```

  另外也可以为数组索引指定别名 (或者用于对象的键)：

  ``` html
  <div v-for="(item, index) in items"></div>
  <div v-for="(val, key) in object"></div>
  <div v-for="(val, key, index) in object"></div>
  ```

  `v-for` 默认行为试着不改变整体，而是替换元素。迫使其重新排序的元素，你需要提供一个 `key` 的特殊属性：

  ``` html
  <div v-for="item in items" :key="item.id">
    {{ item.text }}
  </div>
  ```

  `v-for` 的详细用法可以通过以下链接查看教程详细说明。

- **参考**：
  - [列表渲染](https://cn.vuejs.org/v2/guide/list.html)
  - [key](https://cn.vuejs.org/v2/guide/list.html#key)

### v-on

- **缩写**：`@`

- **预期**：`Function | Inline Statement | Object`

- **参数**：`event`

- **修饰符**：
  - `.stop` - 调用 `event.stopPropagation()`。
  - `.prevent` - 调用 `event.preventDefault()`。
  - `.capture` - 添加事件侦听器时使用 capture 模式。
  - `.self` - 只当事件是从侦听器绑定的元素本身触发时才触发回调。
  - `.{keyCode | keyAlias}` - 只当事件是从特定键触发时才触发回调。
  - `.native` - 监听组件根元素的原生事件。
  - `.once` - 只触发一次回调。
  - `.left` - 只当点击鼠标左键时触发。
  - `.right` - 只当点击鼠标右键时触发。
  - `.middle` - 只当点击鼠标中键时触发。
  - `.passive` - 以 `{ passive: true }` 模式添加侦听器

- **用法**：

  绑定事件监听器。事件类型由参数指定。表达式可以是一个方法的名字或一个内联语句，如果没有修饰符也可以省略。

  用在普通元素上时，只能监听[**原生 DOM 事件**](https://developer.mozilla.org/zh-CN/docs/Web/Events)。用在自定义元素组件上时，也可以监听子组件触发的**自定义事件**。

  在监听原生 DOM 事件时，方法以事件为唯一的参数。如果使用内联语句，语句可以访问一个 `$event` 属性：`v-on:click="handle('ok', $event)"`。

- **示例**：

  ```html
  <!-- 方法处理器 -->
  <button v-on:click="doThis"></button>

  <!-- 内联语句 -->
  <button v-on:click="doThat('hello', $event)"></button>

  <!-- 缩写 -->
  <button @click="doThis"></button>

  <!-- 停止冒泡 -->
  <button @click.stop="doThis"></button>

  <!-- 阻止默认行为 -->
  <button @click.prevent="doThis"></button>

  <!-- 阻止默认行为，没有表达式 -->
  <form @submit.prevent></form>

  <!--  串联修饰符 -->
  <button @click.stop.prevent="doThis"></button>

  <!-- 键修饰符，键别名 -->
  <input @keyup.enter="onEnter">

  <!-- 键修饰符，键代码 -->
  <input @keyup.13="onEnter">

  <!-- 点击回调只会触发一次 -->
  <button v-on:click.once="doThis"></button>

  <!-- 对象语法 (2.4.0+) -->
  <button v-on="{ mousedown: doThis, mouseup: doThat }"></button>
  ```

  在子组件上监听自定义事件 (当子组件触发“my-event”时将调用事件处理器)：

  ```html
  <my-component @my-event="handleThis"></my-component>

  <!-- 内联语句 -->
  <my-component @my-event="handleThis(123, $event)"></my-component>

  <!-- 组件中的原生事件 -->
  <my-component @click.native="onClick"></my-component>
  ```

- **参考**：
  - [事件处理器](https://cn.vuejs.org/v2/guide/events.html)
  - [组件 - 自定义事件](https://cn.vuejs.org/v2/guide/components.html#自定义事件)

### v-bind

- **缩写**：`:`

- **预期**：`any (with argument) | Object (without argument)`

- **参数**：`attrOrProp (optional)`

- **修饰符**：
  - `.prop` - 被用于绑定 DOM 属性 (property)。([差别在哪里？](https://stackoverflow.com/questions/6003819/properties-and-attributes-in-html#answer-6004028))
  - `.camel` - (2.1.0+) 将 kebab-case 特性名转换为 camelCase. (从 2.1.0 开始支持)
  - `.sync` (2.3.0+) 语法糖，会扩展成一个更新父组件绑定值的 `v-on` 侦听器。

- **用法**：

  动态地绑定一个或多个特性，或一个组件 prop 到表达式。

  在绑定 `class` 或 `style` 特性时，支持其它类型的值，如数组或对象。可以通过下面的教程链接查看详情。

  在绑定 prop 时，prop 必须在子组件中声明。可以用修饰符指定不同的绑定类型。

  没有参数时，可以绑定到一个包含键值对的对象。注意此时 `class` 和 `style` 绑定不支持数组和对象。

- **示例**：

  ```html
  <!-- 绑定一个属性 -->
  <img v-bind:src="imageSrc">

  <!-- 缩写 -->
  <img :src="imageSrc">

  <!-- 内联字符串拼接 -->
  <img :src="'/path/to/images/' + fileName">

  <!-- class 绑定 -->
  <div :class="{ red: isRed }"></div>
  <div :class="[classA, classB]"></div>
  <div :class="[classA, { classB: isB, classC: isC }]">

  <!-- style 绑定 -->
  <div :style="{ fontSize: size + 'px' }"></div>
  <div :style="[styleObjectA, styleObjectB]"></div>

  <!-- 绑定一个有属性的对象 -->
  <div v-bind="{ id: someProp, 'other-attr': otherProp }"></div>

  <!-- 通过 prop 修饰符绑定 DOM 属性 -->
  <div v-bind:text-content.prop="text"></div>

  <!-- prop 绑定。“prop”必须在 my-component 中声明。-->
  <my-component :prop="someThing"></my-component>

  <!-- 通过 $props 将父组件的 props 一起传给子组件 -->
  <child-component v-bind="$props"></child-component>

  <!-- XLink -->
  <svg><a :xlink:special="foo"></a></svg>
  ```

  `.camel` 修饰符允许在使用 DOM 模板时将 `v-bind` 属性名称驼峰化，例如 SVG 的 `viewBox` 属性：

  ``` html
  <svg :view-box.camel="viewBox"></svg>
  ```

  在使用字符串模板或通过 `vue-loader`/`vueify` 编译时，无需使用 `.camel`。

- **参考**：
  - [Class 与 Style 绑定](https://cn.vuejs.org/v2/guide/class-and-style.html)
  - [组件 - Props](https://cn.vuejs.org/v2/guide/components.html#Props)
  - [组件 - `.sync` 修饰符](https://cn.vuejs.org/v2/guide/components.html#sync-修饰符)

### v-model

- **预期**：随表单控件类型不同而不同。

- **限制**：
  - `<input>`
  - `<select>`
  - `<textarea>`
  - components

- **修饰符**：
  - [`.lazy`](https://cn.vuejs.org/v2/guide/forms.html#lazy) - 取代 `input` 监听 `change` 事件
  - [`.number`](https://cn.vuejs.org/v2/guide/forms.html#number) - 输入字符串转为数字
  - [`.trim`](https://cn.vuejs.org/v2/guide/forms.html#trim) - 输入首尾空格过滤

- **用法**：

  在表单控件或者组件上创建双向绑定。细节请看下面的教程链接。

- **参考**：
  - [表单控件绑定](https://cn.vuejs.org/v2/guide/forms.html)
  - [组件 - 在输入组件上使用自定义事件](https://cn.vuejs.org/v2/guide/components.html#使用自定义事件的表单输入组件)

### v-pre

- **不需要表达式**

- **用法**：

  跳过这个元素和它的子元素的编译过程。可以用来显示原始 Mustache 标签。跳过大量没有指令的节点会加快编译。

- **示例**：

  ```html
  <span v-pre>{{ this will not be compiled }}</span>
   ```

### v-cloak

- **不需要表达式**

- **用法**：

  这个指令保持在元素上直到关联实例结束编译。和 CSS 规则如 `[v-cloak] { display: none }` 一起用时，这个指令可以隐藏未编译的 Mustache 标签直到实例准备完毕。

- **示例**：

  ```css
  [v-cloak] {
    display: none;
  }
  ```

  ```html
  <div v-cloak>
    {{ message }}
  </div>
  ```

  <div> 不会显示，直到编译结束。

### v-once

- **不需要表达式**

- **详细**：

  只渲染元素和组件**一次**。随后的重新渲染，元素/组件及其所有的子节点将被视为静态内容并跳过。这可以用于优化更新性能。

  ```html
  <!-- 单个元素 -->
  <span v-once>This will never change: {{msg}}</span>
  <!-- 有子元素 -->
  <div v-once>
    <h1>comment</h1>
    <p>{{msg}}</p>
  </div>
  <!-- 组件 -->
  <my-component v-once :comment="msg"></my-component>
  <!-- `v-for` 指令-->
  <ul>
    <li v-for="i in list" v-once>{{i}}</li>
  </ul>
  ```

- **参考**：
  - [数据绑定语法- 插值](https://cn.vuejs.org/v2/guide/syntax.html#插值)
  - [组件 - 对低开销的静态组件使用 `v-once`](https://cn.vuejs.org/v2/guide/components.html#对低开销的静态组件使用-v-once)

## 特殊特性

### key

- **预期**：`number | string`

  `key` 的特殊属性主要用在 Vue 的虚拟 DOM 算法，在新旧 nodes 对比时辨识 VNodes。如果不使用 key，Vue 会使用一种最大限度减少动态元素并且尽可能的尝试修复/再利用相同类型元素的算法。使用 key，它会基于 key 的变化重新排列元素顺序，并且会移除 key 不存在的元素。

  有相同父元素的子元素必须有**独特的 key**。重复的 key 会造成渲染错误。

  最常见的用例是结合 `v-for`：

  ``` html
  <ul>
    <li v-for="item in items" :key="item.id">...</li>
  </ul>
  ```

  它也可以用于强制替换元素/组件而不是重复使用它。当你遇到如下场景时它可能会很有用：

  - 完整地触发组件的生命周期钩子
  - 触发过渡

  例如：

  ``` html
  <transition>
    <span :key="text">{{ text }}</span>
  </transition>
  ```

  当 `text` 发生改变时，`<span>` 会随时被更新，因此会触发过渡。

### ref

- **预期**：`string`

  `ref` 被用来给元素或子组件注册引用信息。引用信息将会注册在父组件的 `$refs` 对象上。如果在普通的 DOM 元素上使用，引用指向的就是 DOM 元素；如果用在子组件上，引用就指向组件实例：

  ``` html
  <!-- `vm.$refs.p` will be the DOM node -->
  <p ref="p">hello</p>

  <!-- `vm.$refs.child` will be the child component instance -->
  <child-component ref="child"></child-component>
  ```

  当 `v-for` 用于元素或组件的时候，引用信息将是包含 DOM 节点或组件实例的数组。

  关于 ref 注册时间的重要说明：因为 ref 本身是作为渲染结果被创建的，在初始渲染的时候你不能访问它们 - 它们还不存在！`$refs` 也不是响应式的，因此你不应该试图用它在模板中做数据绑定。

- **参考**：[子组件 Refs](https://cn.vuejs.org/v2/guide/components.html#子组件索引)

### slot

- **预期**：`string`

  用于标记往哪个具名插槽中插入子组件内容。

### slot-scope

- **不支持**

- **预期**：`function argument expression`

- **用法**：

  用于将元素或组件表示为作用域插槽。特性的值应该是可以出现在函数签名的参数位置的合法的 JavaScript 表达式。这意味着在支持的环境中，你还可以在表达式中使用 ES2015 解构。它在 2.5.0+ 中替代了 [`scope`](#scope-replaced)。

  此属性不支持动态绑定。

- **参考**：[Scoped Slots](https://cn.vuejs.org/v2/guide/components.html#作用域插槽)

### is

- **预期**：`string | Object (组件的选项对象)`

  用于[动态组件](https://cn.vuejs.org/v2/guide/components.html#动态组件)且基于 [DOM 内模板的限制](https://cn.vuejs.org/v2/guide/components.html#DOM-模板解析说明)来工作。

  示例：

  ``` html
  <!-- 当 `currentView` 改变时，组件也跟着改变 -->
  <component v-bind:is="currentView"></component>

  <!-- 这样做是有必要的，因为 `<my-row>` 放在一个 -->
  <!-- `<table>` 内可能无效且被放置到外面 -->
  <table>
    <tr is="my-row"></tr>
  </table>
  ```

  更多的使用细节，请移步至下面的链接。

- **See also**：
  - [动态组件](https://cn.vuejs.org/v2/guide/components.html#动态组件)
  - [DOM 模板解析说明](https://cn.vuejs.org/v2/guide/components.html#DOM-模板解析说明)

## 内置的组件

### component

- **Props**：
  - `is` - string | ComponentDefinition | ComponentConstructor
  - `inline-template` - boolean

- **用法**：

  可在 Vue 组件内部使用。

  渲染一个“元组件”为动态组件。依 `is` 的值，来决定哪个组件被渲染。

  ```html
  <!-- 动态组件由 vm 实例的属性值 `componentId` 控制 -->
  <component :is="componentId"></component>

  <!-- 也能够渲染注册过的组件或 prop 传入的组件 -->
  <component :is="$options.components.child"></component>
  ```

- **参考**：[动态组件](https://cn.vuejs.org/v2/guide/components.html#动态组件)

### transition

- **Props**：
  - `name` - string，用于自动生成 CSS 过渡类名。例如：`name: 'fade'` 将自动拓展为`.fade-enter`，`.fade-enter-active`等。默认类名为 `"v"`
  - `appear` - boolean，是否在初始渲染时使用过渡。默认为 `false`。
  - `css` - boolean，是否使用 CSS 过渡类。默认为 `true`。如果设置为 `false`，将只通过组件事件触发注册的 JavaScript 钩子。
  - `type` - string，指定过渡事件类型，侦听过渡何时结束。有效值为 `"transition"` 和 `"animation"`。默认 Vue.js 将自动检测出持续时间长的为过渡事件类型。
  - `mode` - string，控制离开/进入的过渡时间序列。有效的模式有 `"out-in"` 和 `"in-out"`；默认同时生效。
  - `enter-class` - string
  - `leave-class` - string
  - `appear-class` - string
  - `enter-to-class` - string
  - `leave-to-class` - string
  - `appear-to-class` - string
  - `enter-active-class` - string
  - `leave-active-class` - string
  - `appear-active-class` - string

- **事件**：
  - `before-enter`
  - `before-leave`
  - `before-appear`
  - `enter`
  - `leave`
  - `appear`
  - `after-enter`
  - `after-leave`
  - `after-appear`
  - `enter-cancelled`
  - `leave-cancelled` (`v-show` only)
  - `appear-cancelled`

- **用法**：

  `<transition>` 元素作为单个元素/组件的过渡效果。`<transition>` 只会把过渡效果应用到其包裹的内容上，而不会额外渲染 DOM 元素，也不会出现在检测过的组件层级中。

- **参考**：[过渡：进入，离开和列表](https://cn.vuejs.org/v2/guide/transitions.html)

### transition-group

- **Props**：
  - `tag` - string，默认为 `span`
  - `move-class` - 覆盖移动过渡期间应用的 CSS 类。
  - 除了 `mode`，其他特性和 `<transition>` 相同。

- **事件**：
  - 事件和 `<transition>` 相同。

- **用法**：

  `<transition-group>` 元素作为多个元素/组件的过渡效果。`<transition-group>` 渲染一个真实的 DOM 元素。默认渲染 `<span>`，可以通过 `tag` 属性配置哪个元素应该被渲染。

  注意，每个 `<transition-group>` 的子节点必须有 **独立的 key** ，动画才能正常工作

  `<transition-group>` 支持通过 CSS transform 过渡移动。当一个子节点被更新，从屏幕上的位置发生变化，它将会获取应用 CSS 移动类 (通过 `name` 属性或配置 `move-class` 属性自动生成)。如果 CSS `transform` 属性是“可过渡”属性，当应用移动类时，将会使用 [FLIP 技术](https://aerotwist.com/blog/flip-your-animations/) 使元素流畅地到达动画终点。

  ```html
  <transition-group tag="ul" name="slide">
    <li v-for="item in items" :key="item.id">
      {{ item.text }}
    </li>
  </transition-group>
  ```

- **参考**：[过渡：进入，离开和列表](https://cn.vuejs.org/v2/guide/transitions.html)

### keep-alive

- **Props**：
  - `include` - 字符串或正则表达式。只有匹配的组件会被缓存。
  - `exclude` - 字符串或正则表达式。任何匹配的组件都不会被缓存。

- **用法**：

  `<keep-alive>` 包裹动态组件时，会缓存不活动的组件实例，而不是销毁它们。和 `<transition>` 相似，`<keep-alive>` 是一个抽象组件：它自身不会渲染一个 DOM 元素，也不会出现在父组件链中。

  当组件在 `<keep-alive>` 内被切换，它的 `activated` 和 `deactivated` 这两个生命周期钩子函数将会被对应执行。

  主要用于保留组件状态或避免重新渲染。

  ```html
  <!-- 基本 -->
  <keep-alive>
    <component :is="view"></component>
  </keep-alive>

  <!-- 多个条件判断的子组件 -->
  <keep-alive>
    <comp-a v-if="a > 1"></comp-a>
    <comp-b v-else></comp-b>
  </keep-alive>

  <!-- 和 `<transition>` 一起使用 -->
  <transition>
    <keep-alive>
      <component :is="view"></component>
    </keep-alive>
  </transition>
  ```

  注意，`<keep-alive>` 是用在其一个直属的子组件被开关的情形。如果你在其中有 `v-for` 则不会工作。如果有上述的多个条件性的子元素，`<keep-alive>` 要求同时只有一个子元素被渲染。

- **`include` and `exclude`**

  `include` 和 `exclude` 属性允许组件有条件地缓存。二者都可以用逗号分隔字符串、正则表达式或一个数组来表示：

  ``` html
  <!-- 逗号分隔字符串 -->
  <keep-alive include="a,b">
    <component :is="view"></component>
  </keep-alive>

  <!-- 正则表达式 (使用 `v-bind`) -->
  <keep-alive :include="/a|b/">
    <component :is="view"></component>
  </keep-alive>

  <!-- 数组 (使用 `v-bind`) -->
  <keep-alive :include="['a', 'b']">
    <component :is="view"></component>
  </keep-alive>
  ```

  匹配首先检查组件自身的 `name` 选项，如果 `name` 选项不可用，则匹配它的局部注册名称 (父组件 `components` 选项的键值)。匿名组件不能被匹配。

  > `<keep-alive>` 不会在函数式组件中正常工作，因为它们没有缓存实例。

- **参考**：[动态组件 - keep-alive](https://cn.vuejs.org/v2/guide/components.html#keep-alive)

### slot

- **Props**：
  - `name` - string，用于命名插槽。

- **Usage**：

  `<slot>` 元素作为组件模板之中的内容分发插槽。`<slot>` 元素自身将被替换。

  详细用法，请参考下面教程的链接。

- **参考**：[使用插槽分发内容](https://cn.vuejs.org/v2/guide/components.html#使用插槽分发内容)