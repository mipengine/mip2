/**
 * @file create-vue-instance.spec.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import createVueInstance from 'src/vue-custom-element/utils/create-vue-instance'
import Services from 'src/services'
import viewer from 'src/viewer'
import Vue from 'vue'

describe('vue-custom-element/utils/create-vue-instance', function () {
  let vueCompat = Services.vueCompat()

  describe('.createVueInstance', function () {
    it('return vue instance', function (done) {
      let element = document.createElement('div')
      let component = {
        name: 'v-instance',
        props: {
          name: String
        },
        render (createElement) {
          return createElement('div', {
            domProps: {
              innerHTML: this.name
            }
          })
        }
      }

      element.setAttribute('name', 'inner HTML')
      element.customElement = {} // mock customElement
      const propTypes = vueCompat.getPropTypes(component.name, component)
      const propsData = vueCompat.getProps(element, propTypes)

      let vm = createVueInstance(element, Vue, component, Object.keys(propTypes), propsData)
      element.customElement.vm = vm

      expect(vm instanceof Vue).to.be.true
      expect(element.innerHTML).to.be.equal('<div>inner HTML</div>')

      // reactive prop
      element.name = 'haha'
      vm.$nextTick(() => {
        expect(element.innerHTML).to.be.equal('<div>haha</div>')
        done()
      })
    })

    it('slot', function () {
      let element = document.createElement('div')
      let component = {
        name: 'v-slot',
        render (createElement) {
          return createElement('div', this.$slots['slot-name'])
        }
      }

      let childNode = document.createElement('div')
      childNode.setAttribute('slot', 'slot-name')
      childNode.innerHTML = 'inner HTML'
      element.appendChild(childNode)
      const propTypes = vueCompat.getPropTypes(component.name, component)
      const propsData = vueCompat.getProps(element, propTypes)

      createVueInstance(element, Vue, component, Object.keys(propTypes), propsData)

      expect(element.innerHTML).to.be.equal('<div><div>inner HTML</div></div>')
    })

    it('event action', function () {
      let element = document.createElement('div')
      let eventListener = sinon.spy()
      let execute = sinon.stub(viewer.eventAction, 'execute')
      let addEventAction = sinon.spy()
      element.customElement = {addEventAction}
      let component = {
        name: 'v-event-action',
        mounted () {
          this.$on('customEvent', eventListener)
          this.$emit('customEvent')
        },
        render (createElement) {
          return createElement('div')
        }
      }

      element.addEventListener('customEvent', eventListener)

      const propTypes = vueCompat.getPropTypes(component.name, component)
      const propsData = vueCompat.getProps(element, propTypes)

      createVueInstance(element, Vue, component, Object.keys(propTypes), propsData)

      execute.restore()

      sinon.assert.calledTwice(eventListener)
      sinon.assert.calledOnce(addEventAction)
    })
  })
})
