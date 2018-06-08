/**
 * @file sandbox-loader
 * @author clark-t (clarktanglei@163.com)
 */

const generate = require('mip-sandbox/lib/generate')
const path = require('path')
const sourceMap = require('source-map')

module.exports = async function (source, map, meta) {
  this.cacheable = true
  let callback = this.async()

  try {
    let output = generate(source, {
      sourceMapWithCode: true,
      sourceMap: path.basename(this.resourcePath),
      sourceMapRoot: path.relative(this.rootContext, this.context),
      sourceContent: source
    })

    let newMap = JSON.parse(output.map.toString())
    let outputMap

    if (map) {
      outputMap = mergeSourceMap(newMap, map)
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
    if (generatedPosition.column != null) {
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
