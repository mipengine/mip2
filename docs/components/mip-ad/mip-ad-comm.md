# mip-ad:ad-comm 通用广告

`<mip-ad>` 的一种类型：通用广告。

标题|内容
----|----
类型|通用
支持布局|reponsive, fixed-height, fixed
所需脚本|https://c.mipcdn.com/static/v1/mip-ad/mip-ad.js

## 示例

### banner 样式

`layout="responsive"` 为组件布局设定（[布局文档](../layout.md)）。`width` 和 `height` 请根据广告实际宽高填写。
```html
<mip-ad
    layout="responsive"
    width="414"
    height="80"
    type="ad-comm"
    tpl="onlyImg"
    href="//m.baidu.com/s?word=百度"
    data-size="1242 180"
    src="https://www.mipengine.org/static/img/sample_01.jpg">
</mip-ad>
```

### 无图样式

```html
<mip-ad
    layout="fixed-height"
    height="80"
    type="ad-comm"
    tpl="noneImg"
    href="//m.baidu.com/s?word=百度"
    data-title="广告标题">
</mip-ad>
```

### 单图样式

```html
<mip-ad
    layout="reponsive"
    width="414"
    height="80"
    type="ad-comm"
    tpl="oneImg"
    href="//m.baidu.com/s?word=百度"
    data-size="1242 180"
    src="https://www.mipengine.org/static/img/sample_02.jpg"
    data-title="广告标题">
</mip-ad>
```

### 多图样式

```html
<mip-ad
    type="ad-comm"
    tpl="moreImg"
    href="//m.baidu.com/s?word=百度"
    data-size="1242 180"
    src="https://www.mipengine.org/static/img/sample_01.jpg;https://www.mipengine.org/static/img/sample_02.jpg;https://www.mipengine.org/static/img/sample_03.jpg"
    data-ads="这里是广告摘要;这里是广告摘要"
    data-txt="这里是图片标题;这里是图片标题;这里是图片标题啊啊啊"
    data-title="这里是广告标题这里是广告标题标">
</mip-ad>
```

## 属性

### type

说明：广告类型
必选项：是
类型：字符串
取值：ad-comm
默认值：无

### tpl

说明：样式
必选项：是
类型：字符串
取值：banner, noneImg, oneImg, moreImg
默认值：无

### href

说明：跳转地址
必选项：是
类型：URL
默认值：无

### src

说明：图片地址，在多图类型下，多张图片的地址用半角分号(;)分隔开
必选项：否
类型：字符串
默认值：无

### data-size

说明：图片大小，用来设定图片的宽高比，在有图片的情况下需要设置
必选项：否（广告类型为 banner 时，必填）
类型：两数字用空格分开
默认值：无

### data-title

说明：广告标题，可设置为广告描述
必选项：（banner，多图）否；（无图，单图）是
类型：字符串
默认值：无

### data-txt

说明：广告子标题，多图时可用
必选项：否
类型：字符串
默认值：无

### data-ads

说明：广告摘要，多图时可用
必选项：否
类型：字符串
默认值：无
