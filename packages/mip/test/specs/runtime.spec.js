describe('runtime', () => {
  /**
   * @type {sinon.SinonSandbox}
   */
  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should register services', () => {
    const services = window.services
    expect(services.extensions).to.be.an('object')
    expect(services.mipdoc).to.be.an('object')
    expect(services.timer).to.be.an('object')
  })
})
