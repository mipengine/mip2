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
      description: 'Test1 实验的描述',
      startTime: '2019-02-13 00:00:00',
      endTime: '2019-04-10 23:59:59',
      sites: [
        'nj03-wise-ronghe28.nj03.baidu.com',
        'localhost'
      ]
    }
  },

  abTest: {
    test1: {
      description: 'abTest1 实验描述',
      startTime: '2019-02-14 00:00:00',
      endTime: '2019-04-20 17:08:00',
      // 所开的流量的百分比
      ratio: 20
    },
    test2: {
      description: 'abTest2 实验描述',
      startTime: '2019-03-21 00:00:00',
      endTime: '2019-04-21 23:59:59',
      // 所开的流量的百分比
      ratio: 40
    }
  }
}
