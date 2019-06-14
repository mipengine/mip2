/**
 * @file get-entries.ts
 * @author clark-t (clarktanglei@163.com)
 */
import {
  globPify,
  GlobOptions
} from 'mip-cli-utils'

import path from 'path'

export async function globEntries (root: string) {
  let globOpts: GlobOptions = {
    cwd: root,
    root: root
  }

  let components = await globPify('mip-*/mip-*.@(vue|js|ts)', globOpts)
  components = components.filter((name: string) => /(mip-[\w-]+\/\1\.(vue|js|ts)$/.test(name))

  let entries: Record<string, string> = {}

  entries = components.reduce((entries, pathname) => {
    let basename = path.basename(pathname, path.extname(pathname))
    entries[`${basename}/${basename}`] = path.resolve(root, pathname)
    return entries
  }, entries)

  return entries
}

// export async function getEntries )



