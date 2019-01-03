/**
 * @file 视频播放组件
 * @author @author harttle<yangjun14@baidu.com>, liangjiaying<jennyliang220@github>
 * @version 1.0
 * @copyright 2016 Baidu.com, Inc. All Rights Reserved
 */
import util from '../util/index'
import viewer from '../viewer'
import CustomElement from '../custom-element'
import {CUSTOM_EVENT_SHOW_PAGE, CUSTOM_EVENT_HIDE_PAGE} from '../page/const'

let videoAttributes = [
  'ads',
  'src',
  'controls',
  'loop',
  'autoplay',
  'autobuffer',
  'crossorigin',
  'height',
  'muted',
  'preload',
  'poster',
  'width',
  'currenttime'
]

/**
 * Get attribute Set from attribute List
 *
 * @param {NamedNodeMap} attributes the attribute list, spec: https://dom.spec.whatwg.org/#interface-namednodemap
 * @return {Object} the attribute set, legacy:
 * @example
 * {
 *     "src": "http://xx.mp4",
 *     "autoplay": "",
 *     "width": "720"
 * }
 */
function getAttributeSet (attributes) {
  let attrs = {}
  Array.prototype.slice.apply(attributes).forEach(function (attr) {
    attrs[attr.name] = attr.value
  })
  return attrs
}

class MipVideo extends CustomElement {
  layoutCallback () {
    this.attributes = getAttributeSet(this.element.attributes)
    this.sourceDoms = [...this.element.querySelectorAll('source')]

    const videoElement = this.renderVideo()

    window.addEventListener(CUSTOM_EVENT_SHOW_PAGE, () => {
      videoElement.load && videoElement.load()
    })
    window.addEventListener(CUSTOM_EVENT_HIDE_PAGE, () => {
      videoElement.pause && videoElement.pause()
    })
    this.addEventAction('seekTo', (e, currentTime) => {
      videoElement.currentTime = currentTime
    })
    this.addEventAction('play', () => {
      // renderPlayElsewhere 的 videoElement 是 div，没有 play
      /* istanbul ignore next */
      videoElement.play && videoElement.play()
    })
    this.addEventAction('pause', () => {
      // renderPlayElsewhere 的 videoElement 是 div，没有 pause
      /* istanbul ignore next */
      videoElement.pause && videoElement.pause()
    })

    this.applyFillContent(videoElement, true)
    return Promise.resolve()
  }

  // Render the `<video>` element, and append to `this.element`
  renderInView () {
    let videoEl = document.createElement('video')
    for (let k in this.attributes) {
      if (this.attributes.hasOwnProperty(k) && videoAttributes.indexOf(k) > -1) {
        videoEl.setAttribute(k, this.attributes[k])
      }
    }
    let currentTime = this.attributes.currenttime
    videoEl.setAttribute('playsinline', 'playsinline')
    // 兼容qq浏览器
    videoEl.setAttribute('x5-playsinline', 'x5-playsinline')
    videoEl.setAttribute('webkit-playsinline', 'webkit-playsinline')
    videoEl.setAttribute('t7-video-player-type', 'inline')
    Array.prototype.slice.apply(this.element.childNodes).forEach(function (node) {
      // FIXME: mip layout related, remove this!
      if (node.nodeName.toLowerCase() === 'mip-i-space') {
        return
      }
      videoEl.appendChild(node)
    })
    // 如果设置了播放时间点，则直接跳转至播放时间的位置开始播放
    videoEl.addEventListener('loadedmetadata', function () {
      if (currentTime) {
        this.currentTime = +currentTime
      }
    })
    this.element.appendChild(videoEl)
    return videoEl
  }
  // 混合内容警告：出于安全因素的考虑，不予播放，显示一个 X
  renderError () {
    let videoEl = document.createElement('div')
    videoEl.setAttribute('class', 'mip-video-poster')
    if (this.attributes.poster) {
      videoEl.style.backgroundImage = 'url(' + this.attributes.poster + ')'
      videoEl.style.backgroundSize = 'cover'
    }

    let playBtn = document.createElement('span')
    playBtn.setAttribute('class', 'mip-video-error')
    videoEl.appendChild(playBtn)
    this.element.appendChild(videoEl)
    return videoEl
  }
  // Render the `<div>` element with poster and play btn, and append to `this.element`
  renderPlayElsewhere () {
    let videoEl = document.createElement('div')
    let urlSrc
    videoEl.setAttribute('class', 'mip-video-poster')
    if (this.attributes.poster) {
      videoEl.style.backgroundImage = 'url(' + this.attributes.poster + ')'
      videoEl.style.backgroundSize = 'cover'
    }

    let playBtn = document.createElement('span')
    playBtn.setAttribute('class', 'mip-video-playbtn')
    videoEl.appendChild(playBtn)
    videoEl.dataset.videoSrc = this.attributes.src
    videoEl.dataset.videoPoster = util.parseCacheUrl(this.attributes.poster)
    videoEl.addEventListener('click', sendVideoMessage, false)

    // make sourceList, send to outer iframe
    let sourceList = this.sourceDoms.map(({type, src}) => ({[type]: src}))

    if (!sourceList.length) {
      urlSrc = videoEl.dataset.videoSrc
    } else {
      urlSrc = JSON.stringify([videoEl.dataset.videoSrc, sourceList])
    }

    function sendVideoMessage () {
      /* istanbul ignore if */
      if (viewer.isIframed) {
        // mip_video_jump is written outside iframe
        // TODO 改成 OUTER_MESSAGE_VIDEO_JUMP
        viewer.sendMessage('mip-video-jump', {
          poster: videoEl.dataset.videoPoster,
          src: urlSrc
        })
      }
    }
    this.element.appendChild(videoEl)
    return videoEl
  }

  renderVideo () {
    const src = this.attributes.src
    const sources = this.sourceDoms
    const isHttps = src => /^https:|^\/\//.test(src)

    const isPageHttps = isHttps(window.location.protocol)
    const isSourcesHttps = sources.length && sources.every(node => isHttps(node.src))
    const isVideoHttps = isHttps(src) || isSourcesHttps
    // page ishttps         + video is https    = renderInView
    // page ishttps(in iframe) + video is http    = renderPlayElsewhere
    // page ishttps(else)   + video is http     = renderInView（not mip）
    // page ishttp          + random video      = renderInView
    /* istanbul ignore else */
    if (!(viewer.isIframed && !isVideoHttps && isPageHttps)) {
      return this.renderInView()
    }
    // 再细分为 iframe 外层页面是否为百度搜索结果页，如果是就 renderPlayElsewhere，否则就 renderError
    // 考虑安全性，renderPlayElsewhere 可以在其他地方来打开视频，而renderError 则是直接显示X，不建议播放
    if (window.MIP.standalone) {
      return this.renderError()
    }
    return this.renderPlayElsewhere()
  }
}

export default MipVideo
