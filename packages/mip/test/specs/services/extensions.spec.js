import Services, {
  installMipdocService,
  installTimerService,
  installExtensionsService,
  Extensions
} from 'src/services'
import CustomElement from 'src/custom-element'
import customElement from 'src/mip1-polyfill/customElement'
import templates from 'src/util/templates'

describe('extensions', () => {
  /**
   * @type {sinon.SinonSandbox}
   */
  let sandbox

  /**
   * @type {Extensions}
   */
  let extensions

  /**
   * @type {import('src/services/timer').Timer}
   */
  let timer

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    window.services = {}
    installMipdocService(window)
    installTimerService(window)
    installExtensionsService(window)
    timer = Services.timerFor(window)
    extensions = Services.extensionsFor(window)
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should return extensions service', () => {
    expect(extensions).instanceof(Extensions)
  })

  /**
   * Recover this test case when `extension.deps` enabled.
   */
  /*
  it('should install extensions with dependencies', () => {
    const extensionIds = ['mip-a', 'mip-b', 'mip-c', 'mip-d']
    const tagNames = extensionIds
    let orders = []

    extensions.installExtension({
      name: 'mip-a',
      func: () => {
        extensions.registerElement('mip-a', {
          mounted () {
            orders.push('mip-a')
          },
          render () {
            return null
          }
        })
      },
      deps: ['mip-b', 'mip-c']
    })
    extensions.installExtension({
      name: 'mip-c',
      func: () => {
        extensions.registerElement('mip-c', {
          mounted () {
            orders.push('mip-c')
          },
          render () {
            return null
          }
        })
      },
      deps: 'mip-d'
    })
    extensions.installExtension({
      name: 'mip-d',
      func: () => {
        extensions.registerElement('mip-d', {
          mounted () {
            orders.push('mip-d')
          },
          render () {
            return null
          }
        })
      }
    })
    extensions.installExtension({
      name: 'mip-b',
      func: () => {
        extensions.registerElement('mip-b', {
          mounted () {
            orders.push('mip-b')
          },
          render () {
            return null
          }
        })
      },
      deps: 'mip-c'
    })

    tagNames.forEach(tagName => document.body.appendChild(document.createElement(tagName)))

    return Promise.all(
      extensionIds.map(extensionId => extensions.waitForExtension(extensionId))
    ).then(() => {
      expect(orders).to.deep.equal(['mip-d', 'mip-c', 'mip-b', 'mip-a'])
    })
  })
  */

  it('should call extension factory synchronously', () => {
    let factoryExecuted = false
    extensions.registerExtension('mip-ext', () => {
      expect(factoryExecuted).to.be.false
      factoryExecuted = true
    })
    expect(factoryExecuted).to.be.true
  })

  it('should save current holder in registration', () => {
    let currentHolder
    extensions.registerExtension('mip-ext', () => {
      expect(currentHolder).to.be.undefined
      currentHolder = extensions.getCurrentExtensionHolder()
    })
    const holder = extensions.extensions['mip-ext']
    expect(currentHolder).to.equal(holder)
  })

  it('should register successfully', async () => {
    extensions.registerExtension('mip-ext', (...args) => {
      expect(args[0]).to.equal(MIP)
      expect(extensions.currentExtensionId).to.equal('mip-ext')
    }, MIP)
    expect(extensions.currentExtensionId).to.be.null

    await timer.then(() => {
      const holder = extensions.extensions['mip-ext']
      expect(extensions.getExtensionHolder('mip-ext')).to.equal(holder)
      expect(holder.promise).to.be.null
      expect(holder.resolve).to.be.null
      expect(holder.reject).to.be.null
      expect(holder.loaded).to.be.true
      expect(holder.error).to.be.null
    })

    const extension = await extensions.waitForExtension('mip-ext')

    expect(extension).to.exist
    expect(extension.elements).to.exist
    expect(extension.services).to.exist
  })

  it('should register successfully with promise', async () => {
    const waiting = extensions.waitForExtension('mip-ext')
    const holder = extensions.getExtensionHolder('mip-ext')
    holder.resolve = sinon.spy(holder.resolve)
    extensions.registerExtension('mip-ext', () => {}, MIP)
    expect(extensions.currentExtensionId).to.be.null

    await timer.then(() => {
      expect(holder.promise).to.equal(waiting)
      expect(holder.resolve).to.exist
      expect(holder.reject).to.exist
      expect(holder.loaded).to.be.true
      expect(holder.error).to.be.null
      expect(holder.resolve).to.be.calledWith(holder.extension)
    })

    expect(extensions.waitForExtension('mip-ext')).to.equal(waiting)

    const extension = await waiting

    expect(extension).to.exist
    expect(extension.elements).to.exist
    expect(extension.services).to.exist
  })

  it('should fail registration', async () => {
    expect(() => extensions.registerExtension('mip-ext', () => {
      throw new Error('intentional')
    }, MIP)).to.throw(/intentional/)
    expect(extensions.currentExtensionId).to.be.null

    const holder = extensions.extensions['mip-ext']
    expect(extensions.getExtensionHolder('mip-ext')).to.equal(holder)

    await timer.then(() => {
      expect(holder.promise).to.be.null
      expect(holder.resolve).to.be.null
      expect(holder.reject).to.be.null
      expect(holder.loaded).to.be.null
      expect(holder.error).to.exist
      expect(holder.error.message).to.equal('intentional')
    })

    return extensions.waitForExtension('mip-ext').then(() => {
      throw new Error('It must have been rejected')
    }).catch((err) => {
      expect(err.message).to.equal('intentional')
    })
  })

  it('should fail registration with promise', async () => {
    const waiting = extensions.waitForExtension('mip-ext')
    expect(() => extensions.registerExtension('mip-ext', () => {
      throw new Error('intentional')
    }, MIP)).to.throw(/intentional/)
    expect(extensions.currentExtensionId).to.be.null

    const holder = extensions.extensions['mip-ext']
    expect(extensions.getExtensionHolder('mip-ext')).to.equal(holder)

    await timer.then(() => {
      expect(holder.promise).to.equal(waiting)
      expect(holder.resolve).to.exist
      expect(holder.reject).to.exist
      expect(holder.loaded).to.be.null
      expect(holder.error).to.exist
      expect(holder.error.message).to.equal('intentional')
    })

    return waiting.then(() => {
      throw new Error('It must have been rejected')
    }).catch((err) => {
      expect(err.message).to.equal('intentional')
    })
  })

  it('should register custom element in registration', async () => {
    const buildCallback = sinon.spy()
    const implementation = class MIPCustom extends CustomElement {
      build () {
        buildCallback()
      }
    }
    const css = 'mip-custom{display: block}'
    const ele = document.createElement('mip-custom')

    document.body.appendChild(ele)

    extensions.registerExtension('mip-ext', () => {
      extensions.registerElement('mip-custom', implementation, css)
    }, MIP)

    await new Promise(resolve => ele.addEventListener('build', resolve))

    expect(buildCallback).to.be.calledOnce
    document.body.removeChild(ele)

    const extension = await extensions.waitForExtension('mip-ext')

    const element = extension.elements['mip-custom']

    expect(element).to.exist
    expect(element.implementation).to.equal(implementation)
    expect(element.css).to.equal(css)
    expect(element.version).to.not.exist
  })

  it('should fail registration in build', async () => {
    const implementation = class MIPCustomError extends CustomElement {
      build () {
        throw new Error('intentional')
      }
    }
    const ele = document.createElement('mip-custom-error')

    document.body.appendChild(ele)

    extensions.registerExtension('mip-ext', () => {
      extensions.registerElement('mip-custom-error', implementation)
    })

    await new Promise(resolve => ele.addEventListener('build-error', resolve))

    document.body.removeChild(ele)

    return extensions.waitForExtension('mip-ext').then(() => {
      throw new Error('It must have been rejected')
    }).catch((err) => {
      expect(err.message).to.equal('intentional')
    })
  })

  it('should register vue custom element in registration', async () => {
    const mountedCallback = sinon.spy()
    const implementation = {
      mounted () {
        mountedCallback()
      },
      render () {
        return null
      }
    }
    const css = 'mip-vue-custom{display:block}'

    extensions.registerExtension('mip-ext', () => {
      extensions.registerElement('mip-vue-custom', implementation, css)
    }, MIP)

    const ele = document.createElement('mip-vue-custom')

    document.body.appendChild(ele)

    await new Promise(resolve => timer.delay(() => {
      expect(mountedCallback).to.be.calledOnce
      resolve()
    }))

    document.body.removeChild(ele)

    const extension = await extensions.waitForExtension('mip-ext')

    const element = extension.elements['mip-vue-custom']

    expect(element).to.exist
    expect(element.implementation).to.equal(implementation)
    expect(element.css).to.equal(css)
    expect(element.version).to.not.exist
  })

  it('should register mip1 custom element in registration', async () => {
    const attachedCallback = sinon.spy()
    const implementation = customElement.create()
    implementation.prototype.attachedCallback = attachedCallback
    const css = 'mip-legacy{display:block}'
    const ele = document.createElement('mip-legacy')

    document.body.appendChild(ele)

    extensions.registerExtension('mip-ext', () => {
      extensions.registerElement('mip-legacy', implementation, css, {version: '1'})
    })

    await new Promise(resolve => ele.addEventListener('build', resolve))

    expect(attachedCallback).to.be.calledOnce
    document.body.removeChild(ele)

    const extension = await extensions.waitForExtension('mip-ext')
    const element = extension.elements['mip-legacy']

    expect(element).to.exist
    expect(element.implementation).to.equal(implementation)
    expect(element.css).to.equal(css)
    expect(element.version).to.equal('1')
  })

  it('should register service in registration', async () => {
    const implementation = class MIPService {}

    extensions.registerExtension('mip-ext', () => {
      extensions.registerService('mip-service', implementation)
    }, MIP)

    const extension = await extensions.waitForExtension('mip-ext')
    const service = extension.services['mip-service']

    expect(service).to.exist
    expect(service.implementation).to.equal(implementation)
    expect(Services.getService(window, 'mip-service')).instanceOf(implementation)
  })

  it('should register template in registration', () => {
    const implementation = templates.inheritTemplate()
    implementation.prototype.cache = html => html
    implementation.prototype.render = (html, data) => {
      return html.replace('{{title}}', data.title)
    }
    templates.register = sinon.spy(templates.register)

    extensions.registerExtension('mip-ext', () => {
      extensions.registerTemplate('mip-template', implementation)
    }, MIP)

    expect(templates.register).to.be.calledOnce

    const ele = document.createElement('div')
    ele.innerHTML = `<template type="mip-template">{{title}}</template>`

    return templates.render(ele, {title: 'mip'}).then((res) => expect(res).to.equal('mip'))
  })
})
