/**
 * @file vue-custom-element props spec file
 * @author huanghuiquan(huanghuiquan@baidu.com)
 */

import {reactiveProps} from 'src/vue-custom-element/utils/props'

describe('vue-custom-element/utils/props', function () {
  describe('.reactiveProps', function () {
    let element
    let customElement
    let vm
    let definition = {
      props: {
        name: String,
        age: Number,
        male: Boolean,
        obj: Object,
        arr: Array,
        unset: Object
      }
    }

    before(function () {
      element = document.createElement('div')
      customElement = element.customElement = {}
      vm = customElement.vm = {}

      reactiveProps(element, Object.keys(definition.props))

      element.name = 'fakehuang'
      element.age = 1
      element.male = false
      element.obj = {
        a: 1
      }
      element.arr = [1, 2]
    })
    it('set and get prop data', function () {
      expect(vm.name).to.equal('fakehuang')
      expect(vm.age).to.equal(1)
      expect(vm.male).to.equal(false)
      expect(vm.obj).to.deep.equal({a: 1})
      expect(vm.arr).to.deep.equal([1, 2])

      expect(element.name).to.equal('fakehuang')
      expect(element.age).to.equal(1)
      expect(element.male).to.equal(false)
      expect(element.obj).to.deep.equal({
        a: 1
      })
      expect(element.arr).to.deep.equal([1, 2])
    })

    it('set and get data not in props', function () {
      expect(vm.unknown).to.be.undefined
      expect(element.unknown).to.be.undefined

      let fn = function () {}
      element.func = fn
      expect(element.func).to.equal(fn)
      expect(vm.func).to.be.undefined

      let ob = {}
      element.ob = ob
      expect(element.ob).to.equal(ob)
      expect(vm.ob).to.be.undefined
    })

    it('return undefined if vue instance didn\'t not ready', function () {
      element = document.createElement('div')

      reactiveProps(element, Object.keys(definition.props))
      expect(element.name).to.be.undefined

      let element2 = document.createElement('div')
      element2.customElement = {}
      reactiveProps(element2, Object.keys(definition.props))
      expect(element.name).to.be.undefined

      element2.name = 'unready'
      expect(element.name).to.be.undefined
    })
  })
})
