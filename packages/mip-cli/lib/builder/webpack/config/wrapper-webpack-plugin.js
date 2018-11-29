/**
 * @file entry-wrapper-webpack-plugin.js
 * @author clark-t (clarktanglei@163.com)
 * @description copy and modify from https://github.com/levp/wrapper-webpack-plugin
 */

'use strict'

const ConcatSource = require('webpack-sources').ConcatSource
const ModuleFilenameHelpers = require('webpack/lib/ModuleFilenameHelpers')

class WrapperPlugin {
  constructor (args) {
    if (typeof args !== 'object') {
      throw new TypeError('Argument "args" must be an object.')
    }

    this.wrapper = args.hasOwnProperty('wrapper') ? args.wrapper : {header: '', footer: ''}
    this.test = args.hasOwnProperty('test') ? args.test : ''
  }

  apply (compiler) {
    const wrapper = this.wrapper
    const tester = {test: this.test}

    compiler.hooks.compilation.tap('EntryWrapperPlugin', (compilation) => {
      compilation.hooks.optimizeChunkAssets.tapAsync('WrapperPlugin', (chunks, done) => {
        wrapChunks(compilation, chunks)
        done()
      })
    })

    function wrapFile (compilation, fileName, chunkHash, chunk) {
      const {header, footer} = typeof wrapper === 'function' ? wrapper(fileName, chunkHash, chunk, compilation) : wrapper

      compilation.assets[fileName] = new ConcatSource(
        String(header),
        compilation.assets[fileName],
        String(footer)
      )
    }

    function wrapChunks (compilation, chunks) {
      chunks.forEach(chunk => {
        const args = {
          hash: compilation.hash,
          chunkhash: chunk.hash
        }
        chunk.files.forEach(fileName => {
          if (ModuleFilenameHelpers.matchObject(tester, fileName)) {
            wrapFile(compilation, fileName, args, chunk)
          }
        })
      })
    }
  }
}

module.exports = WrapperPlugin
