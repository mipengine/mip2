/**
 * @file helper.js
 * @author clark-t (clarktanglei@163.com)
 */

import glob from 'glob'

function pify (fn: Function) {
  return (...args: (string| object)[]): Promise<string[]> => new Promise((resolve, reject) => {
    let callback = (err: Error | null, result: string[]) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    }

    fn(...args, callback)
  })
}

export function globPify (...args: (string| object)[]): Promise<string[]> {
  return pify(glob)(...args)
}
