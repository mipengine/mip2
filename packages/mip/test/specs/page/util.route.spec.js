/**
 * @file page.util.route spec file
 * @author panyuqi(panyuqi@baidu.com)
 */

import {
  normalizeLocation,
  isSameRoute,
  START,
  isOnlyDifferentInHash,
  createRoute
} from 'src/page/util/route'

/* eslint-disable no-unused-expressions */
/* globals describe, it, expect */

describe('route', function () {
  it('.normalizeLocation', function () {
    // empty query & hash
    let rawUrl = {
      path: '/'
    }
    let current = {
      origin: window.location.origin
    }
    expect(normalizeLocation(rawUrl, current)).to.deep.equal({
      origin: current.origin,
      path: '/',
      query: {},
      hash: '',
      meta: {},
      fullPath: current.origin + '/'
    })

    // empty path & hash
    rawUrl = {
      path: '',
      hash: 'myhash'
    }
    current = {
      origin: window.location.origin
    }
    expect(normalizeLocation(rawUrl, current)).to.deep.equal({
      origin: current.origin,
      path: '/',
      query: {},
      hash: '#myhash',
      meta: {},
      fullPath: current.origin + '/#myhash'
    })
  })

  it('.isSameRoute', function () {
    expect(isSameRoute(START, START)).to.be.true

    // invalid input
    expect(isSameRoute(START)).to.be.false

    // different origin
    expect(isSameRoute({ origin: 'a.com' }, { origin: 'b.com' })).to.be.false

    // different path
    expect(isSameRoute({
      origin: 'a.com',
      path: '/'
    }, {
      origin: 'a.com',
      path: '/path'
    })).to.be.false

    // same origin but empty path
    expect(isSameRoute({
      origin: 'a.com',
      path: '/'
    }, {
      origin: 'a.com'
    })).to.be.false

    // different hash
    expect(isSameRoute({
      origin: 'a.com',
      path: '/path',
      hash: '#myhash'
    }, {
      origin: 'a.com',
      path: '/path',
      hash: '#myhash2'
    })).to.be.false

    // different query # empty string
    expect(isSameRoute({
      origin: 'a.com',
      path: '/path',
      hash: '#myhash',
      query: ''
    }, {
      origin: 'a.com',
      path: '/path',
      hash: '#myhash',
      query: null
    })).to.be.false

    // different query # different length
    expect(isSameRoute({
      origin: 'a.com',
      path: '/path',
      hash: '#myhash',
      query: {
        a: 1,
        b: 1
      }
    }, {
      origin: 'a.com',
      path: '/path',
      hash: '#myhash',
      query: {
        a: 2
      }
    })).to.be.false

    // different query # different value
    expect(isSameRoute({
      origin: 'a.com',
      path: '/path',
      hash: '#myhash',
      query: {
        a: 1
      }
    }, {
      origin: 'a.com',
      path: '/path',
      hash: '#myhash',
      query: {
        a: 2
      }
    })).to.be.false

    // different query # nested object
    expect(isSameRoute({
      origin: 'a.com',
      path: '/path',
      hash: '#myhash',
      query: {
        a: {
          b: 1
        }
      }
    }, {
      origin: 'a.com',
      path: '/path',
      hash: '#myhash',
      query: {
        a: {
          b: 2
        }
      }
    })).to.be.false
  })

  it('.isOnlyDifferentInHash', function () {
    expect(isOnlyDifferentInHash(START, START)).to.be.true

    // invalid input
    expect(isOnlyDifferentInHash(START)).to.be.false

    // different origin
    expect(isOnlyDifferentInHash({ origin: 'a.com' }, { origin: 'b.com' })).to.be.false

    // different path
    expect(isOnlyDifferentInHash({
      origin: 'a.com',
      path: '/'
    }, {
      origin: 'a.com',
      path: '/path'
    })).to.be.false

    // same origin but empty path
    expect(isOnlyDifferentInHash({
      origin: 'a.com',
      path: '/'
    }, {
      origin: 'a.com'
    })).to.be.false

    // different hash
    expect(isOnlyDifferentInHash({
      origin: 'a.com',
      path: '/path',
      hash: '#myhash'
    }, {
      origin: 'a.com',
      path: '/path',
      hash: '#myhash2'
    })).to.be.true
  })

  it('.createRoute', function () {
    // create Route with window.location
    expect(createRoute(window.location)).to.deep.equal({
      origin: window.location.origin,
      path: window.location.pathname,
      query: {},
      hash: '',
      meta: {},
      fullPath: window.location.origin + window.location.pathname
    })
  })
})
