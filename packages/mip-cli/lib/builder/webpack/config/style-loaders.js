/**
 * @file style-loaders.js
 * @author clark-t (clarktanglei@163.com)
 */

/* eslint-disable */
// const {resolveModule} = require('../../../utils/helper');
/* eslint-enable */

const commonStyleLoaders = [
  require.resolve('vue-style-loader'),
  require.resolve('css-loader'),
  {
    loader: require.resolve('postcss-loader'),
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
      require.resolve('less-loader')
    ]
  },
  {
    test: /\.styl(us)?$/,
    use: [
      ...commonStyleLoaders,
      require.resolve('stylus-loader')
    ]
  },
  {
    test: /\.css$/,
    use: commonStyleLoaders
  }
]
