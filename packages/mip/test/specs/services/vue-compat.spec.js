import Services, {installVueCompatService, VueCompat} from 'src/services'

import CustomElement from 'src/custom-element'

describe('vue-compat', () => {
  /**
   * @type {sinon.SinonSandbox}
   */
  let sandbox

  /**
   * @type {VueCompat}
   */
  let vueCompat

  const defaultObj = () => ({foo: 'bar'})
  const mixedPropType = val => val && Number.isInteger(+val) ? Number : String
  const propTypes = {
    str: {
      type: String
    },
    num: Number,
    bool: {
      type: Boolean,
      default: true
    },
    date: Date,
    arr: Array,
    obj: {
      type: Object,
      default: defaultObj
    },
    func: Function,
    mixed: {
      type: mixedPropType,
      default: 0
    }
  }

  class MIPCustom extends CustomElement {}
  MIPCustom.props = propTypes

  const MIPBaseVueCustom = {
    name: 'mip-base-vue-custom',
    props: {
      fooBar: {
        type: Number
      },
      fooBaz: Boolean
    }
  }

  const MIPMixinFooVueCustom = {
    name: 'mip-mixin-foo-vue-custom',
    props: {
      foo: [Number, String],
      fooBar: Object
    }
  }

  const MIPMixinBarVueCustom = {
    name: 'mip-mixin-bar-vue-custom',
    props: ['bar', 'baz']
  }

  const MIPVueCustom = {
    name: 'mip-vue-custom',
    extends: MIPBaseVueCustom,
    mixins: [MIPMixinFooVueCustom, MIPMixinBarVueCustom],
    props: {
      ...propTypes,
      mixed: Object
    }
  }

  class MIPInvalidCustom extends CustomElement {}
  MIPInvalidCustom.props = {
    nil: null,
    invalid: 'foo'
  }

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    window.services['vue-compat'] = null
    installVueCompatService()
    vueCompat = Services.vueCompat()
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should return vue-compat service', () => {
    expect(vueCompat).instanceOf(VueCompat)
  })

  describe('getPropTypes', () => {
    it('should return an empty object if name or definition is not present', () => {
      expect(vueCompat.getPropTypes()).to.deep.equal({})
      expect(vueCompat.getPropTypes('', MIPCustom)).to.deep.equal({})
      expect(vueCompat.getPropTypes('mip-empty')).to.deep.equal({})
    })

    it('should return custom element prop types', () => {
      expect(vueCompat.getPropTypes('mip-custom', MIPCustom)).to.deep.equal({
        str: String,
        num: Number,
        bool: Boolean,
        date: Date,
        arr: Array,
        obj: Object,
        func: Function,
        mixed: mixedPropType
      })
    })

    it('should return vue custom element prop types', () => {
      expect(vueCompat.getPropTypes('mip-vue-custom', MIPVueCustom)).to.deep.equal({
        fooBar: Object,
        fooBaz: Boolean,
        foo: Number,
        bar: String,
        baz: String,
        str: String,
        num: Number,
        bool: Boolean,
        date: Date,
        arr: Array,
        obj: Object,
        func: Function,
        mixed: Object
      })
    })

    it('should resolve invalid prop types as string', () => {
      expect(vueCompat.getPropTypes('mip-invalid-custom', MIPInvalidCustom)).to.deep.equal({
        nil: String,
        invalid: String
      })
    })

    it('should cache prop types for the same elements', () => {
      expect(vueCompat.getPropTypes('mip-custom', MIPCustom))
        .to.equal(vueCompat.getPropTypes('mip-custom', MIPCustom))
      expect(vueCompat.getPropTypes('mip-vue-custom', MIPVueCustom))
        .to.equal(vueCompat.getPropTypes('mip-vue-custom', MIPVueCustom))
    })
  })

  describe('getDefaultValues', () => {
    it('should return an empty object if name or definition is not present', () => {
      expect(vueCompat.getDefaultProps()).to.deep.equal({})
      expect(vueCompat.getDefaultProps('', MIPCustom)).to.deep.equal({})
      expect(vueCompat.getDefaultProps('mip-empty')).to.deep.equal({})
    })

    it('should return custom element default values', () => {
      expect(vueCompat.getDefaultProps('mip-custom', MIPCustom)).to.deep.equal({
        bool: true,
        obj: defaultObj,
        mixed: 0
      })
    })

    it('should cache default values for the same elements', () => {
      expect(vueCompat.getDefaultProps('mip-custom', MIPCustom))
        .to.equal(vueCompat.getDefaultProps('mip-custom', MIPCustom))
    })
  })

  describe('parseAttribute', () => {
    it('should return undefined when attribute is not present', () => {
      expect(vueCompat.parseAttribute()).to.be.undefined
      expect(vueCompat.parseAttribute(null)).to.be.undefined
      expect(vueCompat.parseAttribute(null, String)).to.be.undefined
      expect(vueCompat.parseAttribute(null, Number)).to.be.undefined
      expect(vueCompat.parseAttribute(null, Boolean)).to.be.undefined
      expect(vueCompat.parseAttribute(null, Array)).to.be.undefined
      expect(vueCompat.parseAttribute(null, Object)).to.be.undefined
    })

    it('should parse strings', () => {
      expect(vueCompat.parseAttribute('foo')).to.equal('foo')
      expect(vueCompat.parseAttribute('foo', String)).to.equal('foo')
      expect(vueCompat.parseAttribute('undefined', String)).to.equal('undefined')
      expect(vueCompat.parseAttribute('null', String)).to.equal('null')
    })

    it('should parse numbers', () => {
      expect(vueCompat.parseAttribute('123', Number)).to.equal(123)
      expect(vueCompat.parseAttribute('1.23', Number)).to.equal(1.23)
      expect(vueCompat.parseAttribute('0.23', Number)).to.equal(0.23)
      expect(vueCompat.parseAttribute('0.0', Number)).to.equal(0)
      expect(vueCompat.parseAttribute('0', Number)).to.equal(0)
      expect(vueCompat.parseAttribute('-0', Number)).to.equal(0)
      expect(vueCompat.parseAttribute('-1', Number)).to.equal(-1)
      expect(vueCompat.parseAttribute('1.024e3', Number)).to.equal(1024)
      expect(vueCompat.parseAttribute('', Number)).to.be.NaN
      expect(vueCompat.parseAttribute('NaN', Number)).to.be.NaN
      expect(vueCompat.parseAttribute('Infinity', Number)).to.equal(Infinity)
      expect(vueCompat.parseAttribute('-Infinity', Number)).to.equal(-Infinity)
      expect(vueCompat.parseAttribute('undefined', Number)).to.be.NaN
      expect(vueCompat.parseAttribute('null', Number)).to.be.NaN
    })

    it('should parse boolean values', () => {
      expect(vueCompat.parseAttribute('true', Boolean)).to.be.true
      expect(vueCompat.parseAttribute('false', Boolean)).to.be.false
      expect(vueCompat.parseAttribute('', Boolean)).to.be.true
      expect(vueCompat.parseAttribute('1', Boolean)).to.be.true
      expect(vueCompat.parseAttribute('0', Boolean)).to.be.true
      expect(vueCompat.parseAttribute('NaN', Boolean)).to.be.true
      expect(vueCompat.parseAttribute('[]', Boolean)).to.be.true
      expect(vueCompat.parseAttribute('{}', Boolean)).to.be.true
      expect(vueCompat.parseAttribute('undefined', Boolean)).to.be.true
      expect(vueCompat.parseAttribute('null', Boolean)).to.be.true
    })

    it('should parse arrays', () => {
      expect(vueCompat.parseAttribute('[]', Array)).to.deep.equal([])
      expect(vueCompat.parseAttribute('["foo", "bar"]', Array)).to.deep.equal(['foo', 'bar'])
      expect(vueCompat.parseAttribute('[1, 2]', Array)).to.deep.equal([1, 2])
      expect(vueCompat.parseAttribute('[true, false]', Array)).to.deep.equal([true, false])
      expect(vueCompat.parseAttribute('[[1], [2]]', Array)).to.deep.equal([[1], [2]])
      expect(vueCompat.parseAttribute('[{"foo": "bar"}, {"foo": "baz"}]', Array)).to.deep.equal([{foo: 'bar'}, {foo: 'baz'}])
      expect(vueCompat.parseAttribute('undefined', Array)).to.be.undefined
      expect(vueCompat.parseAttribute('null', Array)).to.be.null
    })

    it('should parse plain objects', () => {
      expect(vueCompat.parseAttribute('{}', Object)).to.deep.equal({})
      expect(vueCompat.parseAttribute('{"foo": "bar"}', Object)).to.deep.equal({foo: 'bar'})
      expect(vueCompat.parseAttribute('{"foo": 1}', Object)).to.deep.equal({foo: 1})
      expect(vueCompat.parseAttribute('{"foo": true}', Object)).to.deep.equal({foo: true})
      expect(vueCompat.parseAttribute('{"foo": ["bar", "baz"]}', Object)).to.deep.equal({foo: ['bar', 'baz']})
      expect(vueCompat.parseAttribute('{"foo": {"bar": "baz"}}', Object)).to.deep.equal({foo: {bar: 'baz'}})
      expect(vueCompat.parseAttribute('undefined', Object)).to.be.undefined
      expect(vueCompat.parseAttribute('null', Object)).to.be.null
    })

    it('should parse values based on prop type functions', () => {
      expect(vueCompat.parseAttribute('1', mixedPropType)).to.equal(1)
      expect(vueCompat.parseAttribute('1.024e3', mixedPropType)).to.equal(1024)
      expect(vueCompat.parseAttribute('foo', mixedPropType)).to.equal('foo')
      expect(vueCompat.parseAttribute('NaN', mixedPropType)).to.equal('NaN')
      expect(vueCompat.parseAttribute('', mixedPropType)).to.equal('')
    })

    it('should not parse functions or dates', () => {
      expect(vueCompat.parseAttribute('() => {}', Function)).to.equal('() => {}')
      expect(vueCompat.parseAttribute('function () {}', Function)).to.equal('function () {}')
      expect(vueCompat.parseAttribute('2019-01-01T00:00:00', Date)).to.equal('2019-01-01T00:00:00')
      expect(vueCompat.parseAttribute('January 01, 2019 00:00:00', Date)).to.equal('January 01, 2019 00:00:00')
    })
  })

  describe('getProps', () => {
    /** @type {?HTMLElement} */
    let element

    /** @type {?HTMLScriptElement} */
    let script

    let propTypes

    before(() => {
      script = document.createElement('script')
      script.setAttribute('type', 'application/json')

      propTypes = vueCompat.getPropTypes('mip-custom', MIPCustom)
    })

    beforeEach(() => {
      element = document.createElement('mip-custom')
    })

    it('should return an empty object without attributes and JSON', () => {
      expect(vueCompat.getProps(element, {})).to.deep.equal({})
    })

    it('should return props from attributes based on prop types', () => {
      element.setAttribute('bool', '')
      element.setAttribute('foo', 'bar')

      expect(vueCompat.getProps(element, propTypes)).to.deep.equal({
        str: undefined,
        num: undefined,
        bool: true,
        date: undefined,
        arr: undefined,
        obj: undefined,
        func: undefined,
        mixed: undefined
      })
    })

    it('should return all props from JSON', () => {
      script.innerHTML = JSON.stringify({foo: {bar: 'baz'}})
      element.appendChild(script)

      expect(vueCompat.getProps(element, propTypes)).to.deep.equal({
        str: undefined,
        num: undefined,
        bool: undefined,
        date: undefined,
        arr: undefined,
        obj: undefined,
        func: undefined,
        mixed: undefined,
        foo: {bar: 'baz'}
      })
    })

    it('should return props merged from attributes and JSON', () => {
      script.innerHTML = JSON.stringify({num: 'Infinity', bool: true, obj: {foo: 'baz'}, mixed: 1})
      element.appendChild(script)

      element.setAttribute('str', 'foo')
      element.setAttribute('num', '-1')
      element.setAttribute('bool', 'false')
      element.setAttribute('date', '2019-01-01')
      element.setAttribute('arr', '["foo", "bar"]')
      element.setAttribute('obj', '{"foo": "bar"}')
      element.setAttribute('func', '() => {}')
      element.setAttribute('mixed', 'foo')

      expect(vueCompat.getProps(element, propTypes)).to.deep.equal({
        str: 'foo',
        num: Infinity,
        bool: true,
        date: '2019-01-01',
        arr: ['foo', 'bar'],
        obj: {foo: 'baz'},
        func: '() => {}',
        mixed: 1
      })
    })
  })
})
