import Services, {
  installMipdocService,
  installTimerService,
  installExtensionsService,
  Extensions
} from 'src/services'
import CustomElement from 'src/custom-element'
import customElement from 'src/mip1-polyfill/customElement'
import templates from 'src/util/templates'
import resources from 'src/resources'

function mockAsyncBuildFactory (el) {
  let add = resources.add
  return {
    stub () {
      resources.add = targetEl => targetEl !== el && add.call(resources, targetEl)
    },
    delayToRunBuild () {
      setTimeout(() => {
        el.build()
        el.viewportCallback(true)
      })
    },
    restore () {
      resources.add = add
    }
  }
}

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

    // build 改成同步
    // await new Promise(resolve => ele.addEventListener('build', resolve))

    expect(buildCallback).to.be.calledOnce
    document.body.removeChild(ele)

    const extension = await extensions.waitForExtension('mip-ext')

    const element = extension.elements['mip-custom']

    expect(element).to.exist
    expect(element.implementation).to.equal(implementation)
    expect(element.css).to.equal(css)
    expect(element.version).to.not.exist
  })

  it('should register multipe custom element in one extension', async () => {
    let name = 'multi-custom-element'
    const buildCallback1 = sinon.spy()
    const implementation1 = class MIPCustom extends CustomElement {
      build () {
        buildCallback1()
      }
    }

    const buildCallback2 = sinon.spy()
    const implementation2 = class MIPCustom extends CustomElement {
      build () {
        buildCallback2()
      }
    }

    const ele1 = document.createElement(name + '1')
    const ele2 = document.createElement(name + '2')

    document.body.appendChild(ele1)
    document.body.appendChild(ele2)

    extensions.registerExtension('mip-ext', () => {
      extensions.registerElement(name + '1', implementation1)
      extensions.registerElement(name + '2', implementation2)
    }, MIP)

    expect(buildCallback1).to.be.calledOnce
    expect(buildCallback2).to.be.calledOnce
    document.body.removeChild(ele1)
    document.body.removeChild(ele2)

    const extension = await extensions.waitForExtension('mip-ext')

    const element1 = extension.elements[name + '1']
    const element2 = extension.elements[name + '2']

    expect(element1).to.exist
    expect(element2).to.exist
    expect(element1.implementation).to.equal(implementation1)
    expect(element2.implementation).to.equal(implementation2)
    expect(element1.version).to.not.exist
  })

  it('should register multipe asynchronous custom element in one extension', async () => {
    let name = 'multi-custom-element-asynchronous'
    const buildCallback1 = sinon.spy()
    const implementation1 = class MIPCustom extends CustomElement {
      build () {
        buildCallback1()
      }
    }

    const buildCallback2 = sinon.spy()
    const implementation2 = class MIPCustom extends CustomElement {
      build () {
        buildCallback2()
      }
    }

    const ele1 = document.createElement(name + '1')
    const ele2 = document.createElement(name + '2')

    const mockAsyncBuild1 = mockAsyncBuildFactory(ele1)
    const mockAsyncBuild2 = mockAsyncBuildFactory(ele1)
    mockAsyncBuild1.stub()
    mockAsyncBuild2.stub()

    document.body.appendChild(ele1)
    document.body.appendChild(ele2)

    mockAsyncBuild1.delayToRunBuild()
    mockAsyncBuild2.delayToRunBuild()

    extensions.registerExtension('mip-ext', () => {
      extensions.registerElement(name + '1', implementation1)
      extensions.registerElement(name + '2', implementation2)
    }, MIP)

    document.body.removeChild(ele1)
    document.body.removeChild(ele2)

    const extension = await extensions.waitForExtension('mip-ext')

    expect(buildCallback1).to.be.calledOnce
    expect(buildCallback2).to.be.calledOnce

    const element1 = extension.elements[name + '1']
    const element2 = extension.elements[name + '2']

    expect(element1).to.exist
    expect(element2).to.exist
    expect(element1.implementation).to.equal(implementation1)
    expect(element2.implementation).to.equal(implementation2)
    expect(element1.version).to.not.exist
    mockAsyncBuild1.restore()
    mockAsyncBuild2.restore()
  })

  it('should register custom element with build asynchronous in registration', async () => {
    const name = 'mip-ext-asynchronous-build'
    const buildCallback = sinon.spy()
    const implementation = class MIPCustom extends CustomElement {
      build () {
        buildCallback()
      }
    }
    const css = name + '{display: block}'
    const ele = document.createElement(name)

    const mockAsyncBuild = mockAsyncBuildFactory(ele)
    mockAsyncBuild.stub()

    document.body.appendChild(ele)

    mockAsyncBuild.delayToRunBuild()

    extensions.registerExtension(name, () => {
      extensions.registerElement(name, implementation, css)
    }, MIP)

    // mock build asynchronous
    setTimeout(() => {
      ele.build()
      ele.viewportCallback(true)
    }, 100)
    await new Promise(resolve => ele.addEventListener('build', resolve))

    expect(buildCallback).to.be.calledOnce
    document.body.removeChild(ele)

    const extension = await extensions.waitForExtension(name)

    const element = extension.elements[name]

    expect(element).to.exist
    expect(element.implementation).to.equal(implementation)
    expect(element.css).to.equal(css)
    expect(element.version).to.not.exist

    // restore add func
    mockAsyncBuild.restore()
  })

  it('should fail registration in build asynchronous', async () => {
    const name = 'mip-custom-error-asynchronous'
    const implementation = class MIPCustomError extends CustomElement {
      build () {
        throw new Error('intentional')
      }
    }
    const ele = document.createElement(name)

    const mockAsyncBuild = mockAsyncBuildFactory(ele)
    mockAsyncBuild.stub()

    document.body.appendChild(ele)

    mockAsyncBuild.delayToRunBuild()

    extensions.registerExtension(name, () => {
      extensions.registerElement(name, implementation)
    })

    await new Promise(resolve => ele.addEventListener('build-error', resolve))

    document.body.removeChild(ele)

    await extensions.waitForExtension(name).then(() => {
      throw new Error('It must have been rejected')
    }).catch((err) => {
      expect(err.message).to.equal('intentional')
    })

    mockAsyncBuild.restore()
  })

  it('should fail registration in build', async () => {
    let name = 'mip-ext-synchronous-error'
    const implementation = class MIPCustomError extends CustomElement {
      build () {
        throw new Error('intentional')
      }
    }
    const ele = document.createElement(name)

    document.body.appendChild(ele)

    extensions.registerExtension(name, () => {
      extensions.registerElement(name, implementation)
    })

    // await new Promise(resolve => ele.addEventListener('build-error', resolve))

    document.body.removeChild(ele)

    await extensions.waitForExtension(name).then(() => {
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

    ele.viewportCallback(true)

    expect(mountedCallback).to.be.calledOnce

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

    // await new Promise(resolve => ele.addEventListener('build', resolve))

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
