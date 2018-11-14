/**
 * @file size-list.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

/**
 * SizeList options definition
 * @typedef {Object} SizeListOptDef
 * @property {string|undefined} mediaQuery
 * @property {string} size
 */

/**
 * Parses the text representation of "sizes" into SizeList object.
 *
 * @param {string} s
 * @param {boolean} allowPercent
 * @return {!SizeList}
 */
export function parseSizeList (s, allowPercent) {
  const sSizes = s.split(',')
  const sizes = []
  sSizes.forEach(sSize => {
    sSize = sSize.replace(/\s+/g, ' ').trim()
    // istanbul ignore next
    if (sSize.length === 0) {
      return
    }

    let mediaStr
    let sizeStr

    // Process the expression from the end.
    let lastChar = sSize.charAt(sSize.length - 1)
    let div
    let func = false
    if (lastChar === ')') {
      // Value is the CSS function, e.g. `calc(50vw + 10px)`.
      func = true

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
      let funcEnd = div - 1
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
      if (div >= funcEnd) {
        throw new Error(`Invalid CSS function in "${sSize}"`)
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

    if (!func) {
      if (allowPercent && !/^\d+(\.\d+)?(px|em|rem|vh|vw|vmin|vmax|%)$/.test(sizeStr)) {
        throw new Error(`Invalid length or percent value: ${sizeStr}`)
      }

      if (!allowPercent && !/^\d+(\.\d+)?(px|em|rem|vh|vw|vmin|vmax|cm|mm|q|in|pc|pt)$/.test(sizeStr)) {
        throw new Error(`Invalid length value: ${sizeStr}`)
      }
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
 */
export class SizeList {
  constructor (sizes) {
    if (sizes.length > 0) {
      /** @private @type {SizeListOptDef} */
      this._sizes = sizes
    } else {
      throw new Error('SizeList must have at least one option')
    }

    // All sources except for last must have a media query. The last one must not.
    for (let i = 0; i < sizes.length; i++) {
      const option = sizes[i]
      if (i < sizes.length - 1) {
        if (!option.mediaQuery) {
          throw new Error('All options except for the last must have a media condition')
        }
      } else if (option.mediaQuery) {
        throw new Error('The last option must not have a media condition')
      }
    }
  }

  /**
   * Selects the first size that matches media conditions. If no options match,
   * the last option is returned.
   *
   * @param {!Window} win
   * @return {string}
   */
  select (win) {
    let sizes = this._sizes
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
