import Services, {installMipdocService, Mipdoc} from 'src/services'

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
    installMipdocService()
    mipdoc = Services.mipdoc()
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

  it('should return whether the body is available', async () => {
    expect(mipdoc.isBodyAvailable()).to.be.true
    expect(mipdoc.getBody()).to.equal(document.body)

    await mipdoc.whenBodyAvailable()

    expect(mipdoc.isBodyAvailable()).to.be.true
    expect(mipdoc.getBody()).to.equal(window.document.body)
  })

  it('should resolve when document.body is available', async () => {
    const body = await mipdoc.whenBodyAvailable()

    expect(mipdoc.isBodyAvailable()).to.be.true
    expect(body).to.equal(document.body)
    expect(mipdoc.getBody()).to.equal(document.body)
  })
})
