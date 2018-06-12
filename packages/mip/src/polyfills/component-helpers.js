/**
 * @file component helpers
 * @author clark-t (clarktanglei@163.com)
 */

const cssBase = require('css-loader/lib/css-base')
const componentNormalizer = require('vue-loader/lib/runtime/componentNormalizer')
const addStylesClient = require('vue-style-loader/lib/addStylesClient')
const listToStyles = require('vue-style-loader/lib/listToStyles')

let helpers = {
  cssBase,
  componentNormalizer,
  addStylesClient,
  listToStyles
}

export function install (win) {
  win.componentHelpers = helpers
}
