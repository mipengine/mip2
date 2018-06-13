/**
 * @file polyfill for custom component
 * @author mj(zoumiaojiang@gmail.com)
 */

const requires = require.context('babel-runtime/helpers', true, /\.js$/)
const regenerator = require('babel-runtime/regenerator')

const cssBase = require('css-loader/lib/css-base')
const componentNormalizer = require('vue-loader/lib/runtime/componentNormalizer')
const addStylesClient = require('vue-style-loader/lib/addStylesClient')
const listToStyles = require('vue-style-loader/lib/listToStyles')

let babelRuntimeHelpers = requires.keys().reduce((obj, filename) => {
  obj[filename.slice(2, -3)] = requires(filename)
  return obj
}, {})

babelRuntimeHelpers.regenerator = regenerator

let componentHelpers = {
  cssBase,
  componentNormalizer,
  addStylesClient,
  listToStyles
}

window.componentHelpers = componentHelpers
window.babelRuntimeHelpers = babelRuntimeHelpers
