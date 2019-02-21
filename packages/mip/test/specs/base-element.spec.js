import CustomElement from 'src/custom-element'
import registerElement from 'src/register-element'

describe('base-element', () => {
  const prefix = 'mip-test-base-element'
  class MIPExample extends CustomElement {
    static get observedAttributes () {
      return ['name']
    }
  }

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
      console.log('ddd')
      document.body.appendChild(ele)

      expect(ele.querySelector('mip-i-space').style.paddingTop).to.equal('100vw')
    })
  })
})
