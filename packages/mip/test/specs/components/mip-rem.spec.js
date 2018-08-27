/**
 * @file mip-rem spec file
 * @author chenyongle(chenyongle@baidu.com)
 */
describe('mip-rem', function () {
  describe('with correct font-size', function () {
    let mipRem
    let origin
    before(function () {
      origin = window.innerWidth
      window.innerWidth = 400
      mipRem = document.createElement('mip-rem')
      mipRem.setAttribute('font-size', '[{"maxWidth": 360, "size": 80}, {"minWidth": 361, "maxWidth": 720, "size": 90}, {"minWidth": 721, "size": 100}]')
      document.body.appendChild(mipRem)
    })
    it('should change html font-size to 90px', function () {
      expect(document.documentElement.style.fontSize).to.equal('90px')
    })
    after(function () {
      window.innerWidth = origin
      document.body.removeChild(mipRem)
    })
  })
  describe('with incorrect font-size', function () {
    let mipRem
    let origin
    before(function () {
      origin = window.innerWidth
      window.innerWidth = 200
      mipRem = document.createElement('mip-rem')
      // test case 类型为 font-size 属性值格式错误
      mipRem.setAttribute('font-size', '[{"maxWidth": 360; "size": 80}]')
      document.body.appendChild(mipRem)
    })
    it('should change html font-size to 90px', function () {
      expect(document.documentElement.style.fontSize).to.equal('90px')
    })
    after(function () {
      window.innerWidth = origin
      document.body.removeChild(mipRem)
    })
  })
  describe('with incorrect font-size where field size disappears', function () {
    let mipRem
    let origin
    before(function () {
      origin = window.innerWidth
      window.innerWidth = 200
      mipRem = document.createElement('mip-rem')
      // test case 类型为 font-size 属性值中size字段错误
      mipRem.setAttribute('font-size', '[{"maxWidth": 360, "asize": 80}]')
      document.body.appendChild(mipRem)
    })
    // size字段错误触发容错后的默认值100
    it('should change html font-size to 100px', function () {
      expect(document.documentElement.style.fontSize).to.equal('100px')
    })
    after(function () {
      window.innerWidth = origin
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
