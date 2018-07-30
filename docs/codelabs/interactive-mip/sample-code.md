# 完整示例代码
其实执行到上一步我们已经完成了示例的全部开发步骤。但为了清晰和可读性考虑，我们把最终形态的示例代码展示给开发者。

index.html
```html
<html>
  <head>
    <meta charset="utf-8">
    <title>首页</title>
    <meta name="apple-touch-fullscreen" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="format-detection" content="telephone=no">
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
    <link rel="stylesheet" href="https://c.mipcdn.com/static/v2/mip.css">
    <style mip-custom>
      body {
        padding: 10px;
      }
      .mod {
        border: 1px solid rgba(0, 0, 0, 0.2);
        margin-bottom: 20px;
      }
      label {
        line-height: 40px;
      }
      input {
        border: 1px solid #666;
        width: 100px;
        height: 20px;
        padding: 6px;
      }
      ul {
        list-style-type: none;
        display: flex;
      }
      li {
        flex: 1 1 auto;
        background: rgba(0, 0, 0, 0.1);
        padding: 10px 0;
        text-align: center;
        border-left: 1px solid #bbb;
      }
      li:first-of-type {
        border: none;
      }
      .loading-tip {
        text-align: center;
        height: 100px;
        line-height: 100px;
        width: 100%;
      }
    </style>
  </head>
  <body>
      <mip-data>
        <script type="application/json">
          {
            "no": 0,
            "imgList": [
                "https://www.mipengine.org/static/img/sample_01.jpg",
                "https://www.mipengine.org/static/img/sample_02.jpg",
                "https://www.mipengine.org/static/img/sample_03.jpg"
            ],
            "tab": "娱乐",
            "loadingTip": "default"
          }
        </script>
      </mip-data>

      <div class="mod">
        <label for="input">
          输入数字 0-2 以切换图片:
          <input id="input" type='text' on="change:MIP.setData({no:DOM.value})">
        </label>      
        <mip-img m-bind:src="imgList[no]" width="100%" height="300px"></mip-img>
      </div>

      <div class="mod">
        <ul>
          <li on="tap:MIP.setData({tab: '娱乐'})">娱乐</li>
          <li on="tap:MIP.setData({tab: '体育'})">体育</li>
          <li on="tap:MIP.setData({tab: '新闻'})">新闻</li>
        </ul>
        <div m-text="loadingTip" class="loading-tip"></div>
      </div>
      <mip-script>
        console.log('watched')
        MIP.watch('tab', function (newVal) {
          MIP.setData({
            loadingTip: `正在加载${newVal}频道的数据...`
          })
        })
      </mip-script>

      <script src="https://c.mipcdn.com/static/v2/mip.js"></script>
      <script src="https://c.mipcdn.com/static/v2/mip-script/mip-script.js"></script>
    </body>
</html>
```
