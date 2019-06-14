/**
 * @file TS-loaders.js
 */
module.exports = function getTSLoader (isSandbox, options) {
  const use = isSandbox
    ? [
      {
        loader: require.resolve('awesome-typescript-loader'),
        options: getLoaderOptions(options)
      },
      require.resolve('./child-component-loader')
    ]
    : [
      {
        loader: require.resolve('awesome-typescript-loader'),
        options: getLoaderOptions(options)
      },
      require.resolve('./sandbox-loader'),
      require.resolve('./child-component-loader')
    ]
  return use
}

function getLoaderOptions (options) {
  return {
    errorsAsWarning: options.env === 'development',
    forceIsolateModules: options.env === 'development',
    useCache: options.env === 'development',
    configFileName: require.resolve('./tsconfig.json')
  }
}
