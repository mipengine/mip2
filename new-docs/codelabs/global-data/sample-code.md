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
      h1 {
        text-align: center;
        line-height: 80px;
      }
      .city {
        text-align: center;
        line-height: 40px;
      }
      .next-link {
        display: block;
        margin: 0 auto;
        width: 170px;
        text-align: center;
        background: #69f;
        border-radius: 20px;
        height: 40px;
        line-height: 40px;
        color: white;
      }
    </style>
  </head>
  <body>
      <mip-shell>
        <script type="application/json">
        {
          "routes": [
            {
              "pattern": "/index.html",
              "meta": {
                "header": {
                  "show": true,
                  "title": "我的首页",
                  "buttonGroup": [
                    {
                        "name": "subscribe",
                        "text": "关注"
                    },
                    {
                        "name": "chat",
                        "text": "发消息"
                    }
                  ]
                },
                "view": {
                  "isIndex": true
                }
              }
            },
            {
              "pattern": "/city-selector.html",
              "meta": {
                "header": {
                  "show": true,
                  "title": "城市选择页"
                }
              }
            }
          ]
        }
        </script>
      </mip-shell>

      <mip-data>
        <script type="application/json">
          {
            "#city": "上海",
            "title": "首页标题"
          }
        </script>
      </mip-data>
      <h1 m-text="title"></h1>
      <p class="city">选择城市：<span m-text="city"></span></p>

      <a mip-link href="./city-selector.html" class="next-link">Go to City Selector Page</a>

      <script src="https://c.mipcdn.com/static/v2/mip.js"></script>
    </body>
</html>
```

city-selector.html
```html
<html>
  <head>
    <meta charset="utf-8">
    <title>城市选择页</title>
    <meta name="apple-touch-fullscreen" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="format-detection" content="telephone=no">
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
    <link rel="stylesheet" href="https://c.mipcdn.com/static/v2/mip.css">
    <style mip-custom>
      h1 {
        text-align: center;
        line-height: 80px;
      }
      .city {
        padding: 20px;
        background: rgba(0, 0, 0, .1)
      }
      .city span {
        color: red;
      }
    </style>
  </head>
  <body>
      <mip-shell>
        <script type="application/json">
          {
            "routes": [
              {
                "pattern": "/index.html",
                "meta": {
                  "header": {
                    "show": true,
                    "title": "我的首页",
                    "buttonGroup": [
                      {
                          "name": "subscribe",
                          "text": "关注"
                      },
                      {
                          "name": "chat",
                          "text": "发消息"
                      }
                    ]
                  },
                  "view": {
                    "isIndex": true
                  }
                }
              },
              {
                "pattern": "/city-selector.html",
                "meta": {
                  "header": {
                    "show": true,
                    "title": "城市选择页"
                  }
                }
              }
            ]
          }
        </script>
      </mip-shell>

      <mip-data>
        <script type="application/json">
          {
            "title": "城市选择页标题"
          }
        </script>
      </mip-data>

      <h1 m-text="title"></h1>
      <p class="city">当前选择城市: <span m-text="city"></span></p>

      <mip-city-list>
        <script type="application/json">
          {
            "list": [
              "北京",
              "上海",
              "广州",
              "深圳",
              "成都",
              "武汉",
              "拉萨",
              "南昌",
              "杭州",
              "苏州",
              "南京",
              "天津"
            ]
          }
        </script>
      </mip-city-list>

      <script src="https://c.mipcdn.com/static/v2/mip.js"></script>
      <script src="http://somecdn.com/mip-city-list.js"></script>
    </body>
</html>
```

mip-city-list.vue
```html
<template>
  <div class="mip-city-list-wrapper">
    <p class="sub-header">城市列表：</p>
    <ul>
      <li 
        v-for="(item, i) in list"
        @click="select(i)">{{item}}</li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    list: {
      default: () => [],
      type: Array
    }
  },
  methods: {
    select (index) {
      MIP.setData({
        city: this.list[index]
      })
    }
  }
}
<script>

<style scoped>
.mip-city-list-wrapper {
  padding: 20px;
}
.mip-city-list-wrapper ul {
  list-style-type: none;
  line-height: 28px;
  margin-left: 20px;
}
</style>
```