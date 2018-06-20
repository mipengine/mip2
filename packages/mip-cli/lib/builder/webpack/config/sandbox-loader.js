/**
 * @file sandbox-loader
 * @author clark-t (clarktanglei@163.com)
 */

const generate = require('mip-sandbox/lib/generate')
const detect = require('mip-sandbox/lib/unsafe-detect')
const mark = require('mip-sandbox/lib/global-mark')
const keywords = require('mip-sandbox/lib/keywords')
const path = require('path')
const sourceMap = require('source-map')
const cli = require('../../../cli')

module.exports = async function (source, map, meta) {
  this.cacheable = true
  let callback = this.async()

  try {
    let ast = mark(source)
    let list = detect(ast, keywords.WHITELIST)

    if (list.length) {
      let warnings = list.map(item => `[sandbox] ${item.name} (${item.loc.start.line}:${item.loc.start.column}, ${item.loc.end.line}:${item.loc.end.column})`).join('\n')
      cli.error('[sandbox] 以下对象将被注入 MIP.sandbox 前缀，可能会导致程序运行出错：')
      cli.error('\n' + warnings)
    }

    let output = generate(ast, keywords.WHITELIST_RESERVED, {
      escodegen: {
        sourceMapWithCode: true,
        sourceMap: path.basename(this.resourcePath),
        sourceMapRoot: path.relative(this.rootContext, this.context),
        sourceContent: source
      }
    })

    let newMap = JSON.parse(output.map.toString())
    let outputMap

    if (map) {
      outputMap = await mergeSourceMap(newMap, map)
    } else {
      outputMap = newMap
    }

    callback(null, output.code, outputMap)
  } catch (e) {
    callback(e)
  }
}

// copy from [uglify-loader](https://github.com/bestander/uglify-loader/blob/master/index.js)
// and modify to async function

async function mergeSourceMap (map, inputMap) {
  let inputMapConsumer = await new sourceMap.SourceMapConsumer(inputMap)
  let outputMapConsumer = await new sourceMap.SourceMapConsumer(map)

  let mergedGenerator = new sourceMap.SourceMapGenerator({
    file: inputMapConsumer.file,
    sourceRoot: inputMapConsumer.sourceRoot
  })

  var source = outputMapConsumer.sources[0]

  inputMapConsumer.eachMapping(function (mapping) {
    let generatedPosition = outputMapConsumer.generatedPositionFor({
      line: mapping.generatedLine,
      column: mapping.generatedColumn,
      source: source
    })

    if (generatedPosition.column != null && mapping.originalLine != null && mapping.originalColumn != null) {
      mergedGenerator.addMapping({
        source: mapping.source,

        original: mapping.source == null ? null : {
          line: mapping.originalLine,
          column: mapping.originalColumn
        },

        generated: generatedPosition
      })
    }
  })

  var mergedMap = mergedGenerator.toJSON()
  inputMap.mappings = mergedMap.mappings
  return inputMap
}
