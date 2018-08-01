/**
 * @file create-vue-instance.spec.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import createVueInstance from 'src/vue-custom-element/utils/create-vue-instance'
import Vue from 'vue'
import {getProps} from 'src/vue-custom-element/utils/props'
import viewer from 'src/viewer'

describe('vue-custom-element/utils/create-vue-instance', function () {
  describe('.createVueInstance', function () {
    it('return vue instance', function (done) {
      let element = document.createElement('div')
      let component = {
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

      let vm = createVueInstance(element, Vue, component, getProps(component))
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
        render (createElement) {
          return createElement('div', this.$slots['slot-name'])
        }
      }

      let childNode = document.createElement('div')
      childNode.setAttribute('slot', 'slot-name')
      childNode.innerHTML = 'inner HTML'
      element.appendChild(childNode)

      createVueInstance(element, Vue, component, getProps(component))

      expect(element.innerHTML).to.be.equal('<div><div>inner HTML</div></div>')
    })

    it('event action', function () {
      let element = document.createElement('div')
      let eventListener = sinon.spy()
      let execute = sinon.stub(viewer.eventAction, 'execute')
      let addEventAction = sinon.spy()
      element.customElement = {addEventAction}
      let component = {
        render (createElement) {
          return createElement('div')
        },
        mounted () {
          this.$on('customEvent', eventListener)
          this.$emit('customEvent')
        }
      }

      element.addEventListener('customEvent', eventListener)
      createVueInstance(element, Vue, component, getProps(component))

      execute.restore()

      sinon.assert.calledTwice(eventListener)
      sinon.assert.calledOnce(addEventAction)
    })
  })
})
