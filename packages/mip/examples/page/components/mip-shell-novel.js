/**
 * @file 小说 shell （测试）
 * @author wangyisheng@baidu.com (wangyisheng)
 */

class MipShellNovel extends window.MIP.builtinComponents.MipShell {
  constructor (...args) {
    super(...args)

    this.alwaysReadConfigOnLoad = false
    this.transitionContainsHeader = false
  }

  processShellConfig (shellConfig) {
    this.catalog = shellConfig.catalog
  }

  renderOtherParts () {
    this.$footerWrapper = document.createElement('mip-fixed')
    this.$footerWrapper.setAttribute('type', 'bottom')
    this.$footerWrapper.classList.add('mip-shell-footer-wrapper')

    this.$footer = document.createElement('div')
    this.$footer.classList.add('mip-shell-footer', 'mip-border', 'mip-border-top')
    this.$footer.innerHTML = this.renderFooter()
    this.$footerWrapper.appendChild(this.$footer)

    document.body.appendChild(this.$footerWrapper)
  }

  updateOtherParts () {
    this.$footer.innerHTML = this.renderFooter()
  }

  renderFooter () {
    let pageMeta = this.currentPageMeta
    let {buttonGroup} = pageMeta.footer
    let renderFooterButtonGroup = buttonGroup => buttonGroup.map(buttonConfig => `
      <div class="button" mip-footer-btn data-button-name="${buttonConfig.name}">${buttonConfig.text}</div>
    `).join('')

    let footerHTML = `
      <div class="upper mip-border mip-border-bottom">
        <div class="switch switch-left" mip-footer-btn data-button-name="previous">&lt;上一章</div>
        <div class="switch switch-right" mip-footer-btn data-button-name="next">下一章&gt;</div>
      </div>
      <div class="button-wrapper">
        ${renderFooterButtonGroup(buttonGroup)}
      </div>
    `

    return footerHTML
  }

  bindHeaderEvents () {
    super.bindHeaderEvents()

    let me = this
    let event = window.MIP.util.event

    // Delegate dropdown button
    this.footEventHandler = event.delegate(this.$footerWrapper, '[mip-footer-btn]', 'click', function (e) {
      let buttonName = this.dataset.buttonName
      me.handleFooterButton(buttonName)
    })

    if (this.$buttonMask) {
      this.$buttonMask.onclick = () => {
        this.toggleDropdown(false)
        this.toggleDOM(this.$footerWrapper, false, {transitionName: 'slide'})
      }
    }
  }

  unbindHeaderEvents () {
    super.unbindHeaderEvents()

    if (this.footEventHandler) {
      this.footEventHandler()
      this.footEventHandler = undefined
    }
  }

  handleShellCustomButton (buttonName) {
    if (buttonName === 'share') {
      console.log('share')
      this.toggleDropdown(false)
    } else if (buttonName === 'setting') {
      this.toggleDOM(this.$buttonWrapper, false, {transitionName: 'slide'})
      this.toggleDOM(this.$footerWrapper, true, {transitionName: 'slide'})
    }
  }

  handleFooterButton (buttonName) {
    console.log('click on footer:', buttonName)
    this.toggleDOM(this.$buttonMask, false)
    this.toggleDOM(this.$footerWrapper, false, {transitionName: 'slide'})
  }
}

window.MIP.registerCustomElement('mip-shell-novel', MipShellNovel)
