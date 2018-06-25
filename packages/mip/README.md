MIP

## 开发

- Node.js v6+
- Clone 代码之后运行

```sh
$ cnpm install # npm install
```

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
监控代码改动并编译代码到 `dist/mip.js`，可通过 `open examples/simple/index.html` 预览效果

```sh
# build all dist files, including npm packages
$ npm run build
```
编译代码到 dist 目录
