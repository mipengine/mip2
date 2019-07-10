import fs from 'fs-extra'
import path from 'path'
import merge from 'deepmerge'
import workboxBuild from 'workbox-build'
import { logger, Params } from 'mip-cli-utils'

type SWResult = workboxBuild.SWResult

export default function (config: Params) {
  let configPath = path.resolve(process.cwd(), config.options.config as string || 'mip.config.js')

  let swConf = {}
  if (fs.existsSync(configPath)) {
    swConf = require(configPath).serviceWorker || {}
  }

  let outputPath = config.options.output as string
  if (outputPath && path.extname(outputPath) !== '.js') {
    logger.error('请检查 output 文件路径，如 ./dist/sw.js')
    return
  }

  const cmdOutput = outputPath ? path.join(process.cwd(), outputPath) : null
  const dist = path.resolve(process.cwd(), 'dist')

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
  const workboxConf = merge(defaultConf, swConf)

  const buildSW = () => {
    return workboxBuild.generateSWString(workboxConf).then(({ swString }: SWResult) => {
      // set modulePathPrefix and inject into sw.js
      const setConfClause = `workbox.setConfig({modulePathPrefix: "${workboxCDN}"});`
      const outputSWString = swString.replace(/importScripts(.|\n)+workbox-sw\.js"\n\);/, `$&\n${setConfClause}`)

      const swDest = cmdOutput || path.join(dist, 'sw.js')

      fs.outputFileSync(swDest, outputSWString)

      logger.info(`Service Workder file generated at: ${swDest}`)
    })
  }

  buildSW()
}
