/**
 * @file rollup config file
 * @author mj(zoumiaojiang@gmail.com)
 */

const path = require('path')
const babel = require('rollup-plugin-babel')
const alias = require('rollup-plugin-alias')
const replace = require('rollup-plugin-replace')
const node = require('rollup-plugin-node-resolve')
const cjs = require('rollup-plugin-commonjs')
const postcss = require('rollup-plugin-postcss2')
const version = process.env.VERSION || require('../package.json').version

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
    intro: 'window._mipStartTiming=Date.now();'
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
      postcss({
        extract: resolve('dist/mip.css'),
        inject: false,
        minimize: {
          safe: true
        },
        extensions: ['.less', '.css'],
        config: true
      }),
      alias(Object.assign({}, aliases, opts.alias)),
      node(),
      cjs(
        {
          include: 'node_modules/**'
        }
      ),
      babel({
        plugins: ['external-helpers']
      })
    ].concat(opts.plugins || []),
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      intro: opts.intro,
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
