/**
 * @file compat.js
 * @author clark-t (clarktanglei@163.com)
 */

const semver = require('semver')
const requiredNodeVersion = require('../../package').engines.node

if (!semver.satisfies(process.version, requiredNodeVersion)) {
  require('babel-register')({
    babelrc: false,
    ignore: /node_modules\/(?!(mip-component-validator|mip-cli-|koa))/,
    presets: [
      [
        require.resolve('babel-preset-env'),
        {
          // modules: false,
          targets: {
            node: 'current'
          }
        }
      ],
      require.resolve('babel-preset-stage-2')
    ],
    plugins: [
      [
        require.resolve('babel-plugin-transform-runtime'),
        {
          helpers: true,
          polyfill: true,
          regenerator: true,
          moduleName: 'babel-runtime'
        }
      ]
    ]
  })
  // console.log(cli.chalk.red(
  //   `You are using Node ${process.version}, but this version of mip-cli ` +
  //       `requires Node ${requiredNodeVersion}.\nPlease upgrade your Node version.`
  // ))
  // process.exit(1)
}
