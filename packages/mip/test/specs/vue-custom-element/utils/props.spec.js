/**
 * @file vue-custom-element props spec file
 * @author huanghuiquan(huanghuiquan@baidu.com)
 */

/* globals describe, before, it, expect */

import {
  getProps,
  getPropsData,
  convertAttributeValue,
  reactiveProps
} from 'src/vue-custom-element/utils/props.js'

describe('vue-custom-element/utils/props', function () {
  describe('.getProps', function () {
    it('basic types', function () {
      expect(getProps({
        props: {
          propA: Number,
          propB: String,
          propC: {
            type: Boolean,
            required: true
          },
          propD: {
            type: Array,
            default: 100
          },
          propE: {
            type: Object,
            default: function () {
              return {
                message: 'hello'
              }
            }
          }
        }
      })).to.deep.equal({
        camelCase: ['propA', 'propB', 'propC', 'propD', 'propE'],
        hyphenate: ['prop-a', 'prop-b', 'prop-c', 'prop-d', 'prop-e'],
        types: {
          propA: Number,
          propB: String,
          propC: Boolean,
          propD: Array,
          propE: Object
        }
      })

      expect(getProps({})).to.deep.equal({
        camelCase: [],
        hyphenate: [],
        types: {}
      })
    })

    it('array types', function () {
      let props = getProps({
        props: {
          propA: [Number, String],
          propB: {
            type: [Number, String]
          }
        }
      })

      expect(props).to.deep.equal({
        camelCase: ['propA', 'propB'],
        hyphenate: ['prop-a', 'prop-b'],
        types: {
          propA: Number,
          propB: Number
        }
      })
    })

    it('not defined', function () {
      let props = getProps({
        props: {
          propA: {
            validator (val) {
              return true
            }
          },

          propB: {
            default () {
              return {}
            }
          }
        }
      })

      expect(props).to.deep.equal({
        camelCase: ['propA', 'propB'],
        hyphenate: ['prop-a', 'prop-b'],
        types: {
          propA: String,
          propB: String
        }
      })

      props = getProps({
        props: ['propA', 'propB']
      })

      expect(props).to.deep.equal({
        camelCase: ['propA', 'propB'],
        hyphenate: ['prop-a', 'prop-b'],
        types: {
          propA: String,
          propB: String
        }
      })
    })

    it('mixins', function () {
      let props = getProps({
        mixins: [{
          props: {
            propA: String,
            propB: {
              type: String
            }
          }
        },
        {
          props: {
            propC: String,
            propD: {
              type: String
            }
          }
        }
        ],
        props: {
          propA: [Number, String],
          propB: {
            type: [Number, String]
          }
        }
      })

      expect(props).to.deep.equal({
        camelCase: ['propA', 'propB', 'propC', 'propD'],
        hyphenate: ['prop-a', 'prop-b', 'prop-c', 'prop-d'],
        types: {
          propA: Number,
          propB: Number,
          propC: String,
          propD: String
        }
      })
    })

    it('extends', function () {
      let props = getProps({
        extends: {
          props: {
            propA: String,
            propB: String
          }
        },
        props: {
          propB: [Number, String],
          propC: {
            type: [Number, String]
          }
        }
      })

      expect(props).to.deep.equal({
        camelCase: ['propA', 'propB', 'propC'],
        hyphenate: ['prop-a', 'prop-b', 'prop-c'],
        types: {
          propA: String,
          propB: Number,
          propC: Number
        }
      })
    })
  })

  describe('.getPropsData', function () {
    let componenntDef
    before(function () {
      componenntDef = {
        props: {
          propA: Number,
          propB: String,
          propC: {
            type: Boolean,
            required: true
          },
          propD: {
            type: Array,
            default: 100
          },
          propE: {
            type: Object,
            default: function () {
              return {
                message: 'hello'
              }
            }
          },
          propF: String
        }
      }
    })

    it('get props data from dom', function () {
      let props = getProps(componenntDef)
      let ele = document.createElement('mip-d')
      ele.setAttribute('prop-a', '123')
      ele.setAttribute('prop-b', 'str')
      ele.setAttribute('prop-c', 'false')
      ele.setAttribute('prop-d', '[1, "2"]')
      ele.setAttribute('prop-e', '{"name": "mip"}')
      let propsData = getPropsData(ele, componenntDef, props)

      expect(propsData).to.deep.equal({
        propA: 123,
        propB: 'str',
        propC: false,
        propD: [1, '2'],
        propE: {
          name: 'mip'
        }
      })
    })

    it('get props data from script[type=application/json]', function () {
      let props = getProps(componenntDef)
      let ele = document.createElement('mip-d')
      let script = document.createElement('script')
      script.setAttribute('type', 'application/json')
      script.textContent = JSON.stringify({
        propA: 123,
        propB: 'str',
        propC: false,
        propD: [1, '2'],
        propE: {
          name: 'mip'
        }
      })
      ele.appendChild(script)

      expect(getPropsData(ele, componenntDef, props)).to.deep.equal({
        propA: 123,
        propB: 'str',
        propC: false,
        propD: [1, '2'],
        propE: {
          name: 'mip'
        }
      })

      script.textContent = false
      expect(getPropsData(ele, componenntDef, props)).to.deep.equal({})
    })

    it('attribute should overwrite script data', function () {
      let props = getProps(componenntDef)
      let ele = document.createElement('mip-d')
      let script = document.createElement('script')
      script.setAttribute('type', 'application/json')
      script.textContent = JSON.stringify({
        propA: '123',
        propB: 'str',
        propC: false,
        propD: [1, '2'],
        propE: {
          name: 'mip'
        }
      })
      ele.appendChild(script)

      ele.setAttribute('prop-b', '{a: 1}')
      ele.propF = 'property'

      expect(getPropsData(ele, componenntDef, props)).to.deep.equal({
        propA: '123', // it shouldn't convert type in script json
        propB: '{a: 1}',
        propC: false,
        propD: [1, '2'],
        propE: {
          name: 'mip'
        },
        propF: 'property'
      })
    })

    it('parse error should warn in console', function () {
      let props = getProps(componenntDef)
      let ele = document.createElement('mip-d')
      let script = document.createElement('script')
      script.setAttribute('type', 'application/json')
      script.textContent = '{error:xx}'
      ele.appendChild(script)

      let warn = sinon.stub(console, 'warn')
      let propsData = getPropsData(ele, componenntDef, props)
      warn.restore()

      sinon.assert.calledWith(warn, script, 'Content should be a valid JSON string!')

      expect(propsData).to.be.empty
    })
  })

  describe('.convertAttributeValue', function () {
    it('convert string', function () {
      expect(convertAttributeValue('str')).to.be.equal('str')
      expect(convertAttributeValue('str', String)).to.be.equal('str')
    })

    it('convert number', function () {
      expect(convertAttributeValue('123', Number)).to.be.equal(123)
      expect(convertAttributeValue('1.23', Number)).to.be.equal(1.23)
      expect(convertAttributeValue('0.23', Number)).to.be.equal(0.23)
      expect(convertAttributeValue('0.0', Number)).to.be.equal(0)
      expect(convertAttributeValue('0', Number)).to.be.equal(0)
      expect(convertAttributeValue('', Number)).to.be.NaN
      expect(convertAttributeValue('-0', Number)).to.be.equal(0)
      expect(convertAttributeValue('-1', Number)).to.be.equal(-1)
    })

    it('convert boolean', function () {
      expect(convertAttributeValue('true', Boolean)).to.be.equal(true)
      expect(convertAttributeValue('false', Boolean)).to.be.equal(false)

      expect(convertAttributeValue('', Boolean)).to.be.equal(true)
      expect(convertAttributeValue('1', Boolean)).to.be.equal(true)
      expect(convertAttributeValue('0', Boolean)).to.be.equal(true)
      expect(convertAttributeValue('NaN', Boolean)).to.be.equal(true)
      expect(convertAttributeValue('[]', Boolean)).to.be.equal(true)
    })

    it('convert array', function () {
      expect(convertAttributeValue('[123]', Array)).to.deep.equal([123])
      expect(convertAttributeValue('[true]', Array)).to.deep.equal([true])
      expect(convertAttributeValue('["huang", "test"]', Array)).to.deep.equal(['huang', 'test'])
      expect(convertAttributeValue('[]', Array)).to.deep.equal([])
    })

    it('convert object', function () {
      expect(convertAttributeValue('{"name": "mip"}', Object)).to.deep.equal({
        name: 'mip'
      })
    })

    it('error string', function () {
      let warn = sinon.stub(console, 'warn')
      let str = '{"name": -"mip"}'
      convertAttributeValue(str, Object)
      sinon.assert.calledWith(warn, str + ' attribute content should be a valid JSON string!')
    })
  })

  describe('.reactiveProps', function () {
    let element
    let customElement
    let vm

    before(function () {
      element = document.createElement('div')
      customElement = element.customElement = {}
      vm = customElement.vm = {}

      reactiveProps(element, getProps({
        props: {
          name: String,
          age: Number,
          male: Boolean,
          obj: Object,
          arr: Array,
          unset: Object
        }
      }))

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
      let props = getProps({
        props: {
          name: String,
          age: Number,
          male: Boolean,
          obj: Object,
          arr: Array,
          unset: Object
        }
      })

      reactiveProps(element, props)
      expect(element.name).to.be.undefined

      let element2 = document.createElement('div')
      element2.customElement = {}
      reactiveProps(element2, props)
      expect(element.name).to.be.undefined

      element2.name = 'unready'
      expect(element.name).to.be.undefined
    })
  })
})
