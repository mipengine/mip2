/**
 * @file size-list.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

/**
 * Parses the text representation of "sizes" into SizeList object.
 *
 * There could be any number of size options within the SizeList. They are tried
 * in the order they were defined. The final size option must not have "media"
 * condition specified. All other size options must have "media" condition
 * specified.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Attributes
 * See http://www.w3.org/html/wg/drafts/html/master/semantics.html#attr-img-sizes
 * @param {string} s
 * @return {!SizeList}
 */
export function parseSizeList (s) {
  const sSizes = s.split(',')
  const sizes = []
  sSizes.forEach(sSize => {
    sSize = sSize.replace(/\s+/g, ' ').trim()
    if (sSize.length === 0) {
      return
    }

    let mediaStr
    let sizeStr

    // Process the expression from the end.
    let lastChar = sSize.charAt(sSize.length - 1)
    let div
    if (lastChar === ')') {
      // Value is the CSS function, e.g. `calc(50vw + 10px)`.

      // First, skip to the opening paren.
      let parens = 1
      div = sSize.length - 2
      for (; div >= 0; div--) {
        let c = sSize.charAt(div)
        if (c === '(') {
          parens--
        } else if (c === ')') {
          parens++
        }
        if (parens === 0) {
          break
        }
      }

      // Then, skip to the begining to the function's name.
      if (div > 0) {
        div--
        for (; div >= 0; div--) {
          let c = sSize.charAt(div)
          if (!(c === '%' || c === '-' || c === '_' ||
              (c >= 'a' && c <= 'z') ||
              (c >= 'A' && c <= 'Z') ||
              (c >= '0' && c <= '9'))) {
            break
          }
        }
      }
    } else {
      // Value is the length or a percent: accept a wide range of values,
      // including invalid values - they will be later asserted to conform
      // to exact CSS length or percent value.
      div = sSize.length - 2
      for (; div >= 0; div--) {
        let c = sSize.charAt(div)
        if (!(c === '%' || c === '.' ||
            (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            (c >= '0' && c <= '9'))) {
          break
        }
      }
    }
    if (div >= 0) {
      mediaStr = sSize.substring(0, div + 1).trim()
      sizeStr = sSize.substring(div + 1).trim()
    } else {
      sizeStr = sSize
      mediaStr = undefined
    }
    sizes.push({
      mediaQuery: mediaStr,
      size: sizeStr
    })
  })
  return new SizeList(sizes)
}

/**
 * A SizeList object contains one or more sizes as typically seen in "sizes"
 * attribute.
 *
 * See "select" method for details on how the size selection is performed.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Attributes
 * See http://www.w3.org/html/wg/drafts/html/master/semantics.html#attr-img-sizes
 */
export class SizeList {
  /**
   * @param {!Array<!SizeListOptionDef>} sizes
   */
  constructor (sizes) {
    /** @private @const {!Array<!SizeListOptionDef>} */
    this._size = sizes
  }

  /**
   * Selects the first size that matches media conditions. If no options match,
   * the last option is returned.
   *
   * See http://www.w3.org/html/wg/drafts/html/master/semantics.html#attr-img-sizes
   * @param {!Window} win
   * @return {!./layout.LengthDef|string}
   */
  select (win) {
    let sizes = this._size
    let length = sizes.length - 1

    // Iterate all but the last size
    for (let i = 0; i < length; i++) {
      let option = sizes[i]
      // Only the last item (which we don't iterate) has an undefined
      // mediaQuery.
      let query = /** @type {string} */ (option.mediaQuery)
      if (win.matchMedia(query).matches) {
        return option.size
      }
    }

    // Returns the last size in the SizeList, which is the default.
    return sizes[length].size
  }
}
