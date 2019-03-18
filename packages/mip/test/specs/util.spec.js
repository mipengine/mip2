/**
 * @file util spec file
 * @author sekiyika(pengxing@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* global describe, it, expect, beforeEach, afterEach, sinon */

import util, {fn} from 'src/util'

describe('util', () => {
  describe('check util static method', () => {
    [
      'fn',
      'dom',
      'event',
      'rect',
      'css',
      'hash',
      'platform',
      'parseCacheUrl',
      'makeCacheUrl',
      'getOriginalUrl',
      'EventEmitter',
      'Gesture',
      'customStorage',
      'naboo',
      'jsonParse'
    ].forEach(function (key) {
      it('.' + key, () => {
        expect(util[key]).to.be.not.undefined
      })
    })
  })

  describe('.parseCacheUrl', () => {
    it('error params', () => {
      expect(util.parseCacheUrl()).to.be.undefined
      expect(util.parseCacheUrl('')).to.equal('')
      expect(util.parseCacheUrl(null)).to.be.null
      expect(util.parseCacheUrl('', 'MIP')).to.equal('')
    })

    it('not a http or a path', () => {
      expect(util.parseCacheUrl('MIP')).to.equal('MIP')
      expect(util.parseCacheUrl('www.mipengine.org')).to.equal('www.mipengine.org')
    })

    it('not a MIP Cache url', () => {
      expect(util.parseCacheUrl('https://www.mipengine.org')).to.equal('https://www.mipengine.org')
      expect(util.parseCacheUrl('http://www.mipengine.org')).to.equal('http://www.mipengine.org')
      expect(util.parseCacheUrl('//www.mipengine.org')).to.equal('//www.mipengine.org')
    })

    it('MIP Cache http url', () => {
      expect(
        util.parseCacheUrl('//mipcache.bdstatic.com/c/')
      ).to.equal('//mipcache.bdstatic.com/c/')

      expect(
        util.parseCacheUrl('//mipcache.bdstatic.com/c/www.mipengine.org')
      ).to.equal('http://www.mipengine.org')

      expect(
        util.parseCacheUrl('/c/www.mipengine.org')
      ).to.equal('http://www.mipengine.org')

      expect(
        util.parseCacheUrl('https://mipcache.bdstatic.com/c/www.mipengine.org')
      ).to.equal('http://www.mipengine.org')

      expect(
        util.parseCacheUrl('https://mipcache.bdstatic.com/c/www.mipengine.org/static/index.html')
      ).to.equal('http://www.mipengine.org/static/index.html')

      expect(
        util.parseCacheUrl('/c/www.mipengine.org/static/index.html')
      ).to.equal('http://www.mipengine.org/static/index.html')
    })

    it('MIP Cache https url', () => {
      expect(
        util.parseCacheUrl('//mipcache.bdstatic.com/c/s/')
      ).to.equal('//mipcache.bdstatic.com/c/s/')

      expect(
        util.parseCacheUrl('//mipcache.bdstatic.com/c/s/www.mipengine.org')
      ).to.equal('https://www.mipengine.org')

      expect(
        util.parseCacheUrl('/c/s/www.mipengine.org')
      ).to.equal('https://www.mipengine.org')

      expect(
        util.parseCacheUrl('https://mipcache.bdstatic.com/c/s/www.mipengine.org')
      ).to.equal('https://www.mipengine.org')

      expect(
        util.parseCacheUrl('https://mipcache.bdstatic.com/c/s/www.mipengine.org/static/index.html')
      ).to.equal('https://www.mipengine.org/static/index.html')

      expect(
        util.parseCacheUrl('/c/s/www.mipengine.org/static/index.html')
      ).to.equal('https://www.mipengine.org/static/index.html')

      expect(
        util.parseCacheUrl('http://www-lanxiniu-com.mipcdn.com/c/s/www.lanxiniu.com/BaiduMip/mapout')
      ).to.equal('https://www.lanxiniu.com/BaiduMip/mapout')
    })
  })

  describe('.util.makeCacheUrl', () => {
    let sandbox

    // mock cache url
    beforeEach(() => {
      sandbox = sinon.createSandbox()
      sandbox.replaceGetter(fn, 'isCacheUrl', () => url => url.indexOf('localhost') !== -1)
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('not cache url', () => {
      sandbox.restore()
      sandbox.replaceGetter(fn, 'isCacheUrl', () => () => false)
      expect(util.makeCacheUrl('https://www.mipengine.com')).to.equal('https://www.mipengine.com')
    })

    it('not url', () => {
      expect(util.makeCacheUrl('www.mipengine.com')).to.equal('www.mipengine.com')
    })

    it('success url', () => {
      expect(util.makeCacheUrl('https://www.mipengine.com')).to.equal('/c/s/www.mipengine.com')
      expect(util.makeCacheUrl('http://www.mipengine.com')).to.equal('/c/www.mipengine.com')
      expect(util.makeCacheUrl('//www.mipengine.com')).to.equal('/c/s/www.mipengine.com')
    })

    it('img url', () => {
      expect(util.makeCacheUrl('https://www.mipengine.com', 'img')).to.equal('/i/s/www.mipengine.com')
      expect(util.makeCacheUrl('http://www.mipengine.com', 'img')).to.equal('/i/www.mipengine.com')
      expect(util.makeCacheUrl('//www.mipengine.com', 'img')).to.equal('/i/s/www.mipengine.com')
    })

    it('containsHost', () => {
      let url = 'http://www.mipengine.com/docs/index.html'
      let cacheUrl = util.makeCacheUrl(url, 'url', true)
      expect(cacheUrl).to.equal('http://www-mipengine-com.mipcdn.com/c/www.mipengine.com/docs/index.html')
    })

    it('parseCacheUrl https', () => {
      let url = 'https://www.mipengine.com/docs/index.html'
      let cacheUrl = util.makeCacheUrl(url)
      expect(util.parseCacheUrl(cacheUrl)).to.equal(url)
    })

    it('parseCacheUrl http', () => {
      let url = 'http://www.mipengine.com/docs/index.html'
      let cacheUrl = util.makeCacheUrl(url)
      expect(util.parseCacheUrl(cacheUrl)).to.equal(url)
    })
  })

  describe('.getOriginalUrl', () => {
    it('getOriginalUrl', () => {
      expect(
        util.getOriginalUrl('https://www.baidu.com/c/s/lavas.baidu.com/mip/guide')
      ).to.equal('https://lavas.baidu.com/mip/guide')
    })

    it('getOriginalUrl not mip url', () => {
      expect(
        util.getOriginalUrl('https://www.baidu.com/')
      ).to.equal('https://www.baidu.com/')
    })

    describe('.getOriginalUrl hash related', () => {
      let spy

      beforeEach(() => {
        spy = sinon.stub(util.hash, 'get').callsFake(function (key) {
          return key
        })
      })

      afterEach(() => {
        spy.restore()
      })

      it('getOriginalUrl with hash', () => {
        expect(
          util.getOriginalUrl('https://www.baidu.com/c/s/lavas.baidu.com/mip/guide#mipanchor=1221')
        ).to.equal('https://lavas.baidu.com/mip/guide#mipanchor')
      })
    })
  })

  it('.isCacheUrl', () => {
    expect(util.isCacheUrl('http://www-mipengine-com.mipcdn.com/c/www.mipengine.com/docs/index.html')).to.be.true
    expect(util.isCacheUrl('https://www.badiu.com/c/www.mipengine.com/docs/index.html')).to.be.false
    expect(util.isCacheUrl('//mipcache.bdstatic.com/c/')).to.be.true
    expect(util.isCacheUrl('https://c.mipcdn.com/static/v2/internal/instantService-mip-duliangheng/font/wendu-bda6817d452d4a204e4371b3c6c06715.svg')).to.be.true
    expect(util.isCacheUrl('https://yjmtpt-xx--motor-com.mipcdn.com/c/s/yjmtpt.xx-motor.com/xmdcwbaidu.com/example/mip-xmd-illegal-index.html')).to.be.true
    expect(util.isCacheUrl('http://ab.c.mipcdn.com/c/www.mipengine.com/docs/index.html')).to.be.false
  })
})

/* eslint-enable no-unused-expressions */
