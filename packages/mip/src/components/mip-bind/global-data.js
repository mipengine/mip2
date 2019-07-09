

export function classifyGlobalData (data) {
  return Object.keys(data).reduce((result, key) => {
      if (typeof data[key] === 'function') {
        throw 'setData method MUST NOT be Function: ${key}'
      }
      let realKey
      if (key[0] === '#') {
        realKey = key.substr(1)
        result.global[realKey] = data[key]
      } else {
        realKey = key
      }
      result.page[realKey] = data[key]
      return result
    },
    { global: {}, page: {} }
  )
}

/*
 * Tell if the page is rootPage - crossOrigin page is rootpage too
 * @param {Object} win window
 */
function isRootPage () {
  let page = window.MIP.viewer.page
  return page.isRootPage || /* istanbul ignore next */ page.isCrossOrigin
}
/*
 * get the unique global data stored under rootpage
 * @param {Object} win window
 */
function getGlobalData () {
  return getRootWindow().g
  // return isSelfParent() ? window.g : /* istanbul ignore next */ window.parent.g
}

function getRootWindow () {
  return isRootPage() ? window : window.parent
}

export function initGlobalData () {
  if (isRootPage()) {
    window.g = {}
  }
}

eport function updateGlobalData (data) {
  if (isEmptyObject(data)) {
    return
  }

  let isRoot = isRootPage()
  let rootWin = getRootWindow()

  let pageId = window.location.href.replace(window.location.hash, '')
  nextTick(() => {
    !isRoot && rootWin.MIP.setData(data)
    merge(rootWin.g, data)
    rootWin.MIP.$update(data, pageId)
  })
}


function updateIframeData (data, pageId) {
  let frames = win.document.getElementsByTagName('iframe')
  for (let i = 0; i < frames.length; i++) {
    let frame = frames[i]
    let framePageId = frame.getAttribute('data-page-id')
    if (frame.classList.contains('mip-page__iframe') &&
      framePageId &&
      pageId !== framePageId
    ) {
      let subwin = frame.contentWindow
      subwin && subwin.MIP && subwin.MIP.setData(data)
    }
  }
}

