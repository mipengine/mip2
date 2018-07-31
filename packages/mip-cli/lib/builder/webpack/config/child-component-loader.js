/**
 * @file child-component-loader.js
 * @author clark-t (clarktanglei@163.com)
 */
const projectPath = require('../../../utils/project-path')
const {globPify} = require('../../../utils/helper')
const path = require('path')
const sourceMap = require('../../../utils/source-map')

module.exports = async function (source, map, meta) {
  this.cacheable(true)
  let callback = this.async()

  if (!projectPath.isComponentPath(this.rootContext, this.resourcePath)) {
    return callback(null, source, map, meta)
  }

  this.addContextDependency(this.context)

  let basename = path.basename(this.resourcePath)
  let name = path.basename(basename, path.extname(basename))

  let components = await globPify(`${name}*.@(vue|js)`, {
    cwd: this.context,
    root: this.context
  }).then(arr => arr.filter(name => name !== basename))

  if (!components.length) {
    return callback(null, source, map, meta)
  }

  let imports = components.map(component => {
    let basename = path.basename(component, path.extname(component))
    let name = `__mip_child_component_${basename.replace(/-/g, '_')}`

    // 由于在初始渲染的时候子组件先渲染父组件后渲染可能会导致数据丢失，因此需要先注册父组件再注册子组件
    return `
    import ${name} from './${basename}'
    MIP[typeof ${name} === 'function' ? 'registerCustomElement' : 'registerVueCustomElement']('${basename}', ${name})
    `
  }).join('\n')

  let {code: newCode, map: newMap} = await sourceMap.prepend(
    imports,
    source,
    {
      map,
      file: basename,
      sourceRoot: this.context
    }
  )

  return callback(null, newCode, newMap)
}
