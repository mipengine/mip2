/**
 * @file mip-rem spec file
 * @author chenyongle(chenyongle@baidu.com)
 */
describe('mip-rem', function () {
  describe('with font-size', function () {
    let mipRem
    before(function () {
      mipRem = document.createElement('mip-rem')
      mipRem.setAttribute('font-size', 100)
      document.body.appendChild(mipRem)
    })
    it('should change html font-size to 100px', function () {
      expect(document.documentElement.style.fontSize).to.equal('100px')
    })
    after(function () {
      document.body.removeChild(mipRem)
    })
  })
  describe('with no font-size', function () {
    let mipRem
    before(function () {
      mipRem = document.createElement('mip-rem')
      document.body.appendChild(mipRem)
    })
    it('should change html font-size to 100px', function () {
      expect(document.documentElement.style.fontSize).to.be.oneOf(['100px','90px'])
    })
    after(function () {
      document.body.removeChild(mipRem)
    })
  })
})
