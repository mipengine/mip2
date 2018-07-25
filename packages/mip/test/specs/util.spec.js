/**
 * @file util spec file
 * @author sekiyika(pengxing@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* global describe, it, expect, beforeEach, afterEach, sinon */

import util from 'src/util'

describe('util', function () {
  describe('check util static method', function () {
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
      it('.' + key, function () {
        expect(util[key]).to.be.not.undefined
      })
    })
  })

  describe('.parseCacheUrl', function () {
    it('error params', function () {
      expect(util.parseCacheUrl()).to.be.undefined
      expect(util.parseCacheUrl('')).to.equal('')
      expect(util.parseCacheUrl(null)).to.be.null
      expect(util.parseCacheUrl('', 'MIP')).to.equal('')
    })

    it('not a http or a path', function () {
      expect(util.parseCacheUrl('MIP')).to.equal('MIP')
      expect(util.parseCacheUrl('www.mipengine.org')).to.equal('www.mipengine.org')
    })

    it('not a MIP Cache url', function () {
      expect(util.parseCacheUrl('https://www.mipengine.org')).to.equal('https://www.mipengine.org')
      expect(util.parseCacheUrl('http://www.mipengine.org')).to.equal('http://www.mipengine.org')
      expect(util.parseCacheUrl('//www.mipengine.org')).to.equal('//www.mipengine.org')
    })

    it('MIP Cache http url', function () {
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

    it('MIP Cache https url', function () {
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

  describe('.makeCacheUrl', function () {
    let spy

    // mock cache url
    beforeEach(function () {
      spy = sinon.stub(util.fn, 'isCacheUrl')
      spy.callsFake(function (url) {
        if (url.indexOf('localhost') !== -1) {
          // Makes `isCacheUrl(location.href)` return true
          return true
        } else {
          return false
        }
      })
    })

    afterEach(function () {
      if (spy && spy.restore) {
        spy.restore()
      }
    })

    it('not cache url', function () {
      spy.restore()
      spy.callsFake(function (url) {
        return false
      })
      expect(util.makeCacheUrl('https://www.mipengine.com')).to.equal('https://www.mipengine.com')
    })

    it('not url', function () {
      expect(util.makeCacheUrl('www.mipengine.com')).to.equal('www.mipengine.com')

      // is error
      // expect(util.makeCacheUrl('http.mipengine.com')).to.equal('http.mipengine.com');
    })

    // is error
    // it('error url', function () {
    //     expect(util.makeCacheUrl()).to.equal.undefined;
    // });

    it('success url', function () {
      expect(util.makeCacheUrl('https://www.mipengine.com')).to.equal('/c/s/www.mipengine.com')
      expect(util.makeCacheUrl('http://www.mipengine.com')).to.equal('/c/www.mipengine.com')
      expect(util.makeCacheUrl('//www.mipengine.com')).to.equal('/c/s/www.mipengine.com')
    })

    it('img url', function () {
      expect(util.makeCacheUrl('https://www.mipengine.com', 'img')).to.equal('/i/s/www.mipengine.com')
      expect(util.makeCacheUrl('http://www.mipengine.com', 'img')).to.equal('/i/www.mipengine.com')
      expect(util.makeCacheUrl('//www.mipengine.com', 'img')).to.equal('/i/s/www.mipengine.com')
    })

    it('containsHost', function () {
      let url = 'http://www.mipengine.com/docs/index.html'
      let cacheUrl = util.makeCacheUrl(url, 'url', true)
      expect(cacheUrl).to.equal('http://www-mipengine-com.mipcdn.com/c/www.mipengine.com/docs/index.html')
    })

    it('parseCacheUrl https', function () {
      let url = 'https://www.mipengine.com/docs/index.html'
      let cacheUrl = util.makeCacheUrl(url)
      expect(util.parseCacheUrl(cacheUrl)).to.equal(url)
    })

    it('parseCacheUrl http', function () {
      let url = 'http://www.mipengine.com/docs/index.html'
      let cacheUrl = util.makeCacheUrl(url)
      expect(util.parseCacheUrl(cacheUrl)).to.equal(url)
    })
  })

  describe('.getOriginalUrl', function () {
    it('getOriginalUrl', function () {
      expect(
        util.getOriginalUrl('https://www.baidu.com/c/s/lavas.baidu.com/mip/guide')
      ).to.equal('https://lavas.baidu.com/mip/guide')
    })

    it('getOriginalUrl not mip url', function () {
      expect(
        util.getOriginalUrl('https://www.baidu.com/')
      ).to.equal('https://www.baidu.com/')
    })

    describe('.getOriginalUrl hash related', function () {
      let spy

      beforeEach(function () {
        spy = sinon.stub(util.hash, 'get').callsFake(function (key) {
          return key
        })
      })

      afterEach(function () {
        spy.restore()
      })

      it('getOriginalUrl with hash', function () {
        expect(
          util.getOriginalUrl('https://www.baidu.com/c/s/lavas.baidu.com/mip/guide#mipanchor=1221')
        ).to.equal('https://lavas.baidu.com/mip/guide#mipanchor')
      })
    })
  })

  it('.isCacheUrl', function () {
    expect(util.isCacheUrl('http://www-mipengine-com.mipcdn.com/c/www.mipengine.com/docs/index.html')).to.be.true
    expect(util.isCacheUrl('https://www.badiu.com/c/www.mipengine.com/docs/index.html')).to.be.false
    expect(util.isCacheUrl('//mipcache.bdstatic.com/c/')).to.be.true
  })
})

/* eslint-enable no-unused-expressions */
