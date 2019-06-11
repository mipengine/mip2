/**
 * @file 获取 git user
 * @author tracy(qiushidev@gmail.com)
 */

import { execSync as exec } from 'child_process'

export default function getGitUser () {
  let name
  let email

  try {
    name = exec('git config --get user.name')
    email = exec('git config --get user.email')
  } catch (e) {}

  name = name && JSON.stringify(name.toString().trim()).slice(1, -1)
  email = email && (' (' + email.toString().trim() + ')')
  return (name || '') + (email || '')
}
