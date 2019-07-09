/**
 * @file TS-loaders.js
 */
module.exports = function TSLoader (options) {
  return {
    loader: require.resolve('awesome-typescript-loader'),
    options: getLoaderOptions(options)
  }
}

function getLoaderOptions (options) {
  return {
    errorsAsWarning: options.env === 'development',
    forceIsolateModules: options.env === 'development',
    useCache: options.env === 'development',
    configFileName: require.resolve('./tsconfig.json')
  }
}
