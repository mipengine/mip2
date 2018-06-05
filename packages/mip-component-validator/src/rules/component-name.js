/**
 * @file component-name
 * @author liwenqian
 * @desc 组件名称规则
 */

module.exports = {
  name: 'component-name',
  exec (file, reporter) {
    let regex = new RegExp(/^mip-[\w-]+.vue$/)
    if (!file.name.match(regex)) {
      reporter.error(file.path, '组件名称不符合命名规范')
    }
  }
}
