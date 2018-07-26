# MIP.util.hash

## 描述

MIP 提供了`MIP.util.hash`方法用来让 iframe 页面从上层页面获取参数，从而实现消息单向传递。

## 方法

**get**

- 参数：
  - {string} url 上层页面的 URL 地址
- 返回值：

    {string}

    对应 URL 存储的消息内容

- 用法
  
  以当前页面 URL 为 key，去获取 hash 的 value

  ```javascript
  MIP.util.hash.get(url)
  ```
