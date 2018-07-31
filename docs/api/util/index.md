# MIP.util

```javascript
MIP.util
window.MIP.util
```

## 描述

`MIP.util` 对象是工具库的入口文件，除了暴露了 `fn` `dom` 等其他的工具库外，本身还提供了 `parseCacheUrl`, `makeCacheUrl` 和 `getOriginalUrl` 函数

## 属性

### fn

- type: `Object`

  一些函数式的工具函数，参考[工具](./fn.md)

### dom

- type: `Object`

  DOM 相关的工具函数，参考[DOM](./dom.md)

### event

- type: `Object`

  事件代理工具函数，参考[event](./event.md)

### rect

- type: `Object`

  DOM 位置相关的工具函数，参考[rect](./rect.md)

### hash

- type: `Object`

  hash 相关的工具，参考[hash](./hash.md)

### platform

- type: `Object`

  当前所处平台相关的工具，如浏览器和系统，参考[platform](./platform.md)

### EventEmitter

- type: `EventEmitter`

  EventEmitter 类，提供了 mixin 函数，参考[EventEmitter](./event-emitter.md)

### Gesture

- type: `Gesture`

  手势相关的工具，参考[Gesture](./gesture.md)

### customStorage

- type: `Object`

  存储相关的工具，参考[customStorage](./customStorage.md)

### naboo

- type: `Object`

  动画库 Naboo，参考[naboo](./naboo.md)


## 方法

### css
- 参数：
  - {Array.\<HTMLElement\>|NodeList|HTMLElement} elements 需要设置的元素或者数组
  - {Object.<string, string|number>|string} property 属性名，如果是 Object，则为属性和值的键值对 `css(element, {left: 0, top: 0})`
  - {string|number=} value 属性值
- 返回值：

    {Array.\<HTMLElement\>|HTMLElement|string}

    - 如果 elements 为数组，返回值为数组
    - 如果 elements 单个 HTMLElement，并且有属性值，返回值为 HTMLElement
    - 如果没有需要的属性值，返回值为该 HTMLElement 对应属性的值
- 用法：

  设置或者获取元素对应属性的值

  ```javascript
  let element = document.querySelector('#id')
  let elements = document.querySelectorAll('a')
  // 获取 #id 的 color 值
  MIP.util.css(element, 'color')
  // 设置 #id 的颜色为 #ccc
  MIP.util.css(element, 'color', '#ccc')
  // 设置 a 链接的颜色为 #ccc
  MIP.util.css(elements, 'color', '#ccc')
  // 设置 a 链接的颜色和字体大小
  MIP.util.css(elements, {color: '#ccc', 'font-size': '14px'})
  ```

### jsonParse

- 参数：
  - {string} jsonStr 需要转成 JSON 的字符串
- 用法：

  可以将不符合标准 JSON 标准的字符串转为 JSON，当然需要是正确的 JSON 字符串

  ```javascript
  // 返回值为 {a: 1, b: 2, c: 3}
  MIP.util.jsonParse('{a: 1, \'b\': 2, "c": 3}')
  ```

### parseCacheUrl
- 参数：
  - {string} url 源 URL
- 返回值：

  {string} 处理后的 URL
- 用法：

  把 Cache URL 处理为源 URL

  ```javascript
  // 返回 https://www.mipengine.org/static/index.html
  MIP.util.parseCacheUrl('https://mipcache.bdstatic.com/c/www.mipengine.org/static/index.html')
  ```

### makeCacheUrl
- 参数：
  - {string} url 源 URL
  - {string} type URL 的类型，目前只有两种情况，img 或者为空
  - {boolean} containsHost 是否需要包含 host
- 返回值：

  {string} 返回的 Cache URL

- 用法：

  将一个 URL 处理为 Cache URL

  ```javascript
  // 返回值为 /c/s/www.mipengine.com
  MIP.util.makeCacheUrl('https://www.mipengine.com')
  ```

  参考相关[测试用例](https://github.com/mipengine/mip2/blob/master/packages/mip/test/specs/util.spec.js#L112)

### isCacheUrl

- 参数：
  - {string} url
- 返回值：

  {boolean} 是否为 MIP Cache URL

- 用法：

  判断链接是否为 MIP Cache URL

  ```javascript
  // 返回 true
  MIP.util.isCacheUrl('http://www-mipengine-com.mipcdn.com/c/www.mipengine.com/docs/index.html')
  ```
