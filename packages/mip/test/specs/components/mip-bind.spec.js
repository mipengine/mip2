/**
 * @file mip-bind spec file
 * @author qiusiqi(qiusiqi@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* globals describe, before, it, expect, MIP, after, sinon */

import MipData from 'src/components/mip-bind/mip-data'
import { timeout } from 'src/components/mip-bind/util'
import EventAction from 'src/util/event-action'

const action = new EventAction()

function sleep (time) {
  if (time == null) {
    return new Promise(resolve => resolve())
  }
  return new Promise(resolve => setTimeout(resolve, time))
}

function getMipDataProps (props = {}) {
  return Object.assign(
    Object.keys(MipData.props).reduce((obj, key) => {
      obj[key] = MipData.props[key].default
      return obj
    }, {}),
    props
  )
}

describe('mip-bind util', function () {
  it('timeout reject', async () => {
    let shouldError = false
    try {
      await timeout(0)
    } catch (e) {
      shouldError = true
    }

    expect(shouldError).to.be.equal(true)
  })

  it('timeout resolve', async () => {
    let shouldError = false
    try {
      await timeout(0, true)
    } catch (e) {
      shouldError = true
    }
    expect(shouldError).to.be.equal(false)
  })
})

describe('mip-bind', function () {
  let eleText
  let eleBind
  let eleObject
  let iframe

  after(function () {
    document.body.removeChild(eleText)
    document.body.removeChild(eleBind)
    document.body.removeChild(eleObject)
    document.body.removeChild(iframe)
    // window.g = null
    // window.m = null
  })

  describe('init data', function () {
    let dumbDiv
    let eleFalse
    let eleElse

    before(function () {
      // some normal bindings
      eleText = createEle('p', ['loc.city'], 'text')
      eleBind = createEle('p', ['data-active', 'global.isGlobal'], 'bind')
      eleObject = createEle('p', ['data', 'global.data'], 'bind')
      eleFalse = createEle('p', ['editing', '!editing'], 'bind')
      eleElse = createEle('a', ['href', `'./content.html?id=' + id + '&name=user#hash'`], 'bind')

      iframe = createEle('iframe', null)

      dumbDiv = createEle('div', null)
      dumbDiv.innerHTML = `
        <div class="inner-wrapper" disabled>
          <body>dup body</body>
          <h1 m-text=""></h1>
          <p m-bind:=""></p>
          <p style="color:red;;;" m-bind:style="{fontSize: fontSize + 'px'}" id="binding-fontsize">test:<span>1</span></p>
          <mip-data></mip-data>
          <mip-data>
            <script type="application/json"></script>
          </mip-data>
          <mip-data>
            <script type="application/json">
              {
                "#global": {
                  "data": {
                    "name": "level-1",
                    "age": 1
                  },
                  "isGlobal": true
                },
                "loc": {
                  "province": "广东",
                  "city": "广州"
                },
                "list": ["a", "b", {"item": 2}],
                "id": 1
              }
            </script>
          </mip-data>
          <mip-data
            id="scopedData"
            scope
          >
            <script type="application/json">
            {
              "a": 1,
              "b": 2
            }
            </script>
          </mip-data>
          <mip-data
            scope
          >
            <script type="application/json">
            {
              "aa": 1,
              "bb": 2
            }
            </script>
          </mip-data>
        </div>
      `

      MIP.$set({
        '#title': 'test case'
      })
    })

    it('should set data initially', async function () {
      expect(window.m).to.eql({
        global: {
          data: {
            name: 'level-1',
            age: 1
          },
          isGlobal: true
        },
        title: 'test case',
        loc: {
          province: '广东',
          city: '广州'
        },
        list: ['a', 'b', {item: 2}],
        id: 1,
        scopedData: {
          a: 1,
          b: 2
        },
        aa: 1,
        bb: 2
      })

      expect(MIP.getData('global.data.name')).to.equal('level-1')
      await sleep()

      expect(window.g).to.eql({
        global: {
          data: {
            name: 'level-1',
            age: 1
          },
          isGlobal: true
        },
        title: 'test case'
      })

      expect(eleText.textContent).to.equal('广州')
      expect(eleBind.getAttribute('data-active')).to.equal('true')
      expect(eleObject.getAttribute('data')).to.equal('{"name":"level-1","age":1}')
      expect(eleElse.getAttribute('href')).to.equal('./content.html?id=1&name=user#hash')


    })

    it('should bind data with delayed "false"', async function () {
      MIP.$set({
        editing: false
      })

      await sleep()

      expect(eleFalse.getAttribute('editing')).to.equal('true')

      MIP.setData({
        editing: true
      })

      await sleep()

      expect(eleFalse.getAttribute('editing')).to.equal('false')
    })

    after(function () {
      document.body.removeChild(dumbDiv)
      document.body.removeChild(eleFalse)
      document.body.removeChild(eleElse)
    })
  })

  describe('json format', function () {
    let mipData
    before(function () {
      mipData = new MipData()
      mipData.props = getMipDataProps()
      let mipDataTag = document.createElement('mip-data')
      let script = document.createElement('script')
      script.setAttribute('type', 'application/json')
      script.textContent = `
        {
          "wrongFormatData": function () {}
        }
      `
      mipDataTag.appendChild(script)
      mipData.element = mipDataTag
    })

    it('should not combine wrong formatted data with m', function () {
      expect(mipData.sync.bind(mipData)).to.throw(/Content should be a valid JSON string!/)
      expect(window.m.wrongFormatData).to.be.undefined
    })
  })

  describe('async mip-data', function () {
    const json = (body, status) => {
      const mockResponse = new window.Response(JSON.stringify(body), {
        status: status,
        headers: {
          'Content-type': 'application/json'
        }
      })
      return mockResponse
    }

    let fetchOrigin
    let div
    before(function () {
      div = document.createElement('div')
      document.body.appendChild(div)
      fetchOrigin = window.fetch
      sinon.stub(window, 'fetch')
    })

    after(function () {
      document.body.removeChild(div)
      window.fetch = fetchOrigin
    })

    it('should fetch async data', function (done) {
      window.fetch.returns(
        Promise.resolve(
          json({tabs: [1, 2, 3]}, 200)
        )
      )

      div.innerHTML = '<mip-data src="/testData"></mip-data>'
      // let mipData = new MipData()
      // mipData.props = getMipDataProps()
      // let mipDataTag = document.createElement('mip-data')
      // mipDataTag.setAttribute('src', '/testData')
      // mipData.element = mipDataTag

      // mipData.build.bind(mipData)()
      expect(window.mipDataPromises.length).to.equal(1)

      Promise.all(window.mipDataPromises).then(function () {
        expect(MIP.getData('tabs')).to.have.lengthOf(3)
        expect(window.mipDataPromises.length).to.equal(0)
        done()
      })
    })

    it('should fetch async data when src is set and refresh', async function () {
      window.fetch.returns(
        Promise.resolve(
          json({ testAttributeChangeForMIPData: 123 }, 200)
        )
      )

      div.innerHTML = `
        <mip-data m-bind:src="dynamicSrc" id="dynamic-mip-data"></mip-data>
        <div on="haha:dynamic-mip-data.refresh" id="dynamic-mip-data-trigger"></div>
      `
      let dataDom = document.getElementById('dynamic-mip-data')
      MIP.util.customEmit(document, 'dom-change', { add: [dataDom] })
      expect(MIP.getData('testAttributeChangeForMIPData')).to.be.equal(undefined)
      MIP.setData({ dynamicSrc: '/testData' })
      await sleep(100)
      expect(MIP.getData('testAttributeChangeForMIPData')).to.be.equal(123)
      MIP.setData({ testAttributeChangeForMIPData: 234 })
      expect(MIP.getData('testAttributeChangeForMIPData')).to.be.equal(234)

      window.fetch.returns(
        Promise.resolve(
          json({ testAttributeChangeForMIPData: 123 }, 200)
        )
      )

      action.execute('haha', document.getElementById('dynamic-mip-data-trigger'))
      await sleep(100)
      expect(MIP.getData('testAttributeChangeForMIPData')).to.be.equal(123)

      window.fetch.returns(
        Promise.resolve(
          json({ testAttributeChangeForMIPData: 678}, 200)
        )
      )

      await sleep(100)
      MIP.setData({ dynamicSrc: undefined })
      await sleep(100)
      expect(MIP.getData('testAttributeChangeForMIPData')).to.be.equal(123)
    })

    it('should fetch async data 404', function (done) {
      window.fetch.returns(
        Promise.resolve(
          json({status: 404}, 404)
        )
      )

      div.innerHTML = '<mip-data src="/testData"></mip-data>'

      // let mipData = new MipData()
      // mipData.props = getMipDataProps()
      // let mipDataTag = document.createElement('mip-data')
      // mipDataTag.setAttribute('src', '/testData')
      // mipData.element = mipDataTag

      // mipData.build.bind(mipData)()
      expect(window.mipDataPromises.length).to.equal(1)

      Promise.all(window.mipDataPromises).catch(function () {
        expect(MIP.getData('status')).to.be.undefined
        expect(window.mipDataPromises.length).to.equal(0)
        done()
      })
    })

    it('should fetch async data failed', function (done) {
      window.fetch.returns(
        Promise.reject(
          json({status: 'failed'}, 200)
        )
      )
      div.innerHTML = '<mip-data src="/testData"></mip-data>'
      // let mipData = new MipData()
      // mipData.props = getMipDataProps()
      // let mipDataTag = document.createElement('mip-data')
      // mipDataTag.setAttribute('src', '/testData')
      // mipData.element = mipDataTag

      // mipData.build.bind(mipData)()
      expect(window.mipDataPromises.length).to.equal(1)

      Promise.all(window.mipDataPromises).catch(function () {
        expect(MIP.getData('status')).to.be.undefined
        expect(window.mipDataPromises.length).to.equal(0)
        done()
      })
    })
  })

  describe('setData', function () {
    let ct = 0
    before(function () {
      MIP.$set({
        num2: 1
      })
      // normal watch
      MIP.watch('global.isGlobal', function () {
        MIP.setData({
          global: {
            data: {
              age: 2
            }
          }
        })
      })
      // not-exist-data
      MIP.watch('data-not-exist', function () {})
      // array / number
      MIP.watch(['num2', 1], () => ct++)
      // // dup watch
      // MIP.watch('num2', () => ct++)
      // no cb
      MIP.watch('data-not-exist')
    })

    it('should change global data correctly', async function () {
      // let $set = sinon.spy(MIP, '$set')

      MIP.setData({
        '#global': {
          data: {
            name: 'level-1-1'
          },
          isGlobal: false
        },
        title: 'changed'
      })

      await sleep()
      // MIP.$recompile()
      expect(window.m.global).to.eql({
        data: {
          name: 'level-1-1',
          age: 2
        },
        isGlobal: false
      })

      await sleep()
      expect(eleBind.getAttribute('data-active')).to.equal('false')
      expect(window.m.title).to.equal('changed')
      // sinon.assert.calledThrice($set)
    })

    it('should have watched the change of isGlobal and do cb', async function () {
      await sleep()
      expect(window.m.global.data.age).to.equal(2)
    })

    it.skip('should not register duplicate watcher', function () {
      MIP.setData({num2: 2})
      expect(ct).to.equal(1)
    })

    it('should change page data correctly', async function () {
      MIP.setData({
        loc: {
          province: '广东',
          city: '深圳',
          year: 2018
        },
        loading: true,
        newData: 1
      })
      await sleep()
      expect(window.m.loc).to.eql({
        province: '广东',
        city: '深圳',
        year: 2018
      })
      expect(eleText.textContent).to.equal('深圳')
    })

    it('should shift data to a different type and still trace', async function () {
      MIP.setData({
        global: {
          isGlobal: {
            bool: true
          }
        }
      })
      MIP.setData({
        global: {
          isGlobal: {
            bool: false
          }
        }
      })
      MIP.setData({
        global: {
          data: {
            name: 'abcdefg'
          }
        }
      })
      MIP.setData({
        global: {
          data: 7
        }
      })
      MIP.setData({
        global: {
          data: 8
        }
      })

      await sleep()

      expect(eleBind.getAttribute('data-active')).to.equal('{"bool":false}')
      // global.isGlobal change and trigger its watch so i shouldn't be 8
      // expect(eleObject.getAttribute('data')).to.equal('8')
      expect(eleObject.getAttribute('data')).to.equal(JSON.stringify({age: 2}))
    })

    it('should remove attribute when value turns empty', async function () {
      MIP.setData({
        global: {
          data: ''
        }
      })
      await sleep()
      expect(eleObject.getAttribute('data')).to.be.null
    })

    it('should set an object as data', function () {
      expect(() => MIP.setData(1)).to.throw(/setData method MUST accept an object! Check your input:1/)
    })

    it('should not set wrong formatted data', function () {
      expect(() => MIP.setData({
        loading: function () {
          return false
        }
      })).to.throw(/setData method MUST NOT be Function/)

      expect(MIP.getData('loading')).to.be.true
    })

    it('should compile smoothly even if data turn to null', function () {
      MIP.setData({loc: null})
      // MIP.$recompile()

      expect(window.m.loc).to.be.null
    })
  })

  describe('watch', function () {
    it('should run watchers after all data was set', async function () {
      let loadingChanged = false
      MIP.$set({
        'data_key': 0,
        'w-loading': false
      })
      MIP.watch('data_key', function () {
        MIP.setData({
          'w-loading': false
        })
      })
      MIP.watch('w-loading', function () {
        loadingChanged = true
      })

      MIP.setData({
        'data_key': 1,
        'w-loading': true
      })
      expect(loadingChanged).to.be.false
      await sleep()
      expect(loadingChanged).to.be.true
    })

    it('should run watcher after all data was set according to order', async function () {
      let res = ''
      MIP.$set({
        'data_key2': 0,
        'w-loading2': 'false'
      })
      MIP.watch('w-loading2', function (val) {
        res += val
      })
      MIP.watch('data_key2', function () {
        MIP.setData({
          'w-loading2': false
        })
      })

      MIP.setData({
        'data_key2': 1,
        'w-loading2': true
      })
      await sleep()
      expect(res).to.equal('true')
      await sleep()
      expect(res).to.equal('truefalse')
    })

    it('should catch error watcher', async function () {
      MIP.watch('testThrow', function () {
        throw Error('throw error one')
      })
      MIP.watch(function () {
        throw Error('throw error two')
      })
      MIP.setData({
        'testThrow': 1
      })
      await sleep()
      // should run successful
    })
    // @TODO
    it.skip('should avoid infinit update with custom watcher', function () {
      MIP.$set({
        'infinite_a': 0
      })
      MIP.watch('infinite_a', function (newVal) {
        MIP.setData({'infinite_a': +newVal + 1})
      })
      MIP.setData({'infinite_a': 1})
      // [MIP warn]:You may have an infinite update loop
    })
  })

  describe('class-style-binding', function () {
    let eles = []

    before(function () {
      // some normal class bindings
      eles.push(createEle('p', ['class', 'classObject'], 'bind'))
      eles[0].classList.add('default-class')
      eles.push(createEle('p', ['class', '[{ loading: loading }, errorClass]'], 'bind'))
      eles.push(createEle('p', ['class', 'classText'], 'bind'))
      eles.push(createEle('p', ['class', `[loading ? loadingClass : '', errorClass]`], 'bind'))
      eles.push(createEle('p', ['class', `{hide: tab!=='nav'}`], 'bind'))
      // some normal style bindings
      eles.push(createEle('p', ['style', 'styleObject'], 'bind'))
      eles.push(createEle('p', ['style', `{ display: ['-webkit-box', '-ms-flexbox', 'flex'] }`], 'bind'))
      eles.push(createEle('p', ['style', `{'font-size': (Math.round(fontSize) > 12 ? Math.round(fontSize) : (fontSize - 1)) + 'px'}`], 'bind'))
      eles.push(createEle('p', ['style', '{fontSize: `${fontSize}px`}'], 'bind')) // eslint-disable-line
      eles.push(createEle('p', ['style', '[baseStyles, styleObject]'], 'bind'))
      eles.push(createEle('p', ['style', `{border: list[2].item + 'px'}`], 'bind'))
      eles.push(createEle('p', ['class', 'iconClass'], 'bind'))
      eles.push(createEle('p', ['class', '[items[0].iconClass, errorClass]'], 'bind'))
      eles.push(createEle('p', ['class', '[classObject, [items[0].iconClass]]'], 'bind'))
      eles.push(createEle('p', ['style', 'styleGroup.aStyle'], 'bind'))
      eles.push(createEle('p', ['class', 'classGroup.aClass'], 'bind'))
      let ele = createEle('p', ['style', `{fontSize: fontSize + 'px'}`], 'bind')
      ele.setAttribute('style', 'color: red;')
      eles.push(ele)

      MIP.$set({
        loading: false,
        iconClass: 'grey    lighten1 white--text',
        items: [{iconClass: 'grey    lighten1 white--text'}],
        classObject: {
          'warning-class': true,
          'active-class': false,
          'loading-class': true
        },
        loadingClass: 'm-loading',
        errorClass: 'm-error',
        classText: 'class-text',
        baseStyles: {
          color: 'red'
        },
        styleObject: {
          fontSize: '12px',
          'margin-before': '1em',
          'whatever-prop': 'default'
        },
        fontSize: 12.5,
        styleGroup: {
          aStyle: {
            fontSize: '20px'
          }
        },
        classGroup: {
          aClass: ['class-a', 'class-b']
        }
      })

      MIP.$set({
        tab: 'nav'
      })
    })

    it('should set class', async function () {
      await sleep()
      expect(eles[0].getAttribute('class')).to.equal('default-class warning-class loading-class')
      expect(eles[1].getAttribute('class')).to.equal('m-error')
      expect(eles[2].getAttribute('class')).to.equal('class-text')
      expect(eles[3].getAttribute('class')).to.equal('m-error')
      // console.log(eles[4].getAttribute('class'))
      expect(eles[4].getAttribute('class')).to.be.oneOf([null, undefined, ''])
      expect(eles[11].getAttribute('class')).to.equal('grey lighten1 white--text')
      expect(eles[12].getAttribute('class')).to.equal('grey lighten1 white--text m-error')
      expect(eles[13].getAttribute('class')).to.equal('warning-class loading-class grey lighten1 white--text')
      expect(eles[15].getAttribute('class')).to.be.equal('class-a class-b')
      expect(eles[16].getAttribute('style')).to.be.equal('color:red;font-size:12.5px;')
      MIP.setData({
        tab: 'test'
      })
      await sleep()
      expect(eles[4].getAttribute('class')).to.equal('hide')
    })

    it('should set style', function () {
      expect(eles[5].getAttribute('style')).to.equal('font-size:12px;-webkit-margin-before:1em;whatever-prop:default;')
      expect(eles[6].getAttribute('style')).to.equal('display:-webkit-box;display:-ms-flexbox;display:flex;')
      expect(eles[7].getAttribute('style')).to.equal('font-size:13px;')
      // expect(eles[8].getAttribute('style')).to.equal('font-size:12.5px;')
      expect(eles[9].getAttribute('style')).to.equal('color:red;font-size:12px;-webkit-margin-before:1em;whatever-prop:default;')
      // expect(eles[10].getAttribute('style')).to.equal('border:2px;')
    })

    it('should update class', async function () {
      MIP.setData({
        loading: true,
        classObject: {
          'active-class': true,
          'loading-class': false
        },
        classText: 'class-text-new',
        iconClass: 'nothing',
        items: [{
          iconClass: 'nothing'
        }],
        classGroup: {
          aClass: null
        }
      })
      await sleep()
      expect(eles[0].getAttribute('class')).to.equal('default-class warning-class active-class')
      expect(eles[1].getAttribute('class')).to.equal('m-error loading')
      expect(eles[2].getAttribute('class')).to.equal('class-text-new')
      expect(eles[3].getAttribute('class')).to.equal('m-error m-loading')
      expect(eles[11].getAttribute('class')).to.equal('nothing')
      expect(eles[12].getAttribute('class')).to.equal('m-error nothing')
      expect(eles[13].getAttribute('class')).to.equal('warning-class active-class nothing')
      expect(eles[15].getAttribute('class')).to.be.oneOf(['', null, undefined])
    })

    it('should update style', async function () {
      expect(eles[14].getAttribute('style')).to.be.equal('font-size:20px;')
      MIP.setData({
        styleObject: {
          fontSize: '16px',
          width: '50%'
        },
        fontSize: 12.4,
        styleGroup: 1234
      })
      await sleep()
      expect(
        eles[5].getAttribute('style')
          .split(';')
          .sort()
          .join(';')
      ).to.equal(
        'width:50%;font-size:16px;-webkit-margin-before:1em;whatever-prop:default;'
          .split(';')
          .sort()
          .join(';')
      )
      expect(eles[7].getAttribute('style')).to.equal('font-size:11.4px;')
      // expect(eles[8].getAttribute('style')).to.equal('font-size:12.4px;')
      expect(
        eles[9].getAttribute('style')
          .split(';')
          .sort()
          .join(';')
      ).to.equal(
        'width:50%;color:red;font-size:16px;-webkit-margin-before:1em;whatever-prop:default;'
          .split(';')
          .sort()
          .join(';')
      )
      expect(eles[14].getAttribute('style')).to.be.oneOf(['', null, undefined])
      expect(eles[16].getAttribute('style')).to.be.equal('color:red;font-size:12.4px;')
    })

    after(function () {
      for (let i = 0; i < eles.length; i++) {
        document.body.removeChild(eles[i])
      }
    })
  })

  describe('form element', function () {
    let eles = []

    before(function () {
      eles.push(createEle('input', ['on', 'change:MIP.setData({num:DOM.value})'], 'else'))
      eles.push(createEle('input', ['value', 'num'], 'bind'))
      eles.push(createEle('input', ['num'], 'text'))
      eles.push(createEle('input', ['notvalue', 'num'], 'bind'))
      eles.push(createEle('input', ['readonly', 'global.isGlobal'], 'bind'))

      MIP.$set({
        num: 1
      })
    })

    it('should change data with event and DOM var', function () {
      eles[0].value = 2
      let event = document.createEvent('HTMLEvents')
      event.initEvent('change', true, true)
      eles[0].dispatchEvent(event)

      expect(MIP.getData('num')).to.equal('2')
    })

    it('should change input value with m-bind', async function () {
      await sleep(100)
      expect(MIP.getData('num')).to.be.equal('2')
      expect(eles[1].value).to.be.equal('2')
      eles[1].value = 3
      let event = document.createEvent('HTMLEvents')
      event.initEvent('input', true, true)
      eles[1].dispatchEvent(event)

      expect(MIP.getData('num')).to.equal('3')
    })

    after(function () {
      for (let i = 0; i < eles.length; i++) {
        document.body.removeChild(eles[i])
      }
    })
  })

  describe('abnormal bindings', function () {
    let eles = []
    before(function () {
      eles.push(createEle('p', ['num3', ''], 'bind')) // <p m-bind:num3=""></p>
      eles.push(createEle('p', ['', 'num3'], 'bind')) // <p m-bind="num3"></p>
      eles.push(createEle('p', ['style', 'fontSize1'], 'bind')) // <p m-bind:style="fontSize1"></p>
      eles.push(createEle('p', ['style', '{}'], 'bind')) // <p m-bind:style="{}"></p>
      eles.push(createEle('p', ['class', 'fontSize1'], 'bind')) // <p m-bind:class="fontSize1"></p>
      eles.push(createEle('p', ['class', '{}'], 'bind')) // <p m-bind:class="{}"></p>

      MIP.$set({
        num3: 1,
        fontSize1: 10
      })
    })

    it('should not bind data', async function () {
      await sleep()
      expect(eles[0].getAttribute('m-bind:num3')).to.be.empty
      expect(eles[0].getAttribute('num3')).to.be.null

      // expect(eles[1].getAttribute('m-bind')).to.be.null

      expect(eles[2].getAttribute('m-bind:style')).to.equal('fontSize1')
      expect(eles[2].getAttribute('style')).to.be.null

      expect(eles[3].getAttribute('m-bind:style')).to.equal('{}')
      expect(eles[3].getAttribute('style')).to.be.null

      expect(eles[4].getAttribute('m-bind:class')).to.equal('fontSize1')
      expect(eles[4].getAttribute('class')).to.be.null

      expect(eles[5].getAttribute('m-bind:class')).to.equal('{}')
      expect(eles[5].getAttribute('class')).to.be.null
    })

    after(function () {
      for (let i = 0; i < eles.length; i++) {
        document.body.removeChild(eles[i])
      }
    })
  })

  describe('dom change event', function () {
    it('should bind text to addition dom', async function () {
      MIP.setData({
        aDomChangedText: 'Hello World'
      })
      await sleep()
      let div = document.createElement('div')
      div.setAttribute('m-text', 'aDomChangedText')
      document.body.appendChild(div)
      expect(div.innerText).to.be.oneOf(['', null, undefined])
      await sleep()
      MIP.util.customEmit(document, 'dom-change', {
        add: [div]
      })
      await sleep()
      expect(div.innerText).to.be.equal('Hello World')
      await sleep()
      MIP.setData({
        aDomChangedText: 'Hello MIP'
      })
      await sleep()
      expect(div.innerText).to.be.equal('Hello MIP')
      document.body.removeChild(div)
    })
  })

  describe('mip-data-watch', function () {
    it('should watch correctly', async function () {
      expect(MIP.getData('testChangeData')).to.be.equal(undefined)
      expect(MIP.getData('testChangeDataCopy')).to.be.equal(undefined)
      let dom = document.createElement('mip-data-watch')
      dom.setAttribute('watch', 'testChangeData')
      dom.setAttribute('on', 'change:MIP.setData({ testChangeDataCopy: event.newValue  })')
      dom.setAttribute('layout', 'nodisplay')
      document.body.appendChild(dom)
      await sleep()
      expect(MIP.getData('testChangeDataCopy')).to.be.equal(undefined)
      MIP.setData({
        testChangeData: 'Hello World'
      })
      await sleep()
      expect(MIP.getData('testChangeDataCopy')).to.be.equal('Hello World')
      expect(MIP.setData({ testChangeData: 10086 }))
      await sleep()
      expect(MIP.getData('testChangeDataCopy')).to.be.equal(10086)
    })
  })
})

function createEle (tag, props, key) {
  let ele = document.createElement(tag)
  if (key === 'bind') {
    ele.setAttribute(`m-bind${props[0] ? ':' + props[0] : ''}`, props[1])
    // console.log(ele.getAttribute(`m-bind${props[0] ? ':' + props[0] : ''}`))
  } else if (key === 'text') {
    ele.setAttribute(`m-text`, props)
  } else if (key === 'else') {
    ele.setAttribute(props[0], props[1])
  }

  if (tag === 'iframe') {
    ele.srcdoc = `
      <mip-data>
        <script type="application/json">
          {
            "#open": false,
            "username": "iframe"
          }
        </script>
      </mip-data>
      <p m-text="global.data.name"></p>
    `
    ele.classList.add('mip-page__iframe')
    ele.setAttribute('data-page-id', 'test-link')
  }
  document.body.appendChild(ele)
  return ele
}
