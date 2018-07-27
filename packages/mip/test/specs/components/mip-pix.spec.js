/**
 * @file mip-pix spec file
 * @author qiusiqi(qiusiqi@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* globals describe, before, it, expect, after */

describe('mip-pix', function () {
  let pixExperiment
  let pixDefault
  let pixSetParam
  let pixExtraParam
  let div

  before(function () {
    let script = document.createElement('script')
    script.src = 'https://c.mipcdn.com/static/v1/mip-experiment/mip-experiment.js'
    document.body.appendChild(script)

    div = document.createElement('div')
    div.innerHTML = `
      <mip-experiment layout="nodisplay" class="mip-hidden">
        <script type="application/json" for="mip-experiment">
            {
                "button-color": {
                    "sticky": false,
                    "descri": "3.设置按钮背景色,黄-灰-蓝-绿",
                    "variants": {
                        "yellow": 50,
                        "grey": 50
                    }
                },
                "font-color": {
                    "sticky": false,
                    "descri": "设置按钮字体颜色,黑-白",
                    "variants": {
                        "black": 50,
                        "white": 50
                    }
                }
            }
        </script>
        <p>设置按钮背景色,黄(30%)-灰(30%)-蓝(30%)-绿(默认10%)</p>
        <p>设置按钮字体色,黑(50%)-白(50%)</p>
        <p>每次刷新重新分组</p>
        <button class="exp-btn3">修改背景色&字体颜色</button>
      </mip-experiment>
    `
    document.body.appendChild(div)
  })

  it('should send by default', function () {
    pixDefault = createPix('https://www.mipengine.org/a.gif')
    let src = pixDefault.querySelector('img').getAttribute('src')
    let params = parseUrl(src)
    let keys = Object.keys(params)
    let title = encodeURIComponent((document.querySelector('title') || {}).innerHTML || '')
    expect(keys).to.include('t')
    expect(keys).to.include('title')
    expect(keys).to.include('host')
    expect(keys.length).to.equal(3)
    expect(isValidDate(params.t)).to.be.true
    expect(params.title).to.equal(title)
    expect(params.host).to.equal(encodeURIComponent(window.location.href))
  })

  it('should send by arguments', function () {
    pixSetParam = createPix('https://www.mipengine.org/a.gif?t=${TIME}&title=${TITLE}&host=${HOST}') // eslint-disable-line
    let src = pixSetParam.querySelector('img').getAttribute('src')
    let params = parseUrl(src)
    let keys = Object.keys(params)
    let title = encodeURIComponent((document.querySelector('title') || {}).innerHTML || '')
    expect(keys).to.include('t')
    expect(keys).to.include('title')
    expect(keys).to.include('host')
    expect(keys.length).to.equal(3)
    expect(isValidDate(params.t)).to.be.true
    expect(params.title).to.equal(title)
    expect(params.host).to.equal(encodeURIComponent(window.location.href))
  })

  it('should send with extra args', function () {
    pixExtraParam = createPix('https://www.mipengine.org/a.gif?t=${TIME}&title=${TITLE}&host=${HOST}&area=A') // eslint-disable-line
    let src = pixExtraParam.querySelector('img').getAttribute('src')
    let params = parseUrl(src)
    let keys = Object.keys(params)
    let title = encodeURIComponent((document.querySelector('title') || {}).innerHTML || '')
    expect(keys).to.include('t')
    expect(keys).to.include('title')
    expect(keys).to.include('host')
    expect(keys).to.include('area')
    expect(keys.length).to.equal(4)
    expect(isValidDate(params.t)).to.be.true
    expect(params.title).to.equal(title)
    expect(params.host).to.equal(encodeURIComponent(window.location.href))
    expect(params.area).to.equal('A')
  })

  it('should send by experiment', function () {
    pixExperiment = createPix('https://www.mipengine.org/a.gif?mip-x-button-color=${MIP-X-BUTTON-COLOR}&mip-x-font-color=${MIP-X-FONT-COLOR}') // eslint-disable-line
    let src = pixExperiment.querySelector('img').getAttribute('src')
    let params = parseUrl(src)
    let keys = Object.keys(params)
    let title = encodeURIComponent((document.querySelector('title') || {}).innerHTML || '')
    expect(keys).to.include('t')
    expect(keys).to.include('title')
    expect(keys).to.include('host')
    expect(keys).to.include('mip-x-button-color')
    expect(keys).to.include('mip-x-font-color')
    expect(keys.length).to.equal(5)
    expect(isValidDate(params.t)).to.be.true
    expect(params.title).to.equal(title)
    expect(params.host).to.equal(encodeURIComponent(window.location.href))
    // expect(params['mip-x-button-color']).to.be.oneOf(['yellow', 'grey'])
    // expect(params['mip-x-font-color']).to.be.oneOf(['black', 'white'])
  })

  after(function () {
    document.body.removeChild(pixDefault)
    document.body.removeChild(pixSetParam)
    document.body.removeChild(pixExtraParam)
    document.body.removeChild(pixExperiment)
    document.body.removeChild(div)
  })
})

function createPix (src) {
  let pix = document.createElement('mip-pix')
  pix.setAttribute('src', src)
  document.body.appendChild(pix)
  return pix
}

function parseUrl (url) {
  let params = url.split('?')
  if (!params || !params[1]) {
    return
  }

  let res = {}
  params = params[1].split('&')
  params.forEach(p => {
    let match = /([^=]+)=(.*)/.exec(p)
    if (match && match.length) {
      res[match[1]] = match[2]
    }
  })
  return res
}

function isValidDate (date = 0) {
  date = +date
  if (isNaN(date)) {
    return false
  }
  let target = new Date(date)
  let now = new Date(Date.now())
  return target.getFullYear() === now.getFullYear() &&
        target.getMonth() === now.getMonth() &&
        target.getDate() === now.getDate()
}
