/**
 * @file custom-element-store.spec.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import store from 'src/custom-element-store'

describe('Custom element store', function () {
  class MIP1StoreElement {}
  class MIP2StoreElement {}

  it('#get', function () {
    let name = 'mip2-store-element'
    store.set(name, MIP2StoreElement, 'mip2')

    expect(store.get(name)).to.be.equal(MIP2StoreElement)
    expect(store.get(name, 'mip2')).to.be.equal(MIP2StoreElement)
    expect(store.get('mip-unknown-element', 'mip2')).to.be.undefined
  })

  it('#set', function () {
    let name = 'mip1-store-element'

    store.set(name, MIP1StoreElement, 'mip1')

    expect(store.get(name)).to.be.equal(MIP1StoreElement)
    expect(() => store.set(name, MIP1StoreElement, 'unknown_type'))
      .to.throw('type: unknown_type must be mip1 or mip2')
  })
})
