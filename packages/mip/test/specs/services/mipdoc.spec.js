import Services, {installMipdocService, Mipdoc} from 'src/services'

import {dom} from 'src/util'

describe('mipdoc', () => {
  /**
   * @type {sinon.SinonSandbox}
   */
  let sandbox

  /**
   * @type {Mipdoc}
   */
  let mipdoc

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    window.services = null
    installMipdocService(window)
    mipdoc = Services.mipdocFor(window)
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should return mipdoc service', () => {
    expect(mipdoc).instanceOf(Mipdoc)
  })

  it('should return URL', () => {
    expect(mipdoc.getUrl()).to.equal(window.location.href)
  })

  it('should return document as root node', () => {
    expect(mipdoc.getRootNode()).to.equal(document)
  })

  it('should return head', () => {
    expect(mipdoc.getHead()).to.equal(document.head)
  })

  it('should return body', () => {
    expect(mipdoc.getBody()).to.equal(document.body)
  })

  it('should return whether the body is available', () => {
    expect(mipdoc.isBodyAvailable()).to.be.true
    expect(mipdoc.getBody()).to.equal(document.body)
    return mipdoc.whenBodyAvailable().then(() => {
      expect(mipdoc.isBodyAvailable()).to.be.true
      expect(mipdoc.getBody()).to.equal(window.document.body)
    })
  })

  it('should resolve when document.body is available', () => {
    const win = {document: {body: null}, Promise}

    let makeBodyAvailable
    sandbox.stub(dom, 'waitForBody').callsFake(() => {
      return new Promise((resolve) => {
        makeBodyAvailable = resolve
      })
    })

    installMipdocService(win)
    mipdoc = Services.mipdocFor(win)

    expect(mipdoc.isBodyAvailable()).to.be.false
    expect(mipdoc.getBody()).to.be.null

    const bodyAvailable = mipdoc.whenBodyAvailable()

    win.document.body = {nodeType: 1}
    makeBodyAvailable()

    expect(mipdoc.isBodyAvailable()).to.be.true
    expect(mipdoc.getBody()).to.equal(win.document.body)

    return bodyAvailable.then((body) => {
      expect(mipdoc.isBodyAvailable()).to.be.true
      expect(body).to.equal(win.document.body)
      expect(mipdoc.getBody()).to.equal(win.document.body)
    })
  })
})
