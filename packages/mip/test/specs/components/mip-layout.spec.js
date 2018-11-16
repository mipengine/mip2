describe('mip-layout', () => {
  let layout
  let child
  beforeEach(() => {
    layout = document.createElement('mip-layout')
    child = document.createElement('p')
    layout.appendChild(child)
    document.body.appendChild(layout)
  })

  afterEach(() => {
    document.body.removeChild(layout)
  })

  it('should add mip relevant class and child default', () => {
    return layout._resources.updateState().then(() => {
      let container = layout.querySelector('.mip-fill-content')
      expect(container).to.be.not.null
      expect(layout.classList.contains('mip-element')).to.be.true
      expect(layout.classList.contains('mip-layout-container')).to.be.true
      expect(layout.classList.contains('mip-layout-size-defined')).to.be.false
      expect(layout.querySelector('.mip-i-space')).to.be.null
      expect(child.parentNode).to.equal(container)
    })
  })

  it('should layout correctly with layout attribute', () => {
    layout.setAttribute('layout', 'responsive')
    layout.setAttribute('width', '1')
    layout.setAttribute('height', '1')
    let wh = window.innerHeight
    let ww = window.innerWidth

    layout._resources.updateState().then(() => {
      let container = layout.querySelector('.mip-fill-content')
      expect(container).to.be.not.null
      expect(layout.classList.contains('mip-element')).to.be.true
      expect(layout.classList.contains('mip-layout-responsive')).to.be.true
      expect(layout.classList.contains('mip-layout-size-defined')).to.be.true
      expect(layout.querySelector('.mip-i-space')).to.be.not.null
      expect(child.parentNode).to.equal(container)

      let rect = layout.getBoundingClientRect()
      expect(rect.width).to.equal(ww)
      expect(rect.height).to.equal(wh)
    })
  })
})
