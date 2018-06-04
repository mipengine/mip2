import event from '../../util/dom/event'
import {isSameRoute, normalizeLocation} from '../util/route'
import {nextFrame, whenTransitionEnds, clickedInEls} from '../util/dom'

export default class Header {
  constructor (options = {}) {
    this.$wrapper = options.wrapper || document.body
    this.$el = null
    this.data = options.data
    this.clickButtonCallback = options.clickButtonCallback
    this._clickOutside = this._clickOutside.bind(this)
  }

  init () {
    this.$el = document.createElement('div')
    this.$el.classList.add('mip-appshell-header')
    this.$el.innerHTML = this.render(this.data)
    this.$wrapper.prepend(this.$el)

    this.bindEvents()
  }

  render (data) {
    let {showBackIcon, title, logo, buttonGroup} = data
    let headerHTML = `
      ${showBackIcon ? `<span class="material-icons back-button" mip-header-btn
        data-button-name="back">
        keyboard_arrow_left
      </span>` : ''}
      <div class="mip-appshell-header-logo-title">
        ${logo ? `<img class="mip-appshell-header-logo" src="${logo}">` : ''}
        <span class="mip-appshell-header-title">${title}</span>
      </div>
    `

    if (window.MIP.standalone) {
      headerHTML += `
        <div class="mip-appshell-header-button-group-standalone more material-icons" data-button-name="more">
          more_horiz
        </div>
      `
    } else {
      headerHTML += `
        <div class="mip-appshell-header-button-group">
          <div class="button more material-icons" data-button-name="more">more_horiz</div>
          <div class="split"></div>
          <div class="button close material-icons" data-button-name="close">close</div>
        </div>
      `
    }

    return headerHTML
  }

  // isActive (to) {
  //   if (!to) {
  //     return false
  //   }
  //   let router = window.MIP_ROUTER
  //   let currentRoute = router.history.current
  //   let compareTarget = normalizeLocation(to, currentRoute)
  //   return isSameRoute(currentRoute, compareTarget, true)
  // }

  // showDropdown () {
  //   let $dropdown = this.$el.querySelector('.mip-appshell-header-dropdown')
  //   $dropdown.classList.add('show')

  //   $dropdown.classList.add('slide-enter')
  //   $dropdown.classList.add('slide-enter-active')

  //   // trigger layout
  //   /* eslint-disable no-unused-expressions */
  //   $dropdown.offsetWidth
  //   /* eslint-enable no-unused-expressions */

  //   whenTransitionEnds($dropdown, 'transition', () => {
  //     $dropdown.classList.remove('slide-enter-to')
  //     $dropdown.classList.remove('slide-enter-active')
  //     this.isDropdownShow = !this.isDropdownShow
  //   })

  //   nextFrame(() => {
  //     $dropdown.classList.add('slide-enter-to')
  //     $dropdown.classList.remove('slide-enter')
  //   })
  // }

  // hideDropdown () {
  //   let $dropdown = this.$el.querySelector('.mip-appshell-header-dropdown')
  //   $dropdown.classList.add('slide-leave')
  //   $dropdown.classList.add('slide-leave-active')

  //   // trigger layout
  //   /* eslint-disable no-unused-expressions */
  //   $dropdown.offsetWidth
  //   /* eslint-enable no-unused-expressions */

  //   whenTransitionEnds($dropdown, 'transition', () => {
  //     $dropdown.classList.remove('slide-leave-to')
  //     $dropdown.classList.remove('slide-leave-active')
  //     this.isDropdownShow = !this.isDropdownShow
  //     $dropdown.classList.remove('show')
  //   })

  //   nextFrame(() => {
  //     $dropdown.classList.add('slide-leave-to')
  //     $dropdown.classList.remove('slide-leave')
  //   })
  // }

  // toggleDropdown () {
  //   this.cleanTransitionClasses()
  //   this.isDropdownShow ? this.hideDropdown() : this.showDropdown()
  // }

  // cleanTransitionClasses () {
  //   let $dropdown = this.$el.querySelector('.mip-appshell-header-dropdown')
  //   $dropdown.classList.remove('slide-leave', 'slide-leave-active', 'slide-leave-to',
  //     'slide-enter', 'slide-enter-active', 'slide-enter-to')
  // }

  _clickOutside (e) {
    let $dropdown = this.$el.querySelector('.mip-appshell-header-dropdown')
    if ($dropdown) {
      let elements = [$dropdown.parentNode]
      !clickedInEls(e, elements) && setTimeout(() => {
        this.isDropdownShow && this.hideDropdown()
      }, 0)
    }
  }

  bindEvents () {
    let clickButtonCallback = this.clickButtonCallback
    this.eventHandler = event.delegate(this.$el, '[mip-header-btn]', 'click', function (e) {
      let buttonName = this.dataset.buttonName
      clickButtonCallback(buttonName)
    })

    document.body.addEventListener('click', this._clickOutside, true)
  }

  unbindEvents () {
    this.eventHandler && this.eventHandler()
    document.body.removeEventListener('click', this._clickOutside, true)
  }

  update (data) {
    this.$el.innerHTML = this.render(data)
  }
}
