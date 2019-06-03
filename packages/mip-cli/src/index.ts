import semver from 'semver'

export function checkVersion() {
  let isValidVersion: boolean
  isValidVersion = semver.lt('1.0.0', '1.0.1')
  console.log(isValidVersion)
}
