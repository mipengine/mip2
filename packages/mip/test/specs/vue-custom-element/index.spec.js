/**
 * @file index.spec.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import Services from 'src/services'
import Vue from 'vue'

let prefix = 'vue-custom-element-index-'

describe('vue custom element', () => {
  /**
   * @type {sinon.SinonSandbox}
   */
  let sandbox

  /**
   * @type {import('src/vue-custom-element').MIPVue}
   */
  let vue

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    window.services['mip-vue'] = null
    delete require.cache[require.resolve('src/vue-custom-element')]
    require('src/vue-custom-element')
    vue = Services.getService('mip-vue')
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('install customElment to Vue', function () {
    expect(typeof Vue.customElement).to.equal('function')
  })

  it('register a custom element with vue component definition', function () {
    let name = prefix + 'regist'
    let created = sinon.spy()
    let connectedCallback = sinon.spy()
    vue.registerElement(name, {
      created,
      connectedCallback,
      render () {
        return null
      }
    })

    let ele = document.createElement(name)
    document.body.appendChild(ele)
    document.body.removeChild(ele)
    document.body.appendChild(ele)
    document.body.removeChild(ele)

    ele.viewportCallback(true)
    sinon.assert.calledOnce(created)
    sinon.assert.calledTwice(connectedCallback)
  })

  it('lifecycle', async () => {
    let name = prefix + 'lifecycle'

    let lifecycs = [
      'connectedCallback',
      'beforeCreate',
      'created',
      'beforeMount',
      'mounted',
      'viewportCallback',
      'firstInviewCallback',
      'beforeUpdate',
      'updated',
      'disconnectedCallback'
      // 'beforeDestroy',
      // 'destroyed',
    ]

    let comp = {
      prerenderAllowed () {
        return true
      },
      props: {
        str: String
      },
      data () {
        return {
          str2: ''
        }
      },
      mounted () {
        this.str2 = 'haha'
      },
      render (h) {
        return h('div', {
          domProps: {
            innerHTML: this.str + this.str2
          }
        })
      }
    }
    let lifecycSpies = lifecycs.map(name => {
      if (!comp[name]) {
        comp[name] = function () {}
      }
      return sinon.spy(comp, name)
    })

    vue.registerElement(name, comp)
    let ele = document.createElement(name)
    document.body.appendChild(ele)

    ele.setAttribute('str', 'fake')

    await Vue.nextTick()

    document.body.removeChild(ele)
    expect(ele.innerHTML).to.be.equal('<div>fakehaha</div>')
    sinon.assert.callOrder(...lifecycSpies)
  })

  it('lazy render', function () {
    let name = prefix + 'lazy-render'

    let lifecycs = [
      'connectedCallback',
      'beforeCreate',
      'created',
      'beforeMount',
      'mounted',
      'viewportCallback',
      'firstInviewCallback',
      'disconnectedCallback'
      // 'beforeDestroy',
      // 'destroyed',
    ]

    let comp = {
      props: {
        str: String
      },
      render (h) {
        return h('div', {
          domProps: {
            innerHTML: this.str
          }
        })
      }
    }
    lifecycs.map(name => {
      if (!comp[name]) {
        comp[name] = function () {}
      }
      return sinon.spy(comp, name)
    })

    vue.registerElement(name, comp)

    let ele = document.createElement(name)
    let viewportCallback = sinon.stub(ele, 'viewportCallback')
    document.body.appendChild(ele)

    document.body.removeChild(ele)
    ele.setAttribute('str', 'hah')

    sinon.assert.calledOnce(comp.connectedCallback)
    sinon.assert.calledOnce(comp.disconnectedCallback)
    sinon.assert.notCalled(comp.created)
    sinon.assert.notCalled(comp.viewportCallback)
    sinon.assert.notCalled(comp.firstInviewCallback)

    expect(ele.innerHTML).to.be.empty

    viewportCallback.restore()
    ele.viewportCallback(true)
    sinon.assert.calledOnce(comp.created)
    sinon.assert.calledOnce(comp.viewportCallback)
    sinon.assert.calledOnce(comp.firstInviewCallback)

    expect(ele.innerHTML).to.equal('<div>hah</div>')
  })

  it('prerenderAllowed', function () {
    let name = prefix + 'prerender-allowed'

    let lifecycs = [
      'connectedCallback',
      'beforeCreate',
      'created',
      'beforeMount',
      'mounted',
      'viewportCallback',
      'firstInviewCallback',
      'disconnectedCallback'
      // 'beforeDestroy',
      // 'destroyed',
    ]

    let comp = {
      prerenderAllowed () {
        return true
      },
      render () {
        return null
      }
    }
    lifecycs.map(name => {
      if (!comp[name]) {
        comp[name] = function () {}
      }
      return sinon.spy(comp, name)
    })

    vue.registerElement(name, comp)

    let ele = document.createElement(name)
    let viewportCallback = sinon.stub(ele, 'viewportCallback')
    document.body.appendChild(ele)

    document.body.removeChild(ele)
    sinon.assert.calledOnce(comp.connectedCallback)
    sinon.assert.calledOnce(comp.disconnectedCallback)
    sinon.assert.calledOnce(comp.created)
    sinon.assert.notCalled(comp.viewportCallback)
    sinon.assert.notCalled(comp.firstInviewCallback)

    viewportCallback.restore()
    ele.viewportCallback(true)

    sinon.assert.calledOnce(comp.viewportCallback)
    sinon.assert.calledOnce(comp.firstInviewCallback)
  })

  it('should camelize attribute name', () => {
    const name = prefix + 'camelize-attribute-name'

    const comp = {
      props: {
        fakeStr: String
      },
      prerenderAllowed () {
        return true
      },
      render (h) {
        return h('div', {
          domProps: {
            innerHTML: this.fakeStr
          }
        })
      }
    }

    vue.registerElement(name, comp)

    const ele = document.createElement(name)
    document.body.appendChild(ele)
    ele.viewportCallback(true)
    ele.setAttribute('fake-str', 'hah')
    expect(ele.customElement.vueInstance.fakeStr).to.equal('hah')
    expect(ele.customElement.vueInstance['fake-str']).to.be.undefined
    document.body.removeChild(ele)
  })
})
