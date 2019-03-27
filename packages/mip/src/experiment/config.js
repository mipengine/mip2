/**
 * @file MIP 前端实验配置文件
 * @author mj(zoumiaojiang@gmail.com)
 */

export default {
  site: {
    /**
     * 如果有实验需求就按照如下的格式配置
     */
    test1: {
      description: '1 测试开始时间在起始时间和结束时间范围内',
      startTime: '2019-02-13 00:00:00',
      endTime: '2019-04-10 23:59:59',
      sites: [
        'wenxue.m.iqiyi.com'
      ]
    },
    test2: {
      description: '2 起始时间默认 结束时间在测试开始时间之后',
      endTime: '2019-04-10 23:59:59',
      sites: [
        'm.120ask.com'
      ]
    },
    test3: {
      description: '3 起始时间在测试开始时间之前 结束时间默认',
      startTime: '2019-02-13 00:00:00',
      sites: [
        'baobao.baidu.com',
      ]
    },
    test4: {
      description: '4 起始时间和默认时间都默认',
      sites: [
        'muzhi.baidu.com'
      ]
    },
    test5: {
      description: '5 起始时间在测试开始时间之后',
      startTime: '2019-03-27 23:59:59',
      endTime: '2019-04-10 23:59:59',
      sites: [
        'm.120ask.com'
      ]
    },
    test6: {
      description: '6 结束时间在测试开始时间之前',
      startTime: '2019-03-23 23:59:59',
      endTime: '2019-03-24 23:59:59',
      sites: [
        'm.120ask.com'
      ]
    },
    test7: {
      description: '7 时间格式错误',
      startTime: '2019-03-23 23:79:59',
      endTime: '2019-03-29 23:59:59',
      sites: [
        'm.120ask.com'
      ]
    },
    test8: {
      description: '8 起始时间大于结束时间',
      startTime: '2019-03-29 23:59:59',
      endTime: '2019-03-24 23:59:59',
      sites: [
        'm.120ask.com'
      ]
    }
  },

  abTest: {
    test1: {
      description: '1 测试开始时间在起始时间和结束时间范围内',
      startTime: '2019-02-13 00:00:00',
      endTime: '2019-04-10 23:59:59',
      // 所开的流量的百分比
      ratio: 100
    },
    test2: {
      description: '2 起始时间默认 结束时间在测试开始时间之后',
      endTime: '2019-04-10 23:59:59',
      // 所开的流量的百分比
      ratio: 100
    },
    test3: {
      description: '3 起始时间在测试开始时间之前 结束时间默认',
      startTime: '2019-02-13 00:00:00',
      // 所开的流量的百分比
      ratio: 100
    },
    test4: {
      description: '4 起始时间和默认时间都默认',
      // 所开的流量的百分比
      ratio: 100
    },
    test5: {
      description: '5 起始时间在测试开始时间之后',
      startTime: '2019-03-27 23:59:59',
      endTime: '2019-04-10 23:59:59',
      // 所开的流量的百分比
      ratio: 100
    },
    test6: {
      description: '6 结束时间在测试开始时间之前',
      startTime: '2019-03-23 23:59:59',
      endTime: '2019-03-24 23:59:59',
      // 所开的流量的百分比
      ratio: 100
    },
    test7: {
      description: '1-7 测试开始时间在起始时间和结束时间范围内',
      startTime: '2019-02-13 00:00:00',
      endTime: '2019-04-10 23:59:59',
      // 所开的流量的百分比
      ratio: 0
    },
    test8: {
      description: '1-8 测试开始时间在起始时间和结束时间范围内',
      startTime: '2019-02-13 00:00:00',
      endTime: '2019-04-10 23:59:59',
      // 所开的流量的百分比
      ratio: 50
    },
    test9: {
      description: '1-8 测试开始时间在起始时间和结束时间范围内',
      startTime: '2019-02-13 00:00:00',
      endTime: '2019-04-10 23:59:59',
      // 所开的流量的百分比
      ratio: 10
    }
  }
}
