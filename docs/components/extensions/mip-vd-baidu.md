# mip-vd-baidu

`<mip-vd-baidu>` HTTP 视频源播放的百度解决方案。

在 MIP 中，一些资源的使用需要支持 HTTPS，视频就是其中一种。但目前大部分站点的视频资源都还是 HTTP 的资源，无法在百度 MIP 搜索结果中直接使用，`<mip-video>` 视频组件针对 HTTP 的视频资源采用跳到一个 HTTP 的播放页面进行播放，这种体验并非最佳。故 MIP 项目组联合百度搜索，推出在 MIP 中直接使用 HTTP 视频源进行播放的解决方案，那就是 `<mip-vd-baidu>` 组件。

标题|内容
----|----
类型|通用
支持布局|responsive
所需脚本|https://c.mipcdn.com/static/v1/mip-vd-baidu/mip-vd-baidu.js

## 示例

### 基本用法
```html
<mip-vd-baidu layout="responsive" width="640" height="360" 
	title="MIP移动网页加速器" 
	src="http://mip-doc.bj.bcebos.com/MIPSampleVideo.mp4" 
	poster="https://mip-doc.bj.bcebos.com/mip-video-poster.jpg">
</mip-vd-baidu>
```

## 属性

### title

说明：视频的标题  
必选项：是  
类型：字符串  
取值范围：无  
单位：无  
默认值：无  

### src

说明：视频源地址  
必选项：是  
类型：URL 类型  
取值范围：标准 URL  
单位：无  
默认值：无  

### poster

说明：视频源的封页  
必选项：是  
类型：图片 URL 类型  
取值范围：标准图片 URL  
单位：无  
默认值：无  

## 技术实现原理
1. 通过组件的参数生成视频请求的 URL；
2. 请求百度 MIP 视频  Server；
3. 请求内容池，如果存在该视频资源，返回支持 HTTPS 的视频 URL，若不存在，返回原 URL，并调用视频抓取服务，将视频抓取放入内容池，需要添加 IP 白名单：123.125.71.*；
4. 通过百度 MIP 视频 Server 返回的视频 URL 做播放逻辑。

概括地说，百度 MIP 视频服务会通过抓取，将 HTTP 的视频源抓取到百度 MIP 视频内容池， 从而达到视频支持 HTTPS 的目的。

详细步骤见如下流程图：  
![MIP视频服务流程图](https://user-images.githubusercontent.com/3872051/34427766-ba23b8a4-ec80-11e7-8581-240269edec8b.png)

## 注意事项

若缺少必填属性，MIP  视频服务的抓取流程无法进行。