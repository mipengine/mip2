module.exports = {
  name: 'dev',
  description: '启动开发模式',
  args: [
    {
      name: 'componentName',
      optional: false
    }
  ],
  options: [
    {
      name: 'port',
      shortName: 'p',
      description: '端口号',
      type: 'flag',
      // defaultValue: 8845,
      // fn: function () {}
    },
    {
      name: 'length',
      shortName: 'l',
      description: '长度',
      type: 'required'
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
          description: '类型',
          type: 'flag'
        }
      ],
      run: function (params) {
        console.log(params)
      }
    }
  ]
}