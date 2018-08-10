/**
 * @file mip-bind spec file
 * @author qiusiqi(qiusiqi@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* globals describe, before, it, expect, MIP, after, sinon */

import MipData from 'src/components/mip-bind/mip-data'

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

    before(function () {
      // some normal bindings
      eleText = createEle('p', ['loc.city'], 'text')
      eleBind = createEle('p', ['data-active', 'global.isGlobal'], 'bind')
      eleObject = createEle('p', ['data', 'global.data'], 'bind')

      iframe = createEle('iframe', null)

      dumbDiv = createEle('div', null)
      dumbDiv.innerHTML = `
        <div class="inner-wrapper" disabled>
          <body>dup body</body>
          <h1 m-text=""></h1>
          <p style="color:red;;;" m-bind:style="{fontSize: fontSize + 'px'}">test:<span>1</span></p>
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
                "list": ["a", "b", {"item": 2}]
              }
            </script>
          </mip-data>
        </div>
      `

      MIP.$set({
        '#title': 'test case'
      })
    })

    it('should set data initially', function () {
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
        list: ['a', 'b', {item: 2}]
      })
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
      expect(MIP.getData('global.data.name')).to.equal('level-1')
      expect(eleText.textContent).to.equal('广州')
      expect(eleBind.getAttribute('data-active')).to.equal('true')
      expect(eleObject.getAttribute('data')).to.equal('{"name":"level-1","age":1}')
    })

    after(function () {
      document.body.removeChild(dumbDiv)
    })
  })

  describe('json format', function () {
    let mipData
    before(function () {
      mipData = new MipData()
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
      expect(mipData.build.bind(mipData)).to.throw(/Content should be a valid JSON string!/)
      expect(window.m.wrongFormatData).to.be.undefined
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

    it('should change global data correctly', function () {
      let $set = sinon.spy(MIP, '$set')

      MIP.setData({
        '#global': {
          data: {
            name: 'level-1-1'
          },
          isGlobal: false
        },
        title: 'changed'
      })

      MIP.$recompile()

      expect(window.m.global).to.eql({
        data: {
          name: 'level-1-1',
          age: 2
        },
        isGlobal: false
      })
      expect(eleBind.getAttribute('data-active')).to.equal('false')
      expect(window.m.title).to.equal('changed')
      sinon.assert.calledThrice($set)
    })

    it('should have watched the change of isGlobal and do cb', function () {
      expect(window.m.global.data.age).to.equal(2)
    })

    it.skip('should not register duplicate watcher', function () {
      MIP.setData({num2: 2})
      expect(ct).to.equal(1)
    })

    it('should change page data correctly', function () {
      MIP.setData({
        loc: {
          province: '广东',
          city: '深圳',
          year: 2018
        },
        loading: true,
        newData: 1
      })

      expect(window.m.loc).to.eql({
        province: '广东',
        city: '深圳',
        year: 2018
      })
      expect(eleText.textContent).to.equal('深圳')
    })

    it('should shift data to a different type and still trace', function () {
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
          data: 7
        }
      })
      MIP.setData({
        global: {
          data: 8
        }
      })

      expect(eleBind.getAttribute('data-active')).to.equal('{"bool":false}')
      expect(eleObject.getAttribute('data')).to.equal('8')
    })

    it('should remove attribute when value turns empty', function () {
      MIP.setData({
        global: {
          data: ''
        }
      })

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
      })).to.throw(/setData method MUST NOT accept object that contains functions/)

      expect(MIP.getData('loading')).to.be.true
    })
  })

  describe('watch', function () {
    it('should run watchers after all data was set', function () {
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
    })

    it('should run watcher after all data was set according to order', function () {
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
      expect(res).to.equal('truefalse')
    })

    it('should avoid infinit update with custom watcher', function () {
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

      MIP.$set({
        loading: false,
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
        fontSize: 12.5
      })

      MIP.$set({
        tab: 'nav'
      })
    })

    it('should set class', function () {
      expect(eles[0].getAttribute('class')).to.equal('default-class warning-class loading-class')
      expect(eles[1].getAttribute('class')).to.equal('m-error')
      expect(eles[2].getAttribute('class')).to.equal('class-text')
      expect(eles[3].getAttribute('class')).to.equal('m-error')
      expect(eles[4].getAttribute('class')).to.be.empty

      MIP.setData({
        tab: 'test'
      })
      expect(eles[4].getAttribute('class')).to.equal('hide')
    })

    it('should set style', function () {
      expect(eles[5].getAttribute('style')).to.equal('font-size:12px;-webkit-margin-before:1em;')
      expect(eles[6].getAttribute('style')).to.equal('display:flex;')
      expect(eles[7].getAttribute('style')).to.equal('font-size:13px;')
      expect(eles[8].getAttribute('style')).to.equal('font-size:12.5px;')
      expect(eles[9].getAttribute('style')).to.equal('color:red;font-size:12px;-webkit-margin-before:1em;')
      expect(eles[10].getAttribute('style')).to.equal('border:2px;')
    })

    it('should update class', function () {
      MIP.setData({
        loading: true,
        classObject: {
          'active-class': true,
          'loading-class': false
        },
        classText: 'class-text-new'
      })

      expect(eles[0].getAttribute('class')).to.equal('default-class warning-class active-class')
      expect(eles[1].getAttribute('class')).to.equal('m-error loading')
      expect(eles[2].getAttribute('class')).to.equal('class-text-new')
      expect(eles[3].getAttribute('class')).to.equal('m-error m-loading')
    })

    it('should update style', function () {
      MIP.setData({
        styleObject: {
          fontSize: '16px',
          width: '50%'
        },
        fontSize: 12.4
      })

      expect(eles[5].getAttribute('style')).to.equal('font-size:16px;-webkit-margin-before:1em;width:50%;')
      expect(eles[7].getAttribute('style')).to.equal('font-size:11.4px;')
      expect(eles[8].getAttribute('style')).to.equal('font-size:12.4px;')
      expect(eles[9].getAttribute('style')).to.equal('color:red;font-size:16px;-webkit-margin-before:1em;width:50%;')
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

    it('should change input value with m-bind', function () {
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

    it('should not bind data', function () {
      expect(eles[0].getAttribute('m-bind:num3')).to.be.empty
      expect(eles[0].getAttribute('num3')).to.be.null

      expect(eles[1].getAttribute('m-bind')).to.be.null

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
})

function createEle (tag, props, key) {
  let ele = document.createElement(tag)
  if (key === 'bind') {
    ele.setAttribute(`m-bind${props[0] ? ':' + props[0] : ''}`, props[1])
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
