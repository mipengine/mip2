/**
 * @file layout.spec.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import {applyLayout, parseLength, LAYOUT} from 'src/layout'

describe('Layout', function () {
  it('.parseLength', function () {
    expect(parseLength(1)).to.equal('1px')
    expect(parseLength('')).to.be.undefined
    expect(parseLength('1px')).to.equal('1px')

    expect(parseLength(10)).to.equal('10px')
    expect(parseLength('10')).to.equal('10px')
    expect(parseLength('10px')).to.equal('10px')
    expect(parseLength('10em')).to.equal('10em')
    expect(parseLength('10vmin')).to.equal('10vmin')
    expect(parseLength('10cm')).to.equal('10cm')
    expect(parseLength('10mm')).to.equal('10mm')
    expect(parseLength('10in')).to.equal('10in')
    expect(parseLength('10pt')).to.equal('10pt')
    expect(parseLength('10pc')).to.equal('10pc')
    expect(parseLength('10q')).to.equal('10q')

    expect(parseLength(10.1)).to.equal('10.1px')
    expect(parseLength('10.2')).to.equal('10.2px')
    expect(parseLength('10.1px')).to.equal('10.1px')
    expect(parseLength('10.1em')).to.equal('10.1em')
    expect(parseLength('10.1vmin')).to.equal('10.1vmin')

    expect(parseLength('x1n2')).to.equal(undefined)
    expect(parseLength(undefined)).to.equal(undefined)
    expect(parseLength(null)).to.equal(undefined)
    expect(parseLength('')).to.equal(undefined)
  })

  describe('.applyLayout', function () {
    let div
    beforeEach(() => {
      div = document.createElement('div')
    })

    it('layout=nodisplay', function () {
      div.setAttribute('layout', 'nodisplay')
      expect(applyLayout(div)).to.equal(LAYOUT.NODISPLAY)
      expect(div.style.width).to.equal('')
      expect(div.style.height).to.equal('')
      expect(div.style.display).to.equal('none')
      expect(div.classList.contains('mip-layout-nodisplay')).to.be.true
      expect(div.classList.contains('mip-layout-size-defined')).to.be.false
      expect(div.children.length).to.equal(0)
    })

    it('layout=fixed', () => {
      div.setAttribute('layout', 'fixed')
      div.setAttribute('width', 100)
      div.setAttribute('height', 200)
      expect(applyLayout(div)).to.equal(LAYOUT.FIXED)
      expect(div.style.width).to.equal('100px')
      expect(div.style.height).to.equal('200px')
      expect(div.classList.contains('mip-layout-fixed')).to.be.true
      expect(div.classList.contains('mip-layout-size-defined')).to.be.true
      expect(div.children.length).to.equal(0)
    })

    it('layout=fixed - default with width/height', () => {
      div.setAttribute('width', 100)
      div.setAttribute('height', 200)
      expect(applyLayout(div)).to.equal(LAYOUT.FIXED)
      expect(div.style.width).to.equal('100px')
      expect(div.style.height).to.equal('200px')
    })

    it('layout=fixed-height', () => {
      div.setAttribute('layout', 'fixed-height')
      div.setAttribute('height', 200)
      expect(applyLayout(div)).to.equal(LAYOUT.FIXED_HEIGHT)
      expect(div.style.width).to.equal('')
      expect(div.style.height).to.equal('200px')
      expect(div.classList.contains('mip-layout-fixed-height')).to.be.true
      expect(div.classList.contains('mip-layout-size-defined')).to.be.true
      expect(div.children.length).to.equal(0)
    })

    it('layout=fixed-height, with width=auto', () => {
      div.setAttribute('layout', 'fixed-height')
      div.setAttribute('height', 200)
      div.setAttribute('width', 'auto')
      expect(applyLayout(div)).to.equal(LAYOUT.FIXED_HEIGHT)
      expect(div.style.width).to.equal('')
      expect(div.style.height).to.equal('200px')
      expect(div.classList.contains('mip-layout-fixed-height')).to.be.true
      expect(div.classList.contains('mip-layout-size-defined')).to.be.true
      expect(div.children.length).to.equal(0)
    })

    it('layout=fixed-height - default with height', () => {
      div.setAttribute('height', 200)
      expect(applyLayout(div)).to.equal(LAYOUT.FIXED_HEIGHT)
      expect(div.style.height).to.equal('200px')
      expect(div.style.width).to.equal('')
    })

    it('layout=fixed-height - default with height and width=auto', () => {
      div.setAttribute('height', 200)
      div.setAttribute('width', 'auto')
      expect(applyLayout(div)).to.equal(LAYOUT.FIXED_HEIGHT)
      expect(div.style.height).to.equal('200px')
      expect(div.style.width).to.equal('')
    })

    it('layout=responsive', () => {
      div.setAttribute('layout', 'responsive')
      div.setAttribute('width', 100)
      div.setAttribute('height', 200)
      expect(applyLayout(div)).to.equal(LAYOUT.RESPONSIVE)
      expect(div.style.width).to.equal('')
      expect(div.style.height).to.equal('')
      expect(div.classList.contains('mip-layout-responsive')).to.be.true
      expect(div.classList.contains('mip-layout-size-defined')).to.be.true
      expect(div.children.length).to.equal(1)
      expect(div.children[0].tagName.toLowerCase()).to.equal('mip-i-space')
      expect(div.children[0].style.paddingTop).to.equal('200%')
    })

    it('layout=responsive - default with sizes', () => {
      div.setAttribute('sizes', '50vw')
      div.setAttribute('width', 100)
      div.setAttribute('height', 200)
      expect(applyLayout(div)).to.equal(LAYOUT.RESPONSIVE)
      expect(div.style.width).to.equal('')
      expect(div.style.height).to.equal('')
      expect(div.classList.contains('mip-layout-responsive')).to.be.true
      expect(div.classList.contains('mip-layout-size-defined')).to.be.true
      expect(div.children.length).to.equal(1)
      expect(div.children[0].tagName.toLowerCase()).to.equal('mip-i-space')
      expect(div.children[0].style.paddingTop).to.equal('200%')
    })

    it('layout=intrinsic', () => {
      div.setAttribute('layout', 'intrinsic')
      div.setAttribute('width', 100)
      div.setAttribute('height', 200)
      expect(applyLayout(div)).to.equal(LAYOUT.INTRINSIC)
      expect(div.style.width).to.equal('')
      expect(div.style.height).to.equal('')
      expect(div.classList.contains('mip-layout-intrinsic')).to.be.true
      expect(div.classList.contains('mip-layout-size-defined')).to.be.true
      expect(div.children.length).to.equal(1)
      expect(div.children[0].tagName.toLowerCase()).to.equal('mip-i-space')
      expect(div.children[0].children.length).to.equal(1)
      expect(div.children[0].children[0].tagName.toLowerCase()).to.equal('img')
      expect(div.children[0].children[0].src).to.equal('data:image/svg+xml;charset=utf-8,<svg height="200px" width="100px" xmlns="http://www.w3.org/2000/svg" version="1.1"/>')
    })

    it('layout=intrinsic - default with sizes', () => {
      div.setAttribute('layout', 'intrinsic')
      div.setAttribute('sizes', '50vw')
      div.setAttribute('width', 100)
      div.setAttribute('height', 200)
      expect(applyLayout(div)).to.equal(LAYOUT.INTRINSIC)
      expect(div.style.width).to.equal('')
      expect(div.style.height).to.equal('')
      expect(div.classList.contains('mip-layout-intrinsic')).to.be.true
      expect(div.classList.contains('mip-layout-size-defined')).to.be.true
      expect(div.children.length).to.equal(1)
      expect(div.children[0].tagName.toLowerCase()).to.equal('mip-i-space')
      expect(div.children[0].children.length).to.equal(1)
      expect(div.children[0].children[0].tagName.toLowerCase()).to.equal('img')
      expect(div.children[0].children[0].src).to.equal('data:image/svg+xml;charset=utf-8,<svg height="200px" width="100px" xmlns="http://www.w3.org/2000/svg" version="1.1"/>')
    })

    it('layout=fill', () => {
      div.setAttribute('layout', 'fill')
      expect(applyLayout(div)).to.equal(LAYOUT.FILL)
      expect(div.style.width).to.equal('')
      expect(div.style.height).to.equal('')
      expect(div.classList.contains('mip-layout-fill')).to.be.true
      expect(div.classList.contains('mip-layout-size-defined')).to.be.true
      expect(div.children.length).to.equal(0)
    })

    it('layout=container', () => {
      div.setAttribute('layout', 'container')
      expect(applyLayout(div)).to.equal(LAYOUT.CONTAINER)
      expect(div.style.width).to.equal('')
      expect(div.style.height).to.equal('')
      expect(div.classList.contains('mip-layout-container')).to.be.true
      expect(div.classList.contains('mip-layout-size-defined')).to.be.false
      expect(div.children.length).to.equal(0)
    })

    it('layout=flex-item', () => {
      div.setAttribute('layout', 'flex-item')
      div.setAttribute('width', 100)
      div.setAttribute('height', 200)
      expect(applyLayout(div)).to.equal(LAYOUT.FLEX_ITEM)
      expect(div.style.width).to.equal('100px')
      expect(div.style.height).to.equal('200px')
      expect(div.classList.contains('mip-layout-flex-item')).to.be.true
      expect(div.classList.contains('mip-layout-size-defined')).to.be.true
      expect(div.children.length).to.equal(0)
    })

    it('layout=unknown', () => {
      div.setAttribute('layout', 'foo')
      expect(applyLayout(div)).to.equal(LAYOUT.CONTAINER)
      expect(div.style.width).to.equal('')
      expect(div.style.height).to.equal('')
      expect(div.classList.contains('mip-layout-container')).to.be.true
      expect(div.classList.contains('mip-layout-size-defined')).to.be.false
      expect(div.children.length).to.equal(0)
    })

    it('layout default', () => {
      div.setAttribute('layout', 'foo')
      expect(applyLayout(div)).to.equal(LAYOUT.CONTAINER)
      expect(div.style.width).to.equal('')
      expect(div.style.height).to.equal('')
      expect(div.classList.contains('mip-layout-container')).to.be.true
      expect(div.classList.contains('mip-layout-size-defined')).to.be.false
      expect(div.children.length).to.equal(0)
    })

    it('should configure natural dimensions; default layout', () => {
      let pix = document.createElement('mip-pix')
      expect(applyLayout(pix)).to.equal(LAYOUT.FIXED)
      expect(pix.style.width).to.equal('1px')
      expect(pix.style.height).to.equal('1px')

      let audio = document.createElement('mip-audio')
      expect(applyLayout(audio)).to.equal(LAYOUT.FIXED)

      // expect(audio.style.width).to.equal('1px')
      // expect(audio.style.height).to.equal('1px')
    })

    it('className has mip-hidden', function () {
      div.classList.add('mip-hidden')
      applyLayout(div)
      expect(div.classList.contains('mip-hidden')).to.be.false
    })
  })
})
