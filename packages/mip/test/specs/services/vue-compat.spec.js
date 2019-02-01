import Services, {installVueCompatService, VueCompat} from 'src/services'

describe('vue-compat', () => {
  /**
   * @type {sinon.SinonSandbox}
   */
  let sandbox

  /**
   * @type {VueCompat}
   */
  let vueCompat

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
})
