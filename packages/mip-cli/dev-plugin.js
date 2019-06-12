module.exports = {
  name: 'validate',
  description: '启动开发模式',
  args: [
    {
      name: 'componentName',
      optional: true
    }
  ],
  options: [
    {
      name: 'port',
      shortName: 'p',
      optional: true,
      description: '端口号',
      type: 'required'
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
  subCommands: [
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