MIP

## 开发

- Node.js v6+
- Clone 代码之后运行

```sh
$ npm install # 安装依赖
```

> 建议使用 [淘宝NPM 镜像](https://npm.taobao.org/) 安装速度更快: `cnpm install`

## Test and coverage

- karma + mocha + chai + istanbul

```
# watch mode
$ npm run test:dev

# test case and coverage summary
$ npm run test:cover
```

## 常用命令

```sh
# watch and auto re-build dist/mip.js
$ npm run dev
```
监控代码改动并编译代码到 `dist/mip.js`，可通过 http://localhost:8080/examples/ 预览效果

```sh
# build all dist files, including npm packages
$ npm run build
```
编译代码到 dist 目录
