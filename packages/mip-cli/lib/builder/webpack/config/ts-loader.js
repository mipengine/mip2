/**
 * @file TS-loaders.js
 */
module.exports = function getLoaderUse (options) {
  return {
    errorsAsWarning: options.env === 'development',
    forceIsolateModules: options.env === 'development',
    useCache: options.env === 'development',
    configFileName: require.resolve('./tsconfig.json')
  }
}
