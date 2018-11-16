/**
 * @file custom-element-plugin.js
 * @author clark-t (clarktanglei@163.com)
 */

const path = require('path')
const WrapperPlugin = require('./wrapper-webpack-plugin')
const fs = require('fs-extra')

function isComponentFile (filename) {
  return /(mip-[\w-]+)\/\1\.js$/.test(filename)
}

function getEntryFilePath (compilation, chunk) {
  let entrypoint = getEntryPoint(compilation, chunk)
  return entrypoint.origins[0].request
}

function getEntryPoint (compilation, chunk) {
  return compilation.entrypoints.get(chunk.id)
}

function getBaseName (filename) {
  return path.basename(filename, path.extname(filename))
}

function getMeta (compilation, chunk) {
  let entryPath
  try {
    entryPath = getEntryFilePath(compilation, chunk)
  } catch (e) {
    return
  }
  let metaPath = path.resolve(entryPath, '../meta.json')
  if (!fs.existsSync(metaPath)) {
    return
  }

  let meta
  try {
    let metaStr = fs.readFileSync(metaPath)
    meta = JSON.parse(metaStr)
  } catch (e) {
    return
  }

  return meta
}

function getDependencies (meta) {
  if (!meta || !meta.deps || !Array.isArray(meta.deps) || !meta.deps.length) {
    return ''
  }

  return [
    'deps: [',
    meta.deps.map(dep => `'${dep}'`).join(','),
    '],'
  ].join('')
}

function getRegisterWrapper (name, registered) {
  let header
  let footer

  if (registered) {
    header = ''
    footer = ''
  } else {
    header = 'var __mip_component__ = '
    footer = `
      __mip_component__ = __mip_component__.default || __mip_component__;
      if (typeof MIP.registerElement === 'function') {
        MIP.registerElement('${name}', __mip_component__);
      } else {
        var type = typeof __mip_component__ === 'function' ? 'registerCustomElement' : 'registerVueCustomElement';
        MIP[type]('${name}', __mip_component__);
      }
    `
  }

  return {header, footer}
}

function customElementWrapper (options) {
  return {
    wrapper (filename, hash, chunk, compilation) {
      if (!getEntryPoint(compilation, chunk)) {
        return ''
      }
      if (!isComponentFile(filename)) {
        return ''
      }

      let basename = getBaseName(filename)
      let meta = getMeta(compilation, chunk)
      let deps = getDependencies(meta)
      let registerWrapper = getRegisterWrapper(basename, meta && meta.registered)
      return {
        header: `
        (window.MIP = window.MIP || []).push({
          name: '${basename}',
          ${deps}
          func: function() {
            ${registerWrapper.header}`,

        footer: `
            ${registerWrapper.footer}
          }
        });`
      }
    }
  }
}

module.exports = function (options) {
  return new WrapperPlugin(customElementWrapper(options))
}
