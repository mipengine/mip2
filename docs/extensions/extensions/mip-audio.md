# mip-audio 音频播放

音频播放组件，支持 `src` 播放，`source` 播放，进度拖动功能。

标题|内容
----|----
类型|通用
支持布局| N/S
所需脚本|https://c.mipcdn.com/static/v1/mip-audio/mip-audio.js

## 示例

### 基本示例
`<mip-audio>` 使用方法同 `<audio>` 标签。

[info]由于 MIP-Cache 是 HTTPS 环境，src 要求为 HTTPS 资源。

``` html
<mip-audio 
    src="https://mip-doc.bj.bcebos.com/guitar.mp3"
    layout="fixed-height"
    height="50">
</mip-audio>
```

<!--
升级校验中, 预计2018年开放使用。  
### 使用source定义多音频源

``` html
<mip-audio
    controls
    height="50">
    <source src="https://mip-doc.bj.bcebos.com/horse.mp3">
    <source src="https://mip-doc.bj.bcebos.com/horse.ogg">
    您的浏览器不支持音频播放。
</mip-audio>
```
-->


### 自定义控件皮肤
使用 `controller` 属性在 `<mip-audio>` 中声明自定义交互控件。可以任意更改 DOM 位置，通过增加 `class` 及 CSS 为控件添加皮肤。  
当使用 `controller` 属性时，`<mip-audio>` 不会默认增加 `class="mip-audio-default-style"`，所有样式需要自己添加。  

下列属性涉及到事件绑定，请务必保留：

- `controller` 交互控件最外层，用于判断是否有自定义控件。
- `play-button` 开始/暂停按钮。
- `current-time` 当前播放时间。
- `total-time` 音频总时长。
- `seekbar` 进度条。
- `seekbar-fill` 进度条中已播放，具有特殊颜色。
- `seekbar-btn` 进度条拖动按钮。

[notice] controller, current-time 等属性请务必保留，如果不需要总时间，可以设置 `display:none`。 

下列 `class` 为播放时动态添加，可以设置自定义图标:

- `mip-audio-stopped-icon` 图标，暂停时显示的三角图标。
- `mip-audio-playing-icon` 图标，播放时显示的双竖杠图标。

[warning]开发时请关注控制台（Console），避免组件报错。

``` html
<mip-audio 
    src="https://mip-doc.bj.bcebos.com/guitar.mp3"
    class="all-pink"
    layout="fixed-height"
    height="50">
    <div controller class="bg-color-pink">
        <i play-button class="mip-audio-stopped-icon"></i>
        <div seekbar>
            <div seekbar-fill class="bg-color-pink2"></div>
            <div seekbar-button class="bg-color-pink3"></div>
        </div>
        <div current-time class="color-gray">00:00</div>
        <div total-time class="color-gray">--:--</div>
    </div>
</mip-audio>
```


## 属性

### autoplay
说明：移动端部分浏览器会忽视 `autoplay` 参数，禁止自动播放，（[developer.apple.com 从用户体验角度的解释](https://developer.apple.com/library/content/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html)）

### controls
说明：无论是否写 `controls`，都显示音频交互控件。因为移动端部分浏览器禁止自动播放，音频组件需要显示控制条，使用户可以主动触发播放操作。

### src loop 等  
说明：`<audio>` 属性在 `<mip-audio>` 标签上可以直接使用  
使用限制：属性名和使用方法以[MDN文档-audio标签](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/audio)为准
