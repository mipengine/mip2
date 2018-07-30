# MIP.util.hash

## 描述

MIP 提供了`MIP.util.hash`对象，可以用来让 iframe 页面从上层页面获取参数，从而实现消息单向传递，同样也提供了一些与锚点相关的方法

## 方法

### get

- 描述：

  以当前页面 URL 为 key，去获取 hash 的 value

- 参数：
  - {string} url 上层页面的 URL 地址
- 返回值：

    {string}

    对应 URL 存储的消息内容

- 用法：

  ```javascript
  MIP.util.hash.get(url)
  ```

### bindAnchor

- 描述：

  如果 hash 中有锚点，则进行跳转

- 参数：

  无

- 返回值：

  `undefined`

- 用法：

  ```javascript
  MIP.util.hash.bindAnchor()
  ```

### scrollToAnchor

- 描述：

  跳转页面到锚点对应的位置

- 参数：

  - {Object} 一个锚点对象

- 返回值：

  `undefined`

- 用法：

  ```javascript
  MIP.util.hash.scrollToAnchor(anchor)
  ```

### refreshHashTree

- 描述：

  重新解析 hash 得到 MIP.util.hash 中的内容

- 参数：

  无

- 返回值：

  `undefined`

- 用法：

  ```javascript
  MIP.util.hash.refreshHashTree()
  ```
