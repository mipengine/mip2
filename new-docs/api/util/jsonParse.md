# MIP.util.jsonParse

## 描述

MIP 提供了 `MIP.util.jsonParse` 方法用来将 JSON 字符串转成 JSON 对象，功能上类似 ES5 的 `JSON.parse` 方法，由于 `JSON.parse` 方法只能转化标准的 JSON 字符，将会给开发者带来许多的不便利，`MIP.util.jsonParse` 可以解析符合 [JSON5(JSON for humans :p)](https://json5.org/) 规则的字符串，并解析为标准的 JS 对象或数组，让开发者更加便捷。

- 用法

```js
MIP.util.jsonParse(json5String)
```

- 参数

类型|参数名|是否必选|描述
---|---|---|---
string|json5String|是|符合 JSON5 规则的字符串

- 返回值

类型|描述
---|---
any*|MIP.util.jsonParse 会返回想要转换的任何数据类型，详见示例。

- 示例

```js
MIP.util.jsonParse('{"key":"value"}')
// => {key: "value"}

MIP.util.jsonParse('{key: "value"}')
// => {key: "value"}

MIP.util.jsonParse('{a: {_$_a: 3}}')
// => {a: {_$_a: 3}}

MIP.util.jsonParse('["a", 1, 3, \'b\']')
// => ["a", 1, 3, "b"]

MIP.util.jsonParse('[\'"\',"\'"]')
// => [""", "'"]

MIP.util.jsonParse('[-1,+2,-.1,-0]')
// => [-1, 2, -0.1, -0])

MIP.util.jsonParse('[1e0,1e1,1e01,1.e0,1.1e0,1e-1,1e+1]')
// => [1, 10, 10, 1, 1.1, 0.1, 10]

MIP.util.jsonParse('abc')
// => abc

MIP.util.jsonParse('true')
// => true

MIP.util.jsonParse('0')
// => 0

MIP.util.jsonParse('[Infinity, -Infinity]')
// => [Infinity, -Infinity]

MIP.util.jsonParse('{a: /* comments */ "123"}')
// => {a: "123"}

MIP.util.jsonParse('{// comment \na: "123"}')
// => {a: "123"}
```
