import Header from './header.js'
import {getIFrame} from '../util/dom'

export default class AppShell {
  constructor (options, page) {
    this.page = page
    this.data = options.data || {}
    this.$wrapper = null
    this.header = null

    this._init()
  }

  _init () {
    this.$wrapper = document.createElement('div')
    this.$wrapper.classList.add('mip-appshell-header-wrapper')
    if (this.data.header && this.data.header.show) {
      this.$wrapper.classList.add('show')
    } else {
      this.$wrapper.classList.add('with-iframe')
    }

    this.header = new Header({
      wrapper: this.$wrapper,
      data: {
        ...this.data.header,
        showBackIcon: !(this.data.view && this.data.view.isIndex)
      },
      clickButtonCallback: this.handleClickHeaderButton.bind(this)
    })
    this.header.init()

    document.body.insertBefore(this.$wrapper, document.body.firstChild)
  }

  refresh (data, targetPageId) {
    let {header, view} = data

    // set document title
    if (header.title) {
      document.title = header.title
    }

    // toggle iframe
    let targetIFrame = getIFrame(targetPageId)
    if (header.show) {
      this.$wrapper.classList.add('show')
      if (targetIFrame) {
        // targetIFrame.contentWindow.document.querySelector('.mip-html-wrapper').add('with-header')
        targetIFrame.classList.add('with-header')
      }
    } else {
      this.$wrapper.classList.remove('show')
      if (targetIFrame) {
        // targetIFrame.contentWindow.document.querySelector('.mip-html-wrapper').remove('with-header')
        targetIFrame.classList.remove('with-header')
      }
    }

    // redraw entire header
    if (this.header) {
      this.header.update({
        ...header,
        showBackIcon: !view.isIndex
      })
      this.header.isDropdownShow = false
    }
  }

  handleClickHeaderButton (buttonName) {
    if (buttonName === 'back') {
      // **Important** only allow transition happens when Back btn & <a> clicked
      this.page.allowTransition = true
      this.page.direction = 'back'
      // SF can help to navigate by 'changeState' when standalone = false
      if (window.MIP.standalone) {
        window.MIP_ROUTER.go(-1)
      }
      window.MIP.viewer.sendMessage('historyNavigate', {step: -1})
    } else if (buttonName === 'more') {
      if (this.header) {
        this.header.toggleDropdown(true)
      }
    } else if (buttonName === 'close') {
      window.MIP.viewer.sendMessage('close')
    }

    this.page.emitEventInCurrentPage({
      name: `appheader:click-${buttonName}`
    })
  }
}
