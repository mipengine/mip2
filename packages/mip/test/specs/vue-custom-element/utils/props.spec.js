/**
 * @file vue-custom-element props spec file
 * @author huanghuiquan(huanghuiquan@baidu.com)
 */

/* globals describe, before, it, expect */

import {
  getProps,
  getPropsData,
  convertAttributeValue
} from 'src/vue-custom-element/utils/props.js'

describe('props#getProps', function () {
  it('basic types', function () {
    let props = getProps(
      {
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
      }
    )

    expect(props).to.deep.equal({
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
})

describe('props#getPropsData', function () {
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
        }
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
})

describe('props#convertAttributeValue', function () {
  it('convert string', function () {
    expect(convertAttributeValue('str')).to.be.equal('str')
    expect(convertAttributeValue('str', String)).to.be.equal('str')
  })

  it('convert number', function () {
    expect(convertAttributeValue('123', Number)).to.be.equal(123)
    expect(convertAttributeValue('1.23', Number)).to.be.equal(1.23)
    expect(convertAttributeValue('0.23', Number)).to.be.equal(0.23)
  })

  it('convert boolean', function () {
    expect(convertAttributeValue('true', Boolean)).to.be.equal(true)
    expect(convertAttributeValue('false', Boolean)).to.be.equal(false)
    expect(convertAttributeValue('', Boolean)).to.be.equal(false)
    expect(convertAttributeValue('1', Boolean)).to.be.equal(true)
  })

  it('convert array', function () {
    expect(convertAttributeValue('[123]', Array)).to.deep.equal([123])
    expect(convertAttributeValue('[true]', Array)).to.deep.equal([true])
    expect(convertAttributeValue('["huang", "test"]', Array)).to.deep.equal(['huang', 'test'])
  })

  it('convert object', function () {
    expect(convertAttributeValue('{"name": "mip"}', Object)).to.deep.equal({name: 'mip'})
  })

  describe('props#reactiveProps', function () {
    it('convert string', function () {
      expect(convertAttributeValue('str')).to.be.equal('str')
      expect(convertAttributeValue('str', String)).to.be.equal('str')
    })

    it('convert number', function () {
      expect(convertAttributeValue('123', Number)).to.be.equal(123)
      expect(convertAttributeValue('1.23', Number)).to.be.equal(1.23)
      expect(convertAttributeValue('0.23', Number)).to.be.equal(0.23)
    })

    it('convert boolean', function () {
      expect(convertAttributeValue('true', Boolean)).to.be.equal(true)
      expect(convertAttributeValue('false', Boolean)).to.be.equal(false)
      expect(convertAttributeValue('', Boolean)).to.be.equal(false)
      expect(convertAttributeValue('1', Boolean)).to.be.equal(true)
    })

    it('convert array', function () {
      expect(convertAttributeValue('[123]', Array)).to.deep.equal([123])
      expect(convertAttributeValue('[true]', Array)).to.deep.equal([true])
      expect(convertAttributeValue('["huang", "test"]', Array)).to.deep.equal(['huang', 'test'])
    })

    it('convert object', function () {
      expect(convertAttributeValue('{"name": "mip"}', Object)).to.deep.equal({name: 'mip'})
    })
  })
})
