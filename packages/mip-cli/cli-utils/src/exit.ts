/**
 * @file exit.ts
 * @author clark-t (clarktanglei@163.com)
 */
import { logger } from './logger'

export function exit (...msgs: any[]) {
  if (msgs.length) {
    logger.error(...msgs)
  }
  process.exit(1)
}

