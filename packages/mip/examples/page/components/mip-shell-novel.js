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
      <div class="button">${buttonConfig.text}</div>
    `).join('')

    let footerHTML = `
      <div class="upper mip-border mip-border-bottom">
        <div class="switch switch-left">&lt;上一章</div>
        <div class="switch switch-right">下一章&gt;</div>
      </div>
      <div class="button-wrapper">
        ${renderFooterButtonGroup(buttonGroup)}
      </div>
    `

    return footerHTML
  }
}

window.MIP.registerCustomElement('mip-shell-novel', MipShellNovel)
