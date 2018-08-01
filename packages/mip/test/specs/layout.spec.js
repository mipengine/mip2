/**
 * @file layout.spec.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import layout from 'src/layout'
import util from 'src/util'

describe('Layout', function () {
  it('.parseLayout', function () {
    let whilelist = 'nodisplay fixed fixed-height responsive container fill flex-item'.split(' ')

    whilelist.forEach(s => expect(layout.parseLayout(s)).to.equal(s))
    expect(layout.parseLayout('unknown-type')).to.be.undefined
  })

  it('.getLayoutClass', function () {
    expect(layout.getLayoutClass('responsive')).to.equal('mip-layout-responsive')
  })

  it('.isLayoutSizeDefined', function () {
    let whilelist = 'fixed fixed-height responsive fill flex-item'.split(' ')
    let blacklist = 'nodisplay container'.split(' ')

    whilelist.forEach(s => expect(layout.isLayoutSizeDefined(s)).to.be.true)
    blacklist.forEach(s => expect(layout.isLayoutSizeDefined(s)).to.be.false)
  })

  it('.parseLength', function () {
    expect(layout.parseLength(1)).to.equal('1px')
    expect(layout.parseLength('')).to.be.undefined
    expect(layout.parseLength('1px')).to.equal('1px')

    expect(layout.parseLength(10)).to.equal('10px')
    expect(layout.parseLength('10')).to.equal('10px')
    expect(layout.parseLength('10px')).to.equal('10px')
    expect(layout.parseLength('10em')).to.equal('10em')
    expect(layout.parseLength('10vmin')).to.equal('10vmin')
    expect(layout.parseLength('10cm')).to.equal('10cm')
    expect(layout.parseLength('10mm')).to.equal('10mm')
    expect(layout.parseLength('10in')).to.equal('10in')
    expect(layout.parseLength('10pt')).to.equal('10pt')
    expect(layout.parseLength('10pc')).to.equal('10pc')
    expect(layout.parseLength('10q')).to.equal('10q')

    expect(layout.parseLength(10.1)).to.equal('10.1px')
    expect(layout.parseLength('10.2')).to.equal('10.2px')
    expect(layout.parseLength('10.1px')).to.equal('10.1px')
    expect(layout.parseLength('10.1em')).to.equal('10.1em')
    expect(layout.parseLength('10.1vmin')).to.equal('10.1vmin')

    expect(layout.parseLength(undefined)).to.equal(undefined)
    expect(layout.parseLength(null)).to.equal(undefined)
    expect(layout.parseLength('')).to.equal(undefined)
  })

  describe('.getNaturalDimensions', function () {
    it('exist', function () {
      let pix = document.createElement('mip-pix')
      let stats = document.createElement('mip-stats')
      expect(layout.getNaturalDimensions(pix)).to.be.a('object')
      expect(layout.getNaturalDimensions(stats)).to.be.a('object')
    })

    it('not exist', function () {
      let test = document.createElement('mip-test-div')
      let div = document.createElement('div')
      expect(layout.getNaturalDimensions(test)).to.be.a('object')
      expect(layout.getNaturalDimensions(div)).to.be.a('object')
    })
  })

  describe('.isLoadingAllowed', function () {
    describe('check the whitelist', function () {
      [
        'mip-anim',
        'mip-brightcove',
        'mip-embed',
        'mip-iframe',
        'mip-img',
        'mip-list',
        'mip-video'
      ].forEach(function (key) {
        it(key, function () {
          expect(layout.isLoadingAllowed(key)).to.be.true
        })
      })
    })

    it('error key', function () {
      expect(layout.isLoadingAllowed('')).to.be.false
      expect(layout.isLoadingAllowed('MIP')).to.be.false
    })
  })
  describe('.applyLayout', function () {
    it('inited', function () {
      let node = util.dom.create('<div layout="fixed"></div>')

      expect(layout.applyLayout(node)).to.equal('fixed')
      expect(layout.applyLayout(node)).to.be.undefined
    })

    it('className has mip-layout-size-defined', function () {
      let node = util.dom.create('<div layout="fixed"></div>')
      layout.applyLayout(node)

      expect(node.classList.contains('mip-layout-size-defined')).to.be.true
    })

    it('className has mip-hidden', function () {
      let node = util.dom.create('<div class="mip-hidden"></div>')
      layout.applyLayout(node)

      expect(node.classList.contains('mip-hidden')).to.be.false
    })

    describe('attr layout', function () {
      it('null', function () {
        let node = util.dom.create('<mip-img></mip-img>')
        expect(layout.applyLayout(node)).to.equal('container')
      })

      it('error auto fix', function () {
        let node = util.dom.create('<mip-img layout="MIP" width="10" height="10"></mip-img>')

        expect(layout.applyLayout(node)).to.not.equal('MIP')
        expect(node.classList.contains(layout.getLayoutClass('MIP'))).to.be.false
      })

      it('fixed', function () {
        let node = util.dom.create('<div layout="fixed"></div>')
        expect(layout.applyLayout(node)).to.equal('fixed')
      })

      it('fixed-height', function () {
        let node = util.dom.create('<div height="10px" layout="fixed-height"></div>')
        expect(layout.applyLayout(node)).to.equal('fixed-height')
        expect(node.style.height).to.equal('10px')
      })

      it('fill', function () {
        let node = util.dom.create('<div layout="fill"></div>')
        expect(layout.applyLayout(node)).to.equal('fill')
      })

      it('responsive', function () {
        let node = util.dom.create('<div layout="responsive"></div>')
        expect(layout.applyLayout(node)).to.equal('responsive')
      })

      it('container', function () {
        let node = util.dom.create('<div layout="container"></div>')
        expect(layout.applyLayout(node)).to.equal('container')
      })

      it('nodisplay', function () {
        let node = util.dom.create('<div layout="nodisplay"></div>')
        expect(layout.applyLayout(node)).to.equal('nodisplay')
        expect(node.style.display).to.equal('none')
      })

      it('flex-item', function () {
        let node = util.dom.create('<div layout="flex-item" width="10" height="10"></div>')
        expect(layout.applyLayout(node)).to.equal('flex-item')
        expect(node.style.height).to.equal('10px')
        expect(node.style.width).to.equal('10px')
      })
    })

    describe('attr', function () {
      it('width, height is null', function () {
        let node = util.dom.create('<div layout="flex-item"></div>')
        expect(layout.applyLayout(node)).to.equal('flex-item')
      })

      it('width, height is auto', function () {
        let node = util.dom.create('<div width="auto" height="auto"></div>')
        expect(layout.applyLayout(node)).to.equal('fixed-height')
      })

      it('height and width is auto', function () {
        let node = util.dom.create('<div width="auto" height="10px"></div>')
        expect(layout.applyLayout(node)).to.equal('fixed-height')
      })

      it('height', function () {
        let node = util.dom.create('<mip-img height="10px"></mip-img>')
        expect(layout.applyLayout(node)).to.equal('fixed-height')
        expect(node.style.height).to.equal('10px')
      })

      it('sizes', function () {
        let node = util.dom.create('<div width="10px" height="10px" sizes="on"><span>MIP</span></div>')
        expect(layout.applyLayout(node)).to.equal('responsive')
        expect(node.querySelector('mip-i-space')).to.not.be.null
        expect(node.firstChild).to.deep.equal(node.querySelector('mip-i-space'))
      })
    })
  })
})
