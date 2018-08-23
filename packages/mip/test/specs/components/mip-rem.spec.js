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
  // 改掉的值 window.innerWidth 还需要改回去，不然其他模块的 test case 会通不过
  describe('with no font-size when window.innerWidth = 400', function () {
    let mipRem
    let origin
    before(function () {
      origin = window.innerWidth
      window.innerWidth = 400
      mipRem = document.createElement('mip-rem')
      document.body.appendChild(mipRem)
    })
    it('should change html font-size to 100px in win2', function () {
      expect(document.documentElement.style.fontSize).to.equal('100px')
    })
    after(function () {
      window.innerWidth = origin
      document.body.removeChild(mipRem)
    })
  })
  describe('with no font-size when window.innerWidth = 200', function () {
    let mipRem
    let origin
    before(function () {
      origin = window.innerWidth
      window.innerWidth = 200
      mipRem = document.createElement('mip-rem')
      document.body.appendChild(mipRem)
    })
    it('should change html font-size to 100px in win2', function () {
      expect(document.documentElement.style.fontSize).to.equal('90px')
    })
    after(function () {
      window.innerWidth = origin
      document.body.removeChild(mipRem)
    })
  })
})
