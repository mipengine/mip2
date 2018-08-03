/**
 * @file build.spec.js
 * @author clark-t (clarktanglei@163.com)
 */

const path = require('path')
const {expect} = require('chai')
const execa = require('execa')
const fs = require('fs-extra')

const buildCmd = path.resolve(__dirname, '../../bin/mip2-build')
const projectDir = path.resolve(__dirname, '../mock/mock-mip-project')
const distDir = path.resolve(projectDir, 'dist')


describe('test build command', function () {
  describe('test env', function () {
    const distFilePath = path.resolve(distDir, 'mip-test-env/mip-test-env.js')

    beforeEach(async function () {
      await fs.remove(distDir)
    })

    it('test env default', async function () {
      this.timeout(5000)

      process.chdir(projectDir)
      await execa(buildCmd)
      let file = await fs.readFile(distFilePath, 'utf-8')

      expect(file).to.not.include('test env development')
      expect(file).to.include('test env production')
      expect(file).to.not.include('test env test')
    })

    it('test env test', async function () {
      this.timeout(5000)

      process.chdir(projectDir)
      await execa(buildCmd, ['-e', 'test'])
      let file = await fs.readFile(distFilePath, 'utf-8')

      expect(file).to.not.include('test env development')
      expect(file).to.not.include('test env production')
      expect(file).to.include('test env test')
    })
  })

  it('test proxy', async function () {
    this.timeout(5000)

    await fs.remove(distDir)
    process.chdir(projectDir)
    await execa(buildCmd)

    const distFilePath = path.resolve(distDir, 'mip-test-proxy/mip-test-proxy.js')
    let file = await fs.readFile(distFilePath, 'utf-8')

    expect(file).to.include('console.log("str with prefix http://www.baidu.com/")')
    expect(file).to.include('console.log("/proxy-to-local-path/ str with ext")')
    expect(file).to.include('console.log("http://www.baidu.com")')
  })

  after(async function () {
    await fs.remove(distDir)
  })
})
