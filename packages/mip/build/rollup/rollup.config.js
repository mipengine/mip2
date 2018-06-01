/**
 * @file rollup.config.js
 * @author sfe-sy (sfe-sy@baidu.com)
 */

const path = require('path')
const babel = require('rollup-plugin-babel')
const alias = require('rollup-plugin-alias')
const cjs = require('rollup-plugin-commonjs')
const replace = require('rollup-plugin-replace')
const node = require('rollup-plugin-node-resolve')
const async = require('rollup-plugin-async')
const vue = require('rollup-plugin-vue').default
const css = require('rollup-plugin-css-only')
const uglify = require('rollup-plugin-uglify')
const version = process.env.VERSION || require('../package.json').version
const aliases = require('./alias')
const fs = require('fs-extra')
const autoprefixer = require('autoprefixer')
const csso = require('postcss-csso')
const banner = '/* mip */'

const resolve = p => {
  const base = p.split('/')[0]
  if (aliases[base]) {
    return path.resolve(aliases[base], p.slice(base.length + 1))
  }

  return path.resolve(__dirname, '../', p)
}

const builds = {
  // Runtime+compiler development build (Browser)
  'web-full-dev': {
    entry: resolve('src/index.dev.js'),
    dest: resolve('dist/mip.js'),
    format: 'umd',
    env: 'development',
    alias: {
      he: './entity-decoder'
    },
    banner,
    plugins: [
      node({
        jsNext: true,
        main: true,
        browser: true
      }),
      cjs(),
      css({
        include: '**/*.css?*',
        output: resolve('dist/mip.css')
      }),
      vue({
        css: false
      })
    ]
  },
  'web-full-prod': {
    entry: resolve('src/index.js'),
    dest: resolve('dist/mip.min.js'),
    format: 'umd',
    env: 'production',
    alias: {
      he: './entity-decoder'
    },
    banner,
    plugins: [
      node({
        jsNext: true,
        main: true,
        browser: true
      }),
      cjs(),
      css({
        include: '**/*.css?*',
        output: resolve('dist/mip.css')
      }),
      vue({
        css: false,
        style: {
          // preprocessOptions: {
          //     less: {
          //         compress: true,
          //         relativeUrls: true
          //     }
          // },
          postcssPlugins: [
            autoprefixer({
              browsers: [
                '> 1%',
                'last 2 versions',
                'ie 9-10'
              ]
            }),
            csso()
          ]
        }
      }),
      uglify()
    ]
  },
  'router': {
    entry: resolve('src/router/index.js'),
    dest: resolve('dist/router.min.js'),
    format: 'umd',
    env: 'production',
    alias: {
      he: './entity-decoder'
    },
    banner,
    plugins: [
      node({
        jsNext: true,
        main: true,
        browser: true
      }),
      cjs(),
      uglify()
    ]
  },
  'store': {
    entry: resolve('src/vuex/index.js'),
    dest: resolve('dist/vuex.min.js'),
    format: 'umd',
    env: 'production',
    alias: {
      he: './entity-decoder'
    },
    banner,
    plugins: [
      node({
        jsNext: true,
        main: true,
        browser: true
      }),
      cjs(),
      uglify()
    ]
  }
}

function genConfig (name) {
  let distPath = path.resolve(__dirname, '..', 'dist')
  if (!fs.existsSync(distPath)) {
    fs.mkdirp(distPath)
  }
  const opts = builds[name]
  const config = {
    input: opts.entry,
    external: opts.external,
    plugins: (opts.plugins || []).concat(...[
      replace({
        __VERSION__: version
      }),

      async(),
      babel(),
      alias(Object.assign({}, aliases, opts.alias))
    ]),
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      name: opts.moduleName || 'mip'
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
