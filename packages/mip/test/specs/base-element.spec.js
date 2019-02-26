import CustomElement from 'src/custom-element'
import performance from 'src/performance'
import registerElement from 'src/register-element'

describe('base-element', () => {
  /**
   * @type {sinon.SinonSandbox}
   */
  let sandbox

  const prefix = 'mip-test-base-element'
  class MIPExample extends CustomElement {
    static get observedAttributes () {
      return ['name']
    }
  }

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should call customElement lifecycles in a specific order', function () {
    let name = prefix + 'custom-element'
    let lifecycs = [
      // 'constuctor'
      'attributeChangedCallback',
      'connectedCallback',
      'build',
      'viewportCallback',
      'firstInviewCallback',
      'disconnectedCallback'
    ]

    registerElement(name, MIPExample)

    let ele = document.createElement(name)
    let lifecycSpies = lifecycs.map(cbName => sinon.spy(ele.customElement, cbName))

    ele.setAttribute('name', 'fake')

    document.body.appendChild(ele)
    ele.viewportCallback(true)
    document.body.removeChild(ele)

    lifecycSpies.forEach(spy => spy.restore())
    sinon.assert.callOrder(...lifecycSpies)
  })

  it('should contain mip-element class name', function () {
    let name = prefix + 'add-class'
    registerElement(name, MIPExample)

    let ele = document.createElement(name)

    document.body.appendChild(ele)
    document.body.removeChild(ele)

    expect(ele.classList.contains('mip-element')).to.be.true
  })

  it('should warn if lifecycle build throws an error', function (done) {
    let name = prefix + '-build-error'
    let warn = sinon.stub(console, 'warn')

    registerElement(name, class extends CustomElement {
      build () {
        throw new Error('make a build error')
      }
    })

    let ele = document.createElement(name)
    expect(ele.customElement.build).to.throw('build error')

    document.body.appendChild(ele)
    document.body.removeChild(ele)

    setTimeout(() => {
      warn.restore()
      sinon.assert.calledOnce(warn)
      delete MIPExample.prototype.build
      done()
    }, 1)
  })

  it('should add element to performance if it has resource', function () {
    let name = prefix + '-performance'

    let addFsElement = sinon.spy(performance, 'addFsElement')

    registerElement(name, class extends CustomElement {
      hasResources () {
        return true
      }
    })

    let ele = document.createElement(name)
    document.body.appendChild(ele)
    document.body.removeChild(ele)

    addFsElement.restore()

    sinon.assert.calledOnce(addFsElement)
  })

  describe('placeholder', () => {
    const name = prefix + 'placeholder'
    let ele
    registerElement(name, class extends MIPExample {
      createPlaceholderCallback () {
        let loader = document.createElement('div')
        loader.classList.add('default-placeholder')
        return loader
      }
    })

    beforeEach(() => {
      ele = document.createElement(name)
    })

    afterEach(() => {
      ele.parentElement && ele.parentElement.removeChild(ele)
    })

    it('should show default placeholder if not placeholder attribute', async () => {
      ele.setAttribute('layout', 'responsive')
      ele.setAttribute('width', '1')
      ele.setAttribute('height', '1')

      document.body.appendChild(ele)

      ele.viewportCallback(true)

      let placeholder = ele.querySelector('.default-placeholder')
      expect(placeholder).to.not.be.null
    })

    it('should show placeholder if element has placeholder attribute', async () => {
      ele.setAttribute('layout', 'responsive')
      ele.setAttribute('width', '1')
      ele.setAttribute('height', '1')

      let placeholder = document.createElement('div')
      placeholder.setAttribute('placeholder', '')
      ele.appendChild(placeholder)
      document.body.appendChild(ele)

      ele.viewportCallback(true)
      let eleRect = ele.getBoundingClientRect()
      let placeholderRect = placeholder.getBoundingClientRect()
      expect(eleRect).to.deep.equal(placeholderRect)
      expect(placeholder.classList.contains('mip-hidden')).to.be.false

      await new Promise(resolve => (ele.customElement.firstLayoutCompleted = resolve))
      expect(placeholder.classList.contains('mip-hidden')).to.be.true
      ele.customElement.togglePlaceholder(true)
      expect(placeholder.classList.contains('mip-hidden')).to.be.false
    })

    it('should ignore input placeholder if element has placeholder attribute', async () => {
      let placeholder = document.createElement('input')
      placeholder.setAttribute('placeholder', 'ddd')
      ele.appendChild(placeholder)
      document.body.appendChild(ele)

      ele.viewportCallback(true)
      let eleRect = ele.getBoundingClientRect()
      let placeholderRect = placeholder.getBoundingClientRect()
      expect(eleRect).to.not.equal(placeholderRect)
      expect(placeholder.classList.contains('mip-hidden')).to.be.false

      await new Promise(resolve => (ele.customElement.firstLayoutCompleted = resolve))
      expect(placeholder.classList.contains('mip-hidden')).to.be.false
    })

    it('should not show placeholder if self is a placeholder', async () => {
      let placeholder = document.createElement('div')
      placeholder.setAttribute('placeholder', '')
      ele.setAttribute('placeholder', '')
      ele.appendChild(placeholder)
      document.body.appendChild(ele)

      ele.viewportCallback(true)
      let eleRect = ele.getBoundingClientRect()
      let placeholderRect = placeholder.getBoundingClientRect()
      expect(eleRect).to.not.equal(placeholderRect)
      expect(placeholder.classList.contains('mip-hidden')).to.be.false

      await new Promise(resolve => (ele.customElement.firstLayoutCompleted = resolve))
      expect(placeholder.classList.contains('mip-hidden')).to.be.false
    })
  })

  describe('loading', () => {
    const name = prefix + 'loading'
    let ele
    class MIPLoadingExample extends MIPExample {
      isLoadingEnabled () {
        return true
      }
    }
    registerElement(name, MIPLoadingExample)

    beforeEach(() => {
      ele = document.createElement(name)
    })

    afterEach(() => {
      ele.parentElement && ele.parentElement.removeChild(ele)
    })

    it('should show loading if extensions enable loading', async () => {
      ele.setAttribute('layout', 'responsive')
      ele.setAttribute('width', '1')
      ele.setAttribute('height', '1')
      document.body.appendChild(ele)

      expect(ele.querySelector('.mip-loading-container')).to.be.null

      ele.viewportCallback(true)

      // show loading
      let loader = ele.querySelector('.mip-loading-container')
      expect(loader).to.be.not.null
      let eleRect = ele.getBoundingClientRect()
      let loaderRect = loader.getBoundingClientRect()
      expect(eleRect).to.not.equal(loaderRect)

      await Promise.resolve()
      expect(ele.querySelector('.mip-loading-container')).to.be.null
    })

    it('should not show loading if element implict noloading', async () => {
      ele.setAttribute('layout', 'responsive')
      ele.setAttribute('width', '1')
      ele.setAttribute('height', '1')
      ele.setAttribute('noloading', '')
      document.body.appendChild(ele)

      expect(ele.querySelector('.mip-loading-container')).to.be.null

      ele.viewportCallback(true)

      // show loading
      let loader = ele.querySelector('.mip-loading-container')
      expect(loader).to.be.null
    })
  })

  describe('fallback', () => {
    const name = prefix + 'fallback'
    let ele
    registerElement(name, MIPExample)

    beforeEach(() => {
      ele = document.createElement(name)
    })

    afterEach(() => {
      ele.parentElement && ele.parentElement.removeChild(ele)
    })

    it('should show fallback element if declare in html and load resources error', async () => {
      ele.setAttribute('layout', 'responsive')
      ele.setAttribute('width', '1')
      ele.setAttribute('height', '1')

      let fallback = document.createElement('div')
      fallback.setAttribute('fallback', '')
      ele.appendChild(fallback)
      document.body.appendChild(ele)

      await new Promise(resolve => {
        // override to make it reject
        ele.customElement.layoutCallback = function (err) {
          resolve()
          return Promise.reject(err)
        }
        ele.viewportCallback(true)
      })

      let eleRect = ele.getBoundingClientRect()
      let fallbackRect = fallback.getBoundingClientRect()
      expect(eleRect).to.deep.equal(fallbackRect)
      expect(fallback.classList.contains('mip-hidden')).to.be.false
    })
  })

  describe('applySizesAndMediaQuery', () => {
    const name = prefix + 'size-and-media-query'
    let ele
    let ww = window.innerWidth
    registerElement(name, MIPExample)

    beforeEach(() => {
      ele = document.createElement(name)
    })

    afterEach(() => {
      document.body.removeChild(ele)
    })

    it('normal sizes not match', async () => {
      ele.setAttribute('sizes', `(min-width: ${ww + 1}px) 50vw, 100vw`)
      document.body.appendChild(ele)
      expect(ele.style.width).to.equal('100vw')
    })

    it('normal sizes match', async () => {
      ele.setAttribute('sizes', `(min-width: ${ww - 1}px) 50vw, 100vw`)
      document.body.appendChild(ele)
      expect(ele.style.width).to.equal('50vw')
    })

    it('normal heights not match', async () => {
      ele.setAttribute('sizes', `(min-width: ${ww + 1}px) 50vw, 100vw`)
      document.body.appendChild(ele)
      expect(ele.style.width).to.equal('100vw')
    })

    it('normal heights match', async () => {
      ele.setAttribute('sizes', `(min-width: ${ww - 1}px) 50vw, 100vw`)
      document.body.appendChild(ele)
      expect(ele.style.width).to.equal('50vw')
    })

    it('normal media query match', async () => {
      ele.setAttribute('media', `(min-width: ${ww - 1}px)`)
      document.body.appendChild(ele)
      expect(ele.classList.contains('mip-hidden-by-media-query')).to.be.false
    })

    it('normal media query not match', async () => {
      ele.setAttribute('media', `(min-width: ${ww + 1}px)`)
      document.body.appendChild(ele)
      expect(ele.classList.contains('mip-hidden-by-media-query')).to.be.true
    })

    it('normal heights width layout=responsive', async () => {
      ele.setAttribute('layout', 'responsive')
      ele.setAttribute('width', '1px')
      ele.setAttribute('height', '1px')
      ele.setAttribute('heights', `(min-width: ${ww + 1}px) 50vw, 100vw`)
      document.body.appendChild(ele)

      expect(ele.querySelector('mip-i-space').style.paddingTop).to.equal('100vw')
    })
  })

  describe('props', () => {
    const name = 'mip-responsive-example'

    class MIPResponsiveExample extends CustomElement {
      static get observedAttributes () {
        return ['num', 'obj']
      }
    }

    const defaultObj = () => ({foo: 'bar'})
    const defaultFooItems = () => ['foo', 'bar']

    MIPResponsiveExample.props = {
      num: {
        type: Number,
        default: 1024
      },
      bool: Boolean,
      obj: {
        type: Object,
        default: defaultObj
      },
      fooItems: {
        type: Array,
        default: defaultFooItems
      }
    }

    registerElement(name, MIPResponsiveExample)

    /** @type {import('src/base-element').default} */
    let element

    /** @type {?HTMLScriptElement} */
    let script

    beforeEach(() => {
      element = document.createElement(name)
      element.customElement.attributeChangedCallback = sinon.spy()
      script = document.createElement('script')
      script.type = 'application/json'
    })

    afterEach(() => {
      if (element.parentElement) {
        element.parentElement.removeChild(element)
      }
    })

    it('should have props metadata and props', () => {
      expect(element.propTypes).to.deep.equal({
        num: Number,
        bool: Boolean,
        obj: Object,
        fooItems: Array
      })
      expect(element.defaultValues).to.deep.equal({
        num: 1024,
        obj: defaultObj,
        fooItems: defaultFooItems
      })
      expect(element.customElement.props).to.deep.equal({})
    })

    it('should resolve default values of props', () => {
      document.body.appendChild(element)
      expect(element.customElement.props).to.deep.equal({
        num: 1024,
        bool: undefined,
        obj: {foo: 'bar'},
        fooItems: ['foo', 'bar']
      })
    })

    it('should parse all attributes when the element is attached', () => {
      element.getProps = sinon.spy(element.getProps)
      script.innerHTML = '{"bool": true}'
      element.appendChild(script)
      document.body.appendChild(element)
      expect(element.getProps).to.be.calledOnce
      expect(element.customElement.props).to.deep.equal({
        num: 1024,
        bool: true,
        obj: {foo: 'bar'},
        fooItems: ['foo', 'bar']
      })
      document.body.removeChild(element)
      document.body.appendChild(element)
      expect(element.getProps).to.be.calledTwice
      expect(element.customElement.attributeChangedCallback).to.not.be.called
    })

    it('should synchronize changed attributes to props', () => {
      element.setAttribute('foo-items', '["foo", "baz"]')
      document.body.appendChild(element)
      expect(element.customElement.props.fooItems).to.deep.equal(['foo', 'baz'])
      element.setAttribute('num', '2048')
      expect(element.customElement.props.num).to.equal(2048)
      element.setAttribute('obj', '{"foo": "baz"}')
      expect(element.customElement.props.obj).to.deep.equal({foo: 'baz'})
      expect(element.customElement.attributeChangedCallback).to.be.calledTwice
    })

    it('should not synchronize attributes which are not observed', () => {
      element.setAttribute('bool', 'true')
      document.body.appendChild(element)
      expect(element.customElement.props.bool).to.be.true
      element.setAttribute('bool', 'false')
      expect(element.customElement.props.bool).to.be.true
      expect(element.customElement.attributeChangedCallback).to.not.be.called
    })
  })
})
