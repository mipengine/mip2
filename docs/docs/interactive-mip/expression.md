# MIP 表达式

在数据驱动机制当中提到了 `MIP.setData()`、`m-bind` 与 `m-text` 数据绑定都支持写一些表达式来完成一定程度的数据计算。比如：

```html
<div on="tap:MIP.setData({
    a: isActive ? (1 + 3) : 2,
    b: b + 1，
    c: [2, 1, 3].slice(1)
  })"
></div>
```

例子中的 `isActive ? (1 + 3) : 2`、`b + 1`、`[2, 1, 3].slice(1)` 都属于表达式。

这类表达式具有以下特点：

1. 能读取并操作在 `<mip-data>` 中声明的变量；
2. 支持有限的运算符；
3. 支持有限的方法；

## 数据

可用于运算的数据包括以下几种：

1. 定义在 `<mip-data>` 或者通过 `MIP.setData()` 所添加的数据，可直接根据对应数据的命名空间、属性名称，使用属性运算符（点运算符或计算属性）获取相应的数据。如 `a`、`userInfo.name` 等等；
2. 字面量数据，包括字符串、数字、null、undefined、字面量数组、字面量对象等等；
3. 事件触发时所携带的数据，通过 `event.xxx` 进行获取，如 `input` 的 `change` 事件，可通过 `event.value` 获取当前输入框的内容；

## 运算符

MIP 支持有限的运算符，利用这些运算符的相互组合，基本能够完成绝大多数的数据计算要求。

### 三元运算符

|类型|说明| 示例 |
|---|----|---|
|`expr ? expr : expr`| 条件运算符 | `a > b ? 'large' : 'small'` |

### 二元运算符

普通运算

|类型|说明|示例|
|---|----|---|
|`expr + expr`| 加法 | `1 + 1` <br> `'Hello ' + 'World'` |
|`expr - expr`| 减法 | `2 -1` |
|`expr * expr`| 乘法 | `1 * 2` |
|`expr / expr`| 除法 | ` 3 / 4` |
|`expr % expr`| 取模 | `4 % 2` |

逻辑运算

|类型|说明|示例|
|---|----|---|
|`expr && expr`| 与 | `isActive && 'active'` |
| expr <code>&#124;&#124;</code> expr| 或 | isActive <code>&#124;&#124;</code> 'inactive' |
|`expr > expr`| 大于 | `4 > 3` |
|`expr >= expr`| 大于或等于 | `8 >= 8` |
|`expr < expr`| 小于 | `a < b` |
|`expr <= expr`| 小于或等于 | `6 <= a` |
|`expr == expr`| 相等 | `null == undefined` |
|`expr === expr`| 全等 | `0 === 0` |
|`expr != expr`| 不等 | `a != null` |
|`expr !== expr`| 不全等 | `a !== '1'` |

### 一元运算符

|类型|说明|示例|
|---|----|---|
|`!expr`| 非 | `!a` |
|`+expr`| 转为数字 | `+'1'` |
|`-expr`| 负数 | `-1` |

### 其他

|类型|说明|示例|
|---|----|---|
|`( expr )`| 分组运算符（小括号） | `1 + (2 - 3)` |
| `{ attr: vaue }` | 字面量对象 | `{a: 1, b: 2, c: 3 + 4}` |
| `[ item, item ]` | 字面量数组 | `[2, 1, 3]` |
|`expr . attr`| 属性运算符（点运算符） | `userInfo.name` |
|`expr[ expr ]`| 计算属性 | `userInfo['name']` |
|`expr( params )`| 执行函数，**只支持白名单方法调用** | `encodeURIComponent('a=1&b=2')` <br> `[2, 1, 3].sort()` |

[notice] 变量定义（`var a = 0`）、赋值（`a = 10086`）、new、if、for 等等这些都是不支持的。

## 白名单方法

白名单方法包括两类：全局方法和原型链方法。

### 全局方法

MIP 在数据驱动表达式当中支持的全局方法包括两类，一类是原生 window 下面的一些安全方法，比如 `encoodeURICompoent`、`pareInt` 等等，一类是为了简化写法而将一部分方法进行改写，比如 `Math.max(1, 2)` 在 MIP 表达式中可直接使用 `max(1, 2)`。下面的表格列举了目前支持的全局方法说明：

|函数名|原挂载对象|示例|
|---|---|---|
| encudeURI <br>encodeURIComponent <br>decodeURI <br>decodeURIComponent <br>isNaN <br>isFinite <br>parseFloat <br>parseInt | window | `// 返回 1.024` <br> `parseFloat('1.04')` |
| keys <br> values<br> assign | Object | `// 返回 ['a', 'b', 'c'] <br> `keys({a: 1, b: 2, c: 3})` |
| abs <br>ceil <br>floor <br>sqrt <br>log <br>max <br>min <br>random <br>round <br>sign | Math | `// 返回 2` <br> `abs(-2)` |


### 原型链方法

MIP 还支持使用部分原型链方法，比如下面举例的一些常见的字符串和数组操作：

```js
// 结果是 '2,4'
'213'.split(',')
  .map(num => num + 1)
  .slice(1)
  .join(',')
```

这里的 `split`、`map`、`slice`、`join` 就分别是 String 和 Array 的原型链方法，MIP 会首先检测待操作的数据或对象是否存在该原型链方法，只有当存在了才会执行。下面的列表中列举了目前支持的原型链方法。

|对象类型|方法|示例|
|----|----|----|
|Array|concat <br>filter <br>indexOf <br>join <br>lastIndexOf <br>map <br>reduce <br>slice <br>some <br>every <br>find <br>sort（修改） <br>splice（修改）| 为了提升 MIP 表达式中的数组操作体验，我们修改了 sort 和 splice 方法，这两个方法将不会对原数组造成影响。<br>其中 sort 将返回排序后的新数组；<br>同时 splice 返回进行插入或删除操作之后的新数组。 <br> `// 返回新的对象 [1, 2, 3]` <br> `[2, 1, 3].sort()`<br> `// 返回新的对象 [1, 3]` <br> `[1, 2, 3].splice(1, 1)` <br> `// false` <br> `[1, 2, 3].some(num => num > 4)` <br> |
|Number|toExponential<br>toFixed<br>toPrecision<br>toString| `// 返回 1.2` <br> `(1,23).toFixed(1)`|
|String|charAt <br>charCodeAt <br>concat <br>indexOf <br>lastIndexOf <br>slice <br>split <br>substr <br>substring <br>toLowerCase <br>toUpperCase | `// 返回 ['1', '2', '3']` <br> `'123'.split()` |

## 函数表达式

在上面介绍的原型链方法当中，不少方法都要求传入函数作为参数。在这里 MIP 表达式允许写**单行**的**箭头函数**。

这些箭头函数应该满足以下规则：

- 仅允许写单行箭头函数，不支持 `function`，不支持 `return`：

```js
// 正确
[1, 2, 3].map(item => item + 1)

// 错误，不支持 return
[1, 2, 3].map(item => { return item + 1 })
// 错误，不支持 function 也不支持 return
[1, 2, 3].map(function (item) { return item + 1 })
```

- 当函数参数仅有一个时，禁止写圆括号：

```js
// 正确，单参数应去除圆括号
[1, 2, 3].map(item => item + 1)
// 正确，多参数请添加圆括号
[1, 2, 3].reduce((result, item) => result + item, 0)

// 错误，单参数应去除圆括号
[1, 2, 3].map((item) => item + 1)
```

- 不允许直接将全局方法作为参数直接传入：

```js
// 正确，声明匿名箭头函数作为参数传入
['1.2', '3.4', '5.6'].map(item => parseFloat(item))

// 错误，直接将全局方法作为参数传入，表达式解析会报错
['1,2', '3.4', '5.6'].map(parseFloat)
```

- 箭头函数主体应同样满足 MIP 表达式的规范和要求

```js
// 正确，箭头函数主体满足 MIP 表达式的规范要求
[1, 2, 3].map(item => item + 1)

// 错误，MIP 表达式不支持 ++ 运算符
[1, 2, 3].map(item => item++)
```
















