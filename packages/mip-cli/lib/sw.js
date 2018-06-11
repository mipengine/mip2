/**
 * @file add mip component
 * @author tracy (qiushidev@gmail.com)
 */

const path = require('path')
const cli = require('./cli')
const workboxBuild = require('workbox-build')
const merge = require('deepmerge')
const fs = require('fs-extra')

module.exports = function generateSw (config) {
  const dist = path.resolve(process.cwd(), 'dist')
  const cmdOutput = config.options.output ? path.join(process.cwd(), config.options.output) : null
  const workboxCDN = 'https://gss0.baidu.com/9rkZbzqaKgQUohGko9WTAnF6hhy/assets/workbox-v3.2.0'

  let defaultConf = {
    cacheId: 'mip',
    globDirectory: dist,
    importScripts: [workboxCDN + '/workbox-sw.js'],
    globPatterns: [],
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
      // js css cache
      {
        urlPattern: /^http(s)?.*\.(js|css)$/,
        handler: 'networkFirst',
        options: {
          cacheName: 'mip-resource-cache',
          networkTimeoutSeconds: 3,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 7 * 24 * 60 * 60
          }
        }
      },
      // document cache
      {
        urlPattern: /^http(s)?.*\//,
        handler: 'networkFirst',
        options: {
          cacheName: 'mip-html-cache',
          // Configure which responses are considered cacheable.
          cacheableResponse: {
            headers: {'content-type': 'text/html'}
          }
        }
      }
    ]
  }

  // deep merge conf
  const workboxConf = merge(defaultConf, config.swConf)

  const buildSW = () => {
    return workboxBuild.generateSWString(workboxConf).then(({swString}) => {
      // set modulePathPrefix and inject into sw.js
      const setConfClause = `workbox.setConfig({modulePathPrefix: "${workboxCDN}"});`
      const outputSWString = swString.replace(/importScripts(.|\n)+workbox-sw\.js"\n\);/, `$&\n${setConfClause}`)

      const swDest = cmdOutput || path.join(dist, 'sw.js')

      fs.outputFileSync(swDest, outputSWString)

      cli.info(`Service Workder file generated at: ${swDest}`)
    })
  }

  buildSW()
}
