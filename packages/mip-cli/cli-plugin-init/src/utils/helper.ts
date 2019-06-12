/**
 * @file helper.js
 * @author clark-t (clarktanglei@163.com)
 */

import glob from 'glob'
import { promisify } from 'util'

export default function globPify (pattern: string, options?: glob.IOptions) {
  return promisify(glob)(pattern, options)
}
