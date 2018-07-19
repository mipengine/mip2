/**
 * @file page.util.path spec file
 * @author panyuqi(panyuqi@baidu.com)
 */

import { parsePath, resolvePath } from 'src/page/util/path'

/* eslint-disable no-unused-expressions */
/* globals describe, it, expect */

describe('path', function () {
  it('.parsePath', function () {
    expect(parsePath('/path?a=1&b=2#myhash')).to.deep.equal({
      path: '/path',
      query: 'a=1&b=2',
      hash: '#myhash'
    })
  })

  it('.resolvePath', function () {
    // relative to root path
    expect(resolvePath('/path')).to.be.equal('/path')

    // append query to base
    expect(resolvePath('?a=1', '/path')).to.be.equal('/path?a=1')

    // append hash to base
    expect(resolvePath('#myhash', '/path')).to.be.equal('/path#myhash')

    // empty base
    expect(resolvePath('./segment/index.html', ''))
      .to.be.equal('/segment/index.html')

    // base trailing slash
    expect(resolvePath('./segment/index.html', '/base', true))
      .to.be.equal('/base/segment/index.html')

    // base + relative
    expect(resolvePath('./segment/index.html', '/base/', true))
      .to.be.equal('/base/segment/index.html')

    // base + relative
    expect(resolvePath('./segment/index.html', '/base/'))
      .to.be.equal('/base/segment/index.html')

    // base + relative
    expect(resolvePath('../segment/index.html', '/base/path/'))
      .to.be.equal('/base/segment/index.html')
  })
})
