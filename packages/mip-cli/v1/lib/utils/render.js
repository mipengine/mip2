/**
 * @file 模板渲染器引擎
 * @author tracy(qiushidev@gmail.com)
 */

const etpl = require('etpl')
const engine = new etpl.Engine({
  commandOpen: '{%',
  commandClose: '%}',
  variableOpen: '{{',
  variableClose: '}}'
})

module.exports = {
  render (template, data) {
    const renderer = engine.compile(template)
    return renderer(data)
  }
}
