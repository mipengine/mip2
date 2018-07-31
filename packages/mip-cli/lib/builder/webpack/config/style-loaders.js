/**
 * @file style-loaders.js
 * @author clark-t (clarktanglei@163.com)
 */

/* eslint-disable */
const {resolveModule} = require('../../../utils/helper');
/* eslint-enable */

const commonStyleLoaders = [
  resolveModule('vue-style-loader'),
  resolveModule('css-loader'),
  {
    loader: resolveModule('postcss-loader'),
    options: {
      ident: 'postcss',
      plugins: [
        require('autoprefixer')({
          browsers: [
            '> 1%',
            'last 2 versions',
            'ie 9-10'
          ]
        })
      ]
    }
  }
]

module.exports = [
  {
    test: /\.less$/,
    use: [
      ...commonStyleLoaders,
      resolveModule('less-loader')
    ]
  },
  {
    test: /\.css$/,
    use: commonStyleLoaders
  }
]
