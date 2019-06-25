// for test case: loadPlugin
function testFn() {}

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
      },
      {
        name: 'file',
        shortName: 'f',
        description: '文件名',
        type: 'required',
      },
      {
        name: 'record',
        shortName: 'r',
        description: '记录',
        type: 'optional',
      },
      {
        name: 'aa',
        shortName: 'a',
        description: 'withfn',
        defaultValue: '12345',
        fn: testFn
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
            name: 'first',
            optional: true
          },
          {
            name: 'second',
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