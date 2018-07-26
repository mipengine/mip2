# MIP.util.platform

```javascript
MIP.util.platform
window.MIP.util.platform
```

## 描述

`MIP.util.platform` 提供了众多的属性，判断当前所在平台，iOS/Android，哪个浏览器，还可以获取系统版本

## 属性

**isIos**: `boolean`

判断是否为 iOS 系统

**isAndroid**: `boolean`

判断是否为 Android 系统

**isWechatApp**: `boolean`

判断是否在微信中

**isBaiduApp**: `boolean`

判断是否在百度 App 中

**isWeiboApp**: `boolean`

判断是否在微博 App 中

**isQQApp**: `boolean`

判断是否在 QQ App 中

**isUc**: `boolean`

判断是否在 UC 浏览器中

**isBaidu**: `boolean`

判断是否在百度浏览器中

**isQQ**: `boolean`

判断是否在 QQ 浏览器中

**isAdr**: `boolean`

判断是否在 Android 原生浏览器中

**isSafari**: `boolean`

判断是否在 Safari 浏览器中

**isChrome**: `boolean`

判断是否在 Chrome 浏览器中

**isFireFox**: `boolean` _[deprecated]_

判断是否在 Firefox 浏览器中，请用 `isFirefox` 替代

**isFirefox**: `boolean`

判断是否在 Firefox 浏览器中

**isTrident**: `boolean`

是否为 trident 内核，目前只有 IE 浏览器使用 trident 内核

**isGecko**: `boolean`

是否为 Gecko 内核，目前使用 Gecko 内核主流还是 Firefox

**isWebkit**: `boolean`

是否为 webkit 内核

## 方法

**start**

- 用法：

  调用 `start` 之后，才会运行匹配系统、浏览器的逻辑

  ```javascript
  MIP.util.platform.start()
  MIP.util.platform.isIos
  ```

**getOsVersion**

- 返回值：

  {string} 当前系统的版本

- 用法：

  获取当前系统的版本，需要在运行 `MIP.util.platform.start` 之后才能使用

  ```javascript
  MIP.util.platform.start()
  // 例如 11.0.0
  MIP.util.platform.getOsVersion()
  ```
