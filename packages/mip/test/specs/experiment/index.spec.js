/**
 * @file experiment 单测
 * @author mj(zoumiaojiang@gmail.com)
 */

import {
  assertAbTest,
  assertSite,
  tryAssertAllAbTests,
  setConfig
} from 'src/experiment/index'

/* global describe, it, before, expect */

describe('MIP front-end experiment', () => {
  before(() => {
    setConfig({
      site: {
        /**
         * 如果有实验需求就按照如下的格式配置
         */
        test1: {
          description: 'Test1 实验的描述',
          sites: [
            'localhost'
          ]
        },
        test2: {
          description: 'Test2 实验的描述',
          sites: [
            'unkonw.host'
          ]
        },
        test3: {
          description: 'Test3 实验的描述',
          startTime: '2019-02-13 00:00:00',
          endTime: '2099-04-10 23:59:59',
          sites: [
            'localhost'
          ]
        },
        test4: {
          description: 'Test1 实验的描述',
          startTime: '2019-02-13 00:00:00',
          endTime: '2019-03-10 23:59:59',
          sites: [
            'localhost'
          ]
        }
      },

      abTest: {
        test1: {
          description: 'abTest1 实验描述',
          startTime: '2019-02-14 00:00:00',
          endTime: '2099-03-25 17:08:00',
          // 所开的流量的百分比
          ratio: 100
        },
        test2: {
          description: 'abTest2 实验描述',
          startTime: '2019-03-21 00:00:00',
          endTime: '2019-03-21 23:59:59',
          // 所开的流量的百分比
          ratio: 100
        },
        test3: {
          description: 'abTest3 实验描述',
          startTime: '2019-02-14 00:00:00',
          endTime: '2099-03-25 17:08:00',
          // 所开的流量的百分比
          ratio: 0
        },
        test4: {
          description: 'abTest4 实验描述',
          // 所开的流量的百分比
          ratio: 100
        }
      }
    })
  })

  it('should run right site experiment', () => {
    let site1AssertResult = assertSite('test1')
    let site2AssertResult = assertSite('test2')
    let site3AssertResult = assertSite('test3')
    let site4AssertResult = assertSite('test4')

    expect(site1AssertResult, true)
    expect(site2AssertResult, false)
    expect(site3AssertResult, true)
    expect(site4AssertResult, false)
  })

  it('should get abTest names', () => {
    let arr = tryAssertAllAbTests()
    expect(arr).to.be.a('array')
  })

  it('should shoot abTest', () => {
    let abTest1AssertResult = assertAbTest('test1')
    let abTest2AssertResult = assertAbTest('test2')
    let abTest3AssertResult = assertAbTest('test3')
    let abTest4AssertResult = assertAbTest('test4')

    expect(abTest1AssertResult, true)
    expect(abTest2AssertResult, false)
    expect(abTest3AssertResult, false)
    expect(abTest4AssertResult, true)
  })
})
