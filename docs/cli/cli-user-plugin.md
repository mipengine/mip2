# mip2 CLI 用户自定义扩展

除了内置的 `init`，`dev`，`add`，`validate` 等命令，mip2 CLI 亦提供了自定义扩展机制（mip2@1.1.0 及以上），开发者可以根据自身需求来开发相应的扩展命令，丰富命令行的功能。

## 使用自定义扩展命令

用户自定义扩展命令使用 npm package 的方式进行开发。我们约定，扩展包名为：**`mip-cli-plugin-{Command}`**

如需使用自己或社区的扩展命令，无需手动进行安装，只需运行 `mip2 {Command}` 即可快速开始使用。

``` bash
# eg: 运行包名为 mip-cli-plugin-foo 的扩展命令
$ mip2 foo
```

可以使用 `--help` 选项查看当前内置命令和扩展命令列表

``` bash
$ mip2 --help

# Commands 是内置命令
# User Plugins Comamnd 是扩展命令

Usage: mip2 <command> [options]

Options:
...
Commands:

init           初始化 MIP 2.0 项目
...

User Plugin Commands:

foo            foo 扩展命令
...
```

## 开发扩展命令（User Plugin Command）

### 1. 创建项目

扩展命令的项目模板可以参考：[开发模板](https://github.com/mipengine/mip-cli-plugin-foo)

我们可以参考模板创建一个结构相同的项目，或者直接 `clone` 项目模板，然后根据需要进行相应修改：

```bash
git clone https://github.com/mipengine/mip-cli-plugin-foo
```

### 2. 开发

在开发模式中，我们可以使用 `npm link` 命令方便调试

```bash
cd mip-cli-plugin-foo
npm link
```

`npm link` 之后，运行 `mip2 --help` 就能看到我们的扩展命令已经出现在 User Plugin Command 中了。

扩展命令的项目结构如下：

```bash
├── cli
│   ├── foo
│   │   └── bar.js    // 对应子命令，mip2 foo bar
│   └── foo.js        // 对应主命令，mip2 foo
├── index.js          // 模块入口
├── lib               // 建议把业务逻辑写在 lib 目录
├── package.json
└── README.md
```

`cli` 目录是命令的入口，所有的命令都应该放在这里。
`mip2 foo` 会自动读取 `cli/foo.js` 对应的模块。同理：
`mip2 foo bar` 会自动读取 `cli/foo/bar.js` 对应的模块。

> 注意：模块名称与命令名称必须保持一致，否则会找不到对应的模块

#### 配置扩展命令

自定义扩展命令可以通过命令模块中的 `cli.config` 进行配置：

``` javascript
config: {
  // 命令描述信息，显示在命令列表说明中
  description: 'foo bar 功能测试',

  // 和 usage 一起组成 Usage 信息
  name: 'mip2 foo',

  // <id> 表示 id 为必选参数，[id] 表示 Id 为可选参数
  usage: '<id>',

  // 命令 options
  options: [
    ['-f, --force', '强制执行'],
    ['-p, --port <value>', '端口号']
  ],

  // 帮助信息， --help 时显示
  help: [
    '',
    '  Examples:',
    '    # 测试自定义 plugin 命令',
    '    $ mip2 foo <id> -f',
    '    # 测试自定义 plugin 命令',
    '    $ mip2 foo <id> -p 8888'
  ].join('\n')
},
```

#### 扩展命令入口

`cli.main` 是命令执行的入口

``` javascript
/**
  * 命令执行入口
  *
  * @param {Array} 命令接收的参数数组
  * @param {Object} 命令配置的 options 对象。option 接收 <value> 时获取值，否则返回 boolean 类型
  */
main: function (args, opts) {
  // your own stuff
  console.log('args: ')
  console.log(args)
  console.log('opts: ')
  console.log('opts.force: ' + opts.force)
  console.log('opts.port: ' + opts.port)
}
```

### 3. 发布

开发测试完成后，使用 `npm publish` 来发布命令扩展。

### 4. 使用

无需手动安装，直接运行即可

``` bash
$ mip2 foo
$ mip2 foo
$ mip2 foo --port
$ mip2 foo bar
$ mip2 foo bar --force
...
```
