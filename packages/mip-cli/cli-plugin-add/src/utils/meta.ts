/**
 * @file get meta.js config data from template
 * @author tracy(qiushidev@gmail.com)
 */

import path from 'path'
import { existsSync as exists } from 'fs'
import getGitUser from './git'

export interface Prompts {
  [key: string]: {
    default: string;
    type: string;
    message?: string;
    label?: string;
    validate?: (() => boolean | string);
  };
}

interface Meta {
  prompts: Prompts;
}

/**
 * Set the default value for a prompt question
 *
 * @param {Object} opts meta 信息
 * @param {string} key 键名
 * @param {string} val 键值
 */
function setDefault (opts: Meta, key: string, val: string) {
  const prompts = opts.prompts
  if (!prompts[key] || typeof prompts[key] !== 'object') {
    prompts[key] = {
      default: val,
      type: 'string'
    }
  } else {
    prompts[key].default = val
  }
}

export default function getMeta (dir: string) {
  const metajs = path.join(dir, 'meta.js')
  let opts: Meta = { prompts: {} }

  if (exists(metajs)) {
    const req = require(path.resolve(metajs))
    if (req !== Object(req)) {
      throw new Error('meta.js needs to expose an object')
    }
    opts = req
  }

  const author = getGitUser()
  if (author) {
    setDefault(opts, 'author', author)
  }

  return opts
}
