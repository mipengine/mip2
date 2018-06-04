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

    document.body.prepend(this.$wrapper)
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
      targetIFrame && targetIFrame.classList.add('with-header')
    } else {
      this.$wrapper.classList.remove('show')
      targetIFrame && targetIFrame.classList.remove('with-header')
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
      // **Important** only allow transition happens when Back btn clicked
      this.page.allowTransition = true
      window.MIP_ROUTER.go(-1)
      window.MIP.viewer.sendMessage('historyNavigate', {step: -1})
    } else if (buttonName === 'dropdown') {
      if (this.header) {
        this.header.toggleDropdown()
      }
    } else if (buttonName === 'close') {
      window.MIP.viewer.sendMessage('close')
    }

    this.page.emitEventInCurrentPage({
      name: `appheader:click-${buttonName}`
    })
  }
}
