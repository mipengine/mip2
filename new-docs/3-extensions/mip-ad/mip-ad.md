# mip-ad 广告

`<mip-ad>` 用于在 MIP 页中引入广告脚本，投放广告。 

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, fill, container, nodisplay, fixed, flex-item
所需脚本|https://c.mipcdn.com/static/v1/mip-ad/mip-ad.js

## 广告类型选择

`<mip-ad>` 具有多种类型（`type`），`type` 取值由广告分类和投放配置页地址决定。

### 1. 通用广告-图文链接形式
直接使用 [通用广告 ad-comm](//www.mipengine.org/examples/mip-ad/mip-ad-comm.html) 即可。

### 2. 百度联盟 

投放官网：[http://union.baidu.com](http://union.baidu.com)。

广告产品页面|对应 MIP 组件
----|----
[搜索推广合作](http://union.baidu.com/product/prod-search.html) | [`type="ad-qwang"`](/examples/mip-ad/mip-ad-qwang.html)
[网盟推广合作](http://union.baidu.com/product/prod-cpro.html) | [`type="ad-baidu"`](/examples/mip-ad/mip-ad-baidu.html)
[百度联盟广告反屏蔽](http://yingxiao.baidu.com/zhichi/knowledge/detail.action?channelId=4&classId=13484&knowledgeId=15198) | [`type="baidu-wm-ext"`](/examples/mip-ad/mip-baidu-wm-ext.html)

### 3. 百度 SSP 媒体服务

投放官网：[http://ssp.baidu.com](http://ssp.baidu.com)。

广告产品页面|对应 MIP 组件
----|----
[直投广告](http://yingxiao.baidu.com/zhichi/knowledge/detail.action?channelId=24&classId=14547&knowledgeId=14745) | [`type="ad-baiduaap"`](/examples/mip-ad/mip-ad-baidussp.html)
[Feeds联盟广告](https://ssp.baidu.com/)| [`type="ad-ssp"`](/examples/mip-ad/mip-ad-ssp.html)
余下投放方式 | [`type="ad-baidu"`](/examples/mip-ad/mip-ad-baidu.html)

### 4. 百度图+ 
投放官网：[http://imageplus.baidu.com/](http://imageplus.baidu.com/)。

广告产品页面|对应 MIP 组件
----|----
[百度图+广告](http://imageplus.baidu.com/) | [`type="ad-imageplus"`](/examples/mip-ad/mip-ad-imageplus.html)
