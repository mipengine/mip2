/**
 * @file dom
 * @author sekiyika(pengxing@baidu.com)
 */

/**
 * Save documentElement.
 *
 * @inner
 * @type {Object}
 */
let docElem = document.documentElement

/**
 * Get the supported matches method.
 * @inner
 * @type {Function}
 */
/* istanbul ignore next */
let nativeMatches = docElem.matches ||
    docElem.webkitMatchesSelector ||
    docElem.mozMatchesSelector ||
    docElem.oMatchesSelector ||
    docElem.msMatchesSelector ||
    docElem.matchesSelector

/**
 * Support for matches. Check whether a element matches a selector.
 *
 * @param {HTMLElement} element target element
 * @param {string} selector element selector
 * @return {boolean}
 */
function matches (element, selector) {
  if (!element || element.nodeType !== 1) {
    return false
  }
  return nativeMatches.call(element, selector)
}

/**
 * Support for closest. Find the closest parent node that matches the selector.
 *
 * @param {HTMLElement} element element
 * @param {string} selector selector
 * @return {?HTMLElement}
 */
let closest = docElem.closest
  ? (element, selector) => element.closest(selector)
  : /* istanbul ignore next */ (element, selector) => {
    while (element) {
      if (matches(element, selector)) {
        return element
      }
      element = element.parentNode
    }
    return null
  }

/**
 * Support for contains.
 *
 * @param {HTMLElement} element parent node
 * @param {HTMLElement} child child node
 * @return {boolean}
 */
let contains = docElem.contains
  ? function (element, child) {
    return element && element.contains(child)
  }
  : /* istanbul ignore next */ function (element, child) {
    if (element === document) {
      element = document.documentElement || document.body.parentElement
    }
    while (child) {
      if (element === child) {
        return true
      }
      child = child.parentElement
    }
    return false
  }

/**
 * Find the nearest element that matches the selector from current element to target element.
 *
 * @param {HTMLElement} element element
 * @param {string} selector element selector
 * @param {HTMLElement} target target element
 * @return {?HTMLElement}
 */
function closestTo (element, selector, target) {
  let closestElement = closest(element, selector)
  return contains(target, closestElement) ? closestElement : null
}

/**
 * Temp element for creating element by string.
 * @inner
 * @type {HTMLElement}
 */
let createTmpElement = document.createElement('div')

/**
 * Create a element by string
 *
 * @param {string} str Html string
 * @return {HTMLElement}
 */
function create (str) {
  createTmpElement.innerHTML = str
  if (!createTmpElement.children.length) {
    return null
  }
  let children = Array.prototype.slice.call(createTmpElement.children)
  createTmpElement.innerHTML = ''
  return children.length > 1 ? children : children[0]
}

/**
 * Executes `callback` when `predicate(parent)` returns `true`.
 *
 * @param {!HTMLElement} parent element.
 * @param {function(!HTMLElement):boolean} predicate function.
 * @param {Function} callback function.
 */
function waitForChildCallback (parent, predicate, callback) {
  if (predicate(parent)) {
    callback()

    return
  }

  const win = parent.ownerDocument.defaultView

  if (win.MutationObserver) {
    /**
     * @type {!MutationObserver}
     */
    const observer = new win.MutationObserver(() => {
      if (predicate(parent)) {
        observer.disconnect()
        callback()
      }
    })

    observer.observe(parent, {childList: true})

    return
  }

  const intervalId = win.setInterval(() => {
    if (predicate(parent)) {
      win.clearInterval(intervalId)
      callback()
    }
  }, 5)
}

/**
 * Returns a promise that resolve when `predicate(parent)` returns `true`.
 *
 * @param {!HTMLElement} parent element.
 * @param {function(!HTMLElement):boolean} predicate function.
 * @returns {!Promise<void>}
 */
function waitForChild (parent, predicate) {
  return new Promise(resolve => waitForChildCallback(parent, predicate, resolve))
}

/**
 * Returns a promise that resolve when `document.body` is available.
 *
 * @param {!Document} doc document.
 * @returns {!Promise<!HTMLBodyElement>}
 */
function waitForBody (doc) {
  return waitForChild(
    doc.documentElement,
    documentElement => !!documentElement.ownerDocument.body
  )
}

/**
 * Waits until the Document is ready. Then the
 * callback is executed.
 *
 * @param {Function} callback callback
 * @deprecated Use {@link Mipdoc#whenBodyAvailable} instead.
 */
function waitDocumentReady (callback) {
  return waitForChildCallback(
    document.documentElement,
    documentElement => !!documentElement.ownerDocument.body,
    callback
  )
}

/**
 * Insert dom list to a node
 *
 * @param  {HTMLElement} parent the node will be inserted
 * @param {Array} children node list which will insert into parent
 */
function insert (parent, children) {
  if (!parent || !children) {
    return
  }
  let nodes = Array.prototype.slice.call(children)
  if (nodes.length === 0) {
    nodes.push(children)
  }
  for (let i = 0; i < nodes.length; i++) {
    if (this.contains(nodes[i], parent)) {
      continue
    }
    if (nodes[i] !== parent && parent.appendChild) {
      parent.appendChild(nodes[i])
    }
  }
}

export default {
  closest,
  closestTo,
  matches,
  contains,
  create,
  insert,
  waitForChild,
  waitForBody,
  waitDocumentReady
}
