# platform 识别

在平时的开发中，识别平台类型、浏览器类型、浏览器内核、系统版本一直是一个令人头疼的问题，可能不同机型、不同平台获取的结果都不一样，而这样的需求在我们开发的过程中却是处处可见。所以针对使用量和开发难度上的问题，MIP 开发了platform 功能，使得开发者能够拥有一整套完整、实用的功能，包括前面所提及的平台类型、浏览器类型、浏览器内核、系统版本等。

## 功能一览

1. 平台类型识别

目前只会识别Android和iOS两种平台，识别方式如下面代码所示。

```js
// 识别是否是iOS 系统
platform.isIos();
// 识别是否是android 系统
platform.isAndroid();
```

2. 浏览器类型识别

在识别浏览器类型的过程中，又要分为两个方面，一是通用浏览器的识别，二是 webview 的识别，MIP 提供的 platform 模块主要包含了下面所示的功能点。

```js
// Uc 浏览器
platform.isUc();
// Chrome 浏览器
platform.isChrome();
// Android 浏览器
platform.isAdr();
// Safari 浏览器
platform.isSafari();
// QQ 浏览器
platform.isQQ();
// Firefox 浏览器
platform.isFireFox();
// Baidu 浏览器
platform.isBaidu();
// 手机百度 webview
platform.isBaiduApp();
// 微信 webview
platform.isWechatApp();
// 微博 webview
platform.isWeiboApp();
// QQ webview
platform.isQQApp();
```

3. 浏览器内核识别

由于目前移动端主要流量来自 Webkit、Trident、Gecko 等内核，代表性的浏览器有 Chrome、Internet Explorer、Mozilla Firefox 等，所以MIP也针对这样一些内核进行了识别，使用方式如下面代码所示。

```js
// Trident内核
platform.isTrident();
// Gecko内核
platform.isGecko();
// Webkit内核
platform.isWebkit();
```

4. 系统版本

platform 提供了版本获取的功能，具体可以按照下面代码所示的这种方式进行使用。

```js
platform.getOsVersion();
```

## 识别原理

UA + appVersion 是 platform 的识别设计的核心。它和其他业界通用方式一致，都是提取浏览器或者系统的关键字部分，并通过正则进行识别，如果识别成功则返回 `true`，否则返回 `false`。

另外，为了保证一个环境中不会有多种场景识别成功的现象（如 Gecko 内核下，不会出现既是 Gecko，也是 Trident 的情况）。platform 逻辑中如果成功识别一个场景就直接终止面向代码的执行，有效避免了这种情况的发生。

同时，有一部分功能的识别，只靠 UA 是很难完成的，如版本号的提取，在 iOS 下就需要借助 appVersion 来配合使用。
