/**
 * @file mip-img spec file
 * @author qiusiqi(qiusiqi@baidu.com)
 */

import dom from 'src/util/dom/dom'
import {event} from 'src/util'

import regeneratorRuntime from 'regenerator-runtime'

/* eslint-disable no-unused-expressions */
/* globals describe, before, it, expect, after, Event */


function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function() {
    var self = this,
        args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}

function main() {
  return _main.apply(this, arguments);
}

function _main() {
  _main = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    var arr, fn, _fn;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _fn = function _ref2() {
              _fn = _asyncToGenerator(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee() {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return new Promise(function (resolve, reject) {
                          arr.push(function () {
                            console.log('a');
                            reject();
                          });
                        });

                      case 3:
                        _context.next = 8;
                        break;

                      case 5:
                        _context.prev = 5;
                        _context.t0 = _context["catch"](0);
                        console.log('c');

                      case 8:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee, null, [[0, 5]]);
              }));
              return _fn.apply(this, arguments);
            };

            fn = function _ref() {
              return _fn.apply(this, arguments);
            };

            arr = [];
            fn();
            _context2.next = 6;
            return new Promise(function (resolve) {
              arr.push(function () {
                console.log('b');
                resolve();
              });
              arr.forEach(function (item) {
                return item();
              });
            });

          case 6:
            console.log('d');

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _main.apply(this, arguments);
}

describe('mip-img', function () {
  let mipImgWrapper

  beforeEach(() => {
    mipImgWrapper = document.createElement('div')
    mipImgWrapper.style.width = '100px'
    mipImgWrapper.style.height = '100px'
    document.body.appendChild(mipImgWrapper)
  })

  afterEach(function () {
    document.body.removeChild(mipImgWrapper)
  })

  after(() => {
    // Clear popup wrap
    let popup = document.querySelector('.mip-img-popUp-wrapper')
    if (popup) {
      popup.parentElement.removeChild(popup)
    }
  })

  it('should be loading with default placeholder if not define a size', async () => {
    let mipImg = dom.create('<mip-img src="https://www.mipengine.org/static/img/sample_01.jpg"></mip-img>')
    mipImgWrapper.appendChild(mipImg)
    document.body.appendChild(mipImgWrapper)
    mipImg.viewportCallback(true)
    expect(mipImg.querySelectorAll('.mip-default-placeholder').length).to.be.equal(1)
  })

  it('should be loading with placeholder', function () {
    let mipImg = dom.create('<mip-img popup src="https://www.wrong.org?mip_img_ori=1"></mip-img>')
    mipImgWrapper.appendChild(mipImg)
    document.body.appendChild(mipImgWrapper)
    mipImg.viewportCallback(true)

    let img = mipImg.querySelector('img')

    // ask to popup before loaded
    let event = document.createEvent('MouseEvents')
    event.initEvent('click', true, true)
    img.dispatchEvent(event)

    // expect popup to be created
    let mipPopWrap = document.querySelector('.mip-img-popUp-wrapper')

    expect(mipPopWrap.getAttribute('data-name')).to.equal('mip-img-popUp-name')
    expect(mipPopWrap.parentNode.tagName).to.equal('BODY')
    expect(mipPopWrap.tagName).to.equal('DIV')
    expect(mipPopWrap.querySelector('.mip-img-popUp-bg')).to.be.exist
    expect(mipPopWrap.querySelector('mip-carousel')).to.be.exist

    // img
    expect(img.classList.contains('mip-replaced-content')).to.equal(true)
    expect(img.getAttribute('src')).to.equal('https://www.wrong.org?mip_img_ori=1')

    img.addEventListener('error', () => {
      expect(img.src).to.equal('https://www.wrong.org/?mip_img_ori=1')
    }, false)
    let errEvent = new Event('error')
    img.dispatchEvent(errEvent)
  })

  it('should replace src if load img error', async () => {
    console.log('in should replace src if load img error case')
    mipImgWrapper.innerHTML = `<mip-img popup src="https://www.wrong.org?test=1"></mip-img>`
    let mipImg = mipImgWrapper.querySelector('mip-img')
    mipImg.viewportCallback(true)

    let img = mipImg.querySelector('img')

    expect(img.classList.contains('mip-replaced-content')).to.equal(true)
    expect(img.getAttribute('src')).to.equal('https://www.wrong.org?test=1')
    console.log('spec start promise')
    await new Promise(resolve => {
      let errEvent = new Event('error')
      window.__TEST_ERR_EVENT__ = errEvent
      img.addEventListener('error', function (e) {
        console.error('spec error callback')
        console.log(e === errEvent)
        resolve(e)
        console.log('spec error resolve is called')
      })
      img.dispatchEvent(errEvent)
    })
    console.log('spec end promise')
    expect(img.src).to.equal('https://www.wrong.org/?test=1&mip_img_ori=1')
  })

  it('should has not error', main)

  // it('should has not error', async function () {
  //   let arr = []
  //   let count = 0

  //   async function fn() {
  //     try {
  //       await new Promise((resolve, reject) => {
  //         arr.push(function () {
  //           count++
  //           expect(count).to.be.equal(1)
  //           reject()
  //         })
  //       })
  //     }
  //     catch (e) {
  //       count++
  //       expect(count).to.be.equal(3)
  //     }
  //   }

  //   fn()

  //   await new Promise(resolve => {
  //     arr.push(function () {
  //       count++
  //       expect(count).to.be.equal(2)
  //       resolve()
  //     })

  //     arr.forEach(item => item())
  //   })

  //   count++
  //   expect(count).to.be.equal(4)
  // })

  it('should work with srcset', function () {
    mipImgWrapper.innerHTML = `
      <mip-img srcset="https://www.mipengine.org/static/img/wrong_address1.jpg 1x,
        https://www.mipengine.org/static/img/swrong_address2.jpg 2x,
        https://www.mipengine.org/static/img/wrong_address3.jpg 3x">
      </mip-img>
    `
    let mipImg = mipImgWrapper.querySelector('mip-img')

    mipImg.viewportCallback(true)
    let img = mipImg.querySelector('img')
    expect(img.getAttribute('src')).to.be.null
    expect(img.classList.contains('mip-replaced-content')).to.equal(true)
  })

  it('should build without src', function () {
    mipImgWrapper.innerHTML = `<mip-img></mip-img>`
    let mipImg = mipImgWrapper.querySelector('mip-img')

    mipImg.viewportCallback(true)
    let img = mipImg.querySelector('img')
    expect(img.classList.contains('mip-replaced-content')).to.equal(true)
    expect(img.getAttribute('src')).to.be.null
  })

  it('should load img with normal src', function () {
    mipImgWrapper.innerHTML = `
      <mip-img src="https://www.mipengine.org/static/img/sample_01.jpg"></mip-img>
    `
    let mipImg = mipImgWrapper.querySelector('mip-img')
    let loading = new Promise(resolve => event.listen(mipImg, 'load', resolve))
    mipImg.viewportCallback(true)
    let img = mipImg.querySelector('img')
    expect(img.classList.contains('mip-replaced-content')).to.equal(true)
    expect(img.getAttribute('src')).to.equal('https://www.mipengine.org/static/img/sample_01.jpg')
    return loading
  })

  it('should change src and reload img', function () {
    let mipImg = document.createElement('mip-img')
    mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_01.jpg')
    mipImg.setAttribute('width', '100px')
    mipImg.setAttribute('height', '100px')
    mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_02.jpg')

    mipImg.viewportCallback(true)
    let img = mipImg.querySelector('img')
    expect(img.getAttribute('src')).to.equal('https://www.mipengine.org/static/img/sample_02.jpg')
    mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_03.jpg')
    expect(img.getAttribute('src')).to.equal('https://www.mipengine.org/static/img/sample_03.jpg')
  })

  it('should produce img but not call connectedCallback again', function () {
    let mipImg = document.createElement('mip-img')
    mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_01.jpg')
    mipImg.setAttribute('width', '100px')
    mipImg.setAttribute('height', '100px')
    mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_02.jpg')
    mipImgWrapper.appendChild(mipImg)

    mipImg.viewportCallback(true)
    mipImgWrapper.removeChild(mipImg)
    mipImgWrapper.appendChild(mipImg)
    let img = mipImg.querySelector('img')
    expect(img.getAttribute('src')).to.equal('https://www.mipengine.org/static/img/sample_02.jpg')
  })

  it('should set props correctly', function () {
    let mipImg = document.createElement('mip-img')
    mipImg.setAttribute('width', '100px')
    mipImg.setAttribute('height', '100px')
    mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_01.jpg')
    mipImg.setAttribute('srcset', 'https://www.mipengine.org/static/img/sample_01.jpg 1x, https://www.mipengine.org/static/img/sample_01.jpg 2x, https://www.mipengine.org/static/img/sample_01.jpg 3x')
    mipImg.setAttribute('popup', 'true')
    mipImg.setAttribute('alt', 'baidu mip img')
    mipImgWrapper.appendChild(mipImg)

    mipImg.viewportCallback(true)

    let img = mipImg.querySelector('img')
    expect(mipImg.getAttribute('width')).to.equal('100px')
    expect(mipImg.getAttribute('height')).to.equal('100px')
    expect(mipImg.getAttribute('popup')).to.equal('true')
    expect(img.getAttribute('src')).to.equal('https://www.mipengine.org/static/img/sample_01.jpg')
    expect(img.getAttribute('alt')).to.equal('baidu mip img')
    expect(mipImg.querySelector('div.mip-placeholder')).to.be.null
  })

  it('should popup', function () {
    let mipImg = document.createElement('mip-img')
    mipImg.setAttribute('width', '100px')
    mipImg.setAttribute('height', '100px')
    mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_01.jpg')
    mipImg.setAttribute('srcset', 'https://www.mipengine.org/static/img/sample_01.jpg 1x, https://www.mipengine.org/static/img/sample_01.jpg 2x, https://www.mipengine.org/static/img/sample_01.jpg 3x')
    mipImg.setAttribute('popup', 'true')
    mipImg.setAttribute('alt', 'baidu mip img')
    mipImgWrapper.appendChild(mipImg)

    mipImg.viewportCallback(true)

    let img = mipImg.querySelector('img')
    let event = document.createEvent('MouseEvents')
    event.initEvent('click', true, true)
    img.dispatchEvent(event)

    let mipPopWrap = document.querySelector('.mip-img-popUp-wrapper')
    mipPopWrap.dispatchEvent(event)

    expect(mipPopWrap.getAttribute('data-name')).to.equal('mip-img-popUp-name')
    expect(mipPopWrap.parentNode.tagName).to.equal('BODY')
    expect(mipPopWrap.tagName).to.equal('DIV')
    expect(mipPopWrap.querySelector('.mip-img-popUp-bg')).to.be.exist
    expect(mipPopWrap.querySelector('mip-carousel')).to.be.exist
    expect(mipPopWrap.querySelector('mip-carousel').getAttribute('index')).to.equal('1')
  })
  it('should resize popup according to window resizing', function () {
    let mipImg = document.createElement('mip-img')
    mipImg.setAttribute('width', '100px')
    mipImg.setAttribute('height', '100px')
    mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_01.jpg')
    mipImg.setAttribute('srcset', 'https://www.mipengine.org/static/img/sample_01.jpg 1x, https://www.mipengine.org/static/img/sample_01.jpg 2x, https://www.mipengine.org/static/img/sample_01.jpg 3x')
    mipImg.setAttribute('popup', 'true')
    mipImg.setAttribute('alt', 'baidu mip img')
    mipImgWrapper.appendChild(mipImg)

    mipImg.viewportCallback(true)

    let event = document.createEvent('Event')
    event.initEvent('resize', true, true)
    window.dispatchEvent(event)
  })
  it('with special image popuping should popup', function () {
    // 针对长图的大图浏览代码测试，其实只需要设置一张特殊的图即可。
    let mipImg = document.createElement('mip-img')
    mipImg.setAttribute('width', '100px')
    mipImg.setAttribute('height', '100px')
    mipImg.setAttribute('src', 'https://boscdn.baidu.com/v1/assets/mip/mip2-component-lifecycle.png')
    mipImg.setAttribute('popup', 'true')
    mipImg.setAttribute('alt', 'baidu mip img')
    mipImgWrapper.appendChild(mipImg)

    mipImg.viewportCallback(true)

    let img = mipImg.querySelector('img')
    let event = document.createEvent('MouseEvents')
    event.initEvent('click', true, true)
    img.dispatchEvent(event)

    let mipPopWrap = document.querySelector('.mip-img-popUp-wrapper')
    mipPopWrap.dispatchEvent(event)

    expect(mipPopWrap.getAttribute('data-name')).to.equal('mip-img-popUp-name')
    expect(mipPopWrap.parentNode.tagName).to.equal('BODY')
    expect(mipPopWrap.tagName).to.equal('DIV')
    expect(mipPopWrap.querySelector('.mip-img-popUp-bg')).to.be.exist
    expect(mipPopWrap.querySelector('mip-carousel')).to.be.exist
    expect(mipPopWrap.querySelector('mip-carousel').getAttribute('index')).to.equal('1')
  })
})
