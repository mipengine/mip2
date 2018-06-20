/**
 * @file source-map.js
 * @author clark-t (clarktanglei@163.com)
 */

const sourceMap = require('source-map')
const splitRE = /\r?\n/g
const emptyRE = /^(?:\/\/)?\s*$/
// const MagicString = require('magic-string')

module.exports = {
  // copy from [uglify-loader](https://github.com/bestander/uglify-loader/blob/master/index.js)
  // and modify to async function

  async merge (map, inputMap) {
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
  },

  async prepend (prefix, source, {map, file, sourceRoot}) {
    if (map) {
      let consumer = await new sourceMap.SourceMapConsumer(map)
      let node = sourceMap.SourceNode.fromStringWithSourceMap(source, consumer)
      node.prepend(prefix)
      let result = node.toStringWithSourceMap()
      return {
        code: result.code,
        map: result.map.toJSON()
      }
    }

    let generator = new sourceMap.SourceMapGenerator({
      file,
      sourceRoot
    })

    generator.setSourceContent(file, source)
    let output = prefix + '\n' + source

    let prefixLen = prefix.split(splitRE).length
    output.split(splitRE).forEach((line, index) => {
      if (emptyRE.test(line)) {
        return
      }

      if (index < prefixLen) {
        generator.addMapping({
          source: file,
          original: {
            line: 1,
            column: 0
          },
          generated: {
            line: 1,
            column: index + 1
          }
        })
      } else {
        generator.addMapping({
          source: file,
          original: {
            line: index + 1 - prefixLen,
            column: 0
          },
          generated: {
            line: index + 1,
            column: 0
          }
        })
      }
    })

    return {
      code: output,
      map: generator.toJSON()
    }
  }
}
