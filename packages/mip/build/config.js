const path = require('path')
const buble = require('rollup-plugin-babel')
const alias = require('rollup-plugin-alias')
const replace = require('rollup-plugin-replace')
const less = require('rollup-plugin-less')
const node = require('rollup-plugin-node-resolve')
const cjs = require('rollup-plugin-commonjs')
const version = process.env.VERSION || require('../package.json').version

const banner =
  '/*!\n' +
  ' * Mip.js v' + version + '\n' +
  ' * (c) 2016-' + new Date().getFullYear() + ' Baidu Inc\n' +
  ' * Released under the MIT License.\n' +
  ' */'

const aliases = require('./alias')
const resolve = p => {
  const base = p.split('/')[0]
  if (aliases[base]) {
    return path.resolve(aliases[base], p.slice(base.length + 1))
  } else {
    return path.resolve(__dirname, '../', p)
  }
}

const builds = {
  'mip-prod': {
    entry: resolve('mip'),
    dest: resolve('dist/mip.js'),
    format: 'umd',
    env: 'production',
    banner
  }
}

function genConfig (name) {
  const opts = builds[name]
  const config = {
    input: opts.entry,
    external: opts.external,
    plugins: [
      replace({
        __VERSION__: version
      }),
      less({
        output: resolve('dist/mip.css')
      }),
      buble(),
      node(),
      cjs(),
      alias(Object.assign({}, aliases, opts.alias))
    ].concat(opts.plugins || []),
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      name: opts.moduleName || 'MIP'
    }
  }

  if (opts.env) {
    config.plugins.push(replace({
      'process.env.NODE_ENV': JSON.stringify(opts.env)
    }))
  }

  Object.defineProperty(config, '_name', {
    enumerable: false,
    value: name
  })

  return config
}

if (process.env.TARGET) {
  module.exports = genConfig(process.env.TARGET)
} else {
  exports.getBuild = genConfig
  exports.getAllBuilds = () => Object.keys(builds).map(genConfig)
}
