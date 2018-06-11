# mip-component-validator

MIP 组件校验，用于检查自定义组件是否符合 [组件开发规范](https://github.com/mipengine/mip2/blob/master/docs/specs/mip-components-spec.md)。

## Usage

1. 安装

` npm install mip-component-validator `

2. API

```js
const validator = require('mip-component-validator');
const dirPath = './test/mip-demo';

// 校验一个目录
const result = validator.validate(dirPath);
console.log(result);
```

校验结果 `result` :

- result.status 状态码 0 成功, 1 失败
- result.errors [] 错误列表
- result.warns [] 警告列表

