/**
 * @file helper.js
 * @author clark-t (clarktanglei@163.com)
 */

import glob from 'glob'
import pify from 'pify'

export default function globPify (pattern: string, options?: glob.IOptions): Promise<string[]> {
  return pify(glob)(pattern, options)
}
