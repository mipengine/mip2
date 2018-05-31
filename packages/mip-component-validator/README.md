# mip-component-validator

MIP 组件校验

## Usage

1. 安装

` npm install mip-component-validator `


2. API

```js
const validator = require('mip-component-validator');

// 校验一个目录
validator.validate(dirPath).then(function(result) {
    console.log(result.status); // 状态码 0 成功, 1 失败
    console.log(result.errors); // 错误列表
    console.log(result.warns);  // 警告列表
});
```

