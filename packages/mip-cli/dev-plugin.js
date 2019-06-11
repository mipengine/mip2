module.exports = {
  command: {
    name: 'dev',
    description: '启动开发模式',
    args: [
      {
        name: 'siteName',
        optional: true
      },
      {
        name: 'path',
        optional: true
      },
      {
        name: 'size',
        optional: true
      }
    ],
    options: [
      {
        name: 'port',
        shortName: 'p',
        optional: false,
        description: '端口号'
      },
      {
        name: 'length',
        shortName: 'l',
        optional: false,
        description: '长度'
      }
    ],
    run: function (params) {
      console.log(params)
    },
    subcommands: [
      {
        name: 'component',
        description: '启动组件调试',
        args: [
          {
            name: 'componentName',
            optional: true
          }
        ],
        options: [
          {
            name: 'type',
            shortName: 't',
            optional: false,
            description: '类型'
          }
        ],
        run: function (params) {
          console.log(params)
        }
      }
    ]
  }
}