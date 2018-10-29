# CHANGELOG

- 1.4.1
    1. 增加 css 压缩功能

- 1.4.0
    1. 编译生成的组件代码支持 script 异步加载
- 1.3.2
    1. 更新 mip-component-validator 依赖版本，修复 validator 无法获取最新白名单的 bug
- 1.3.1
    1. 修复 plugin 删除 index 入口抛出的异常
    2. 优化 plugin 错误信息输出
- 1.3.0
    1. 修复不同组件仓库构建出来的代码样式存在覆盖现象
- 1.2.6
    1. 增加低于 7.6 版本的 node 支持
- 1.2.5
    1. 更新 mip-component-validator 依赖版本，修复白名单 bug
- 1.2.4
    1. 修复 node 版本低于 8.0 时不出现版本升级提示的 bug
- 1.2.3
    1. 组件的 README.md 支持自动生成组件脚本地址
- 1.2.2
    1. cli 沙盒注入提示信息增加对应文件提示以及白名单申请引导
    2. 修复 1.2.1 dev/build 模式下默认命令行参数失效的 bug
    3. 修复 dev 模式下 -d 参数不能传相对路径的 bug
    4. 升级 mip-sandbox，添加 `CustomEvent` 依赖
    5. 增加 mip2 dev/build -i all 的参数简写

- 1.2.1
    1. cli dev 和 build 命令增加 proxy 配置，支持对组件代码中字符串部分做替换以模拟实现开发和测试时的请求转发功能；
    2. mip2 build 增加 -e/--env 指定当前编译的环境变量 process.env.NODE_ENV

- 1.2.0
    1. 升级 validator 依赖 mip-component-validator 至 1.1.0，该版本全流程改为异步实现
    2. dev 和 build 命令强制进行 npm 白名单校验，出现非白名单的 npm 包，会在控制台将包名打印出来
    3. validate 命令增加 -w 参数校验 npm 白名单
    4. validate -c 命令增加组件所在白名单校验

- 1.1.10
    1. 升级 mip-sandbox 依赖，添加 `crypto` 入白名单
    2. 将 helpers 改回直接从 window 获取

- 1.1.9
    1. 升级 mip-sandbox 依赖，添加 `WebSocket` 入白名单

- 1.1.8
    1. 升级 mip-sandbox 依赖，添加 `mipDataPromises` 入白名单

- 1.1.6
    1. mip2 dev 模式将 --autoopen 的简写改为 -o，新增 --asset 参数指定 public path，简写为 -a 与 build 保持一致。-a 默认为 '/'

- 1.1.5
    1. 支持 process.env.NODE_ENV， mip2 dev 的值为 'development'，mip2 build 的值为 'production'

- 1.1.4
    1. mip2 build 产生的组件公用 js 直接指向线上
    2. mip.config.js 新增 `build` 配置项

- 1.1.2
    1. 调整组件公用部分的引入机制

- 1.0.13
    1. 支持组件通过 `import()` 和 `require.ensure` 异步加载模块
    2. dev 模式自动对组件 script 注入 md5

