/**
 * @file 模板渲染器引擎
 * @author tracy(qiushidev@gmail.com)
 */

import etpl from 'etpl'
const engine = new etpl.Engine({
  commandOpen: '{%',
  commandClose: '%}',
  variableOpen: '{{',
  variableClose: '}}'
})

export default function render (template: string, data: object) {
  const renderer = engine.compile(template)
  return renderer(data)
}
