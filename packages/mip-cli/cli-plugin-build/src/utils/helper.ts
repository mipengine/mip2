/**
 * @file helper.ts
 * @author clark-t (clarktanglei@163.com)
 */

import path from 'path'
import fs from 'fs-extra'
import glob from 'glob'
import pify from 'pify'

export function noop () {}

interface AsyncSome {
  <T1, T2, T3, T4, T5>(promises: [Promise<T1>, Promise<T2>, Promise<T3>, Promise<T4>, Promise<T5>]): Promise<T1 | T2 | T3 | T4 | T5>;
  <T1, T2, T3, T4>(promises: [Promise<T1>, Promise<T2>, Promise<T3>, Promise<T4>]): Promise<T1 | T2 | T3 | T4>;
  <T1, T2, T3>(promises: [Promise<T1>, Promise<T2>, Promise<T3>]): Promise<T1 | T2 | T3>;
  <T1, T2>(promises: [Promise<T1>, Promise<T2>]): Promise<T1 | T2>;
  <T>(promises: Promise<T>[]): Promise<T>;
}

export const asyncSome:AsyncSome = (promises: Promise<any>[]) => {
  return new Promise((resolve, reject) => {
    let maxLength = promises.length
    let failCounter = 0
    const errorCallback = (err: Error) => {
      if (++failCounter === maxLength) {
        reject(err)
      }
    }

    for (let i = 0; i < maxLength; i++) {
      promises[i].then(resolve).catch(errorCallback)
    }
  })
}


export function resolvePath (possiblePaths: string[]) {
  const promises = possiblePaths.map(
    (pathname: string) =>
      fs.pathExists(pathname).then(
        (result: boolean) => (
          result
            ? Promise.resolve(pathname)
            : Promise.reject('not found.')
        )
      )
    )

  return asyncSome(promises).catch(noop)
}

type PifyFn = Parameters<typeof pify>[0]
type PifyOptions = NonNullable<Parameters<typeof pify>[1]>

export function globPify (fn: PifyFn, opts?: PifyOptions) {
  return pify(glob)(fn, opts)
}

export function objectSubset<T extends {}, K extends keyof T>(obj: T, names: K[]) {
  let result: Partial<Record<K, T[K]>> = {}
  for (let name of names) {
    if (obj[name] !== undefined) {
      result[name] = obj[name]
    }
  }
  return result as Record<K, T[K]>
}

export function pathFormat (pathname: string, shouldRemoveExt = true) {
  pathname = pathname.replace(/\\/g, '/')
  if (!shouldRemoveExt) {
    return pathname
  }
  return removeExt(pathname)
}

export function removeExt (pathname: string) {
  let ext = path.extname(pathname)
  if (ext === '') {
    return pathname
  }
  return pathname.slice(0, -ext.length)
}


