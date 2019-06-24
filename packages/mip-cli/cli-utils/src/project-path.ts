/**
 * @file project-path.ts
 * @author clark-t (clarktanglei@163.com)
 */

import path from 'path'
import { getFileName } from './helper'

function getComponentsDir (rootDir: string) {
  return path.resolve(rootDir, 'components')
}

function getExampleDir (rootDir: string) {
  return path.resolve(rootDir, 'example')
}

function getComponentDir (rootDir: string, componentName: string) {
  return path.resolve(rootDir, componentName)
}

function getComponentExampleDir (rootDir: string, componentName: string) {
  return path.resolve(rootDir, componentName, 'example')
}

function isComponent (pathname: string) {
  // 组件入口文件必须要求以 mip-example/mip-example.js 的这种形式来区别其他组件
  return /(mip-[\w-]+)\/\1\.(vue|js|ts)$/.test(pathname)
}

function isExampleComponent (rootDir: string, pathname: string) {
  if (!isComponent(pathname)) {
    return false
  }

  return path.resolve(
    getExampleDir(rootDir),
    getFileName(pathname),
    path.basename(pathname)
  ) === path.resolve(pathname)
}

function isMainComponent (rootDir: string, pathname: string) {
  if (!isComponent(pathname)) {
    return false
  }

  return path.resolve(
    getComponentsDir(rootDir),
    getFileName(pathname),
    path.basename(pathname),
  ) === path.resolve(pathname)
}

function isChildComponent (mainComponentPath: string, childComponentPath: string) {
  if (!isComponent(mainComponentPath)) {
    return false
  }

  if (path.dirname(mainComponentPath) !== path.dirname(childComponentPath)) {
    return false
  }

  let mainFileName = getFileName(mainComponentPath)
  let childFileName = getFileName(childComponentPath)

  return childFileName.slice(0, mainFileName.length + 1) === mainFileName + '-'
}

export default {
  getComponentsDir,
  getExampleDir,
  getComponentExampleDir,
  getComponentDir,
  isComponent,
  isExampleComponent,
  isMainComponent,
  isChildComponent
}

