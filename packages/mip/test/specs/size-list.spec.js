import {SizeList, parseSizeList} from 'src/size-list'

/* eslint-disable no-new */
describe('SizeList parseSizeList', () => {
  it('should accept single option', () => {
    const res = parseSizeList(' \n 111px \n ')
    expect(res._sizes.length).to.equal(1)
    expect(res._sizes[0].mediaQuery).to.equal(undefined)
    expect(res._sizes[0].size).to.equal('111px')
  })

  it('should accept multiple options', () => {
    const res = parseSizeList(' \n print 222px \n, 111px \n')
    expect(res._sizes.length).to.equal(2)
    expect(res._sizes[0].mediaQuery).to.equal('print')
    expect(res._sizes[0].size).to.equal('222px')
    expect(res._sizes[1].mediaQuery).to.equal(undefined)
    expect(res._sizes[1].size).to.equal('111px')
  })

  it('should accept even more multiple options', () => {
    const res = parseSizeList(' \n screen 333px, print 222px \n, 111px \n')
    expect(res._sizes.length).to.equal(3)
    expect(res._sizes[0].mediaQuery).to.equal('screen')
    expect(res._sizes[0].size).to.equal('333px')
    expect(res._sizes[1].mediaQuery).to.equal('print')
    expect(res._sizes[1].size).to.equal('222px')
    expect(res._sizes[2].mediaQuery).to.equal(undefined)
    expect(res._sizes[2].size).to.equal('111px')
  })

  it('should accept complicated media conditions', () => {
    const res = parseSizeList(
      ' \n screen and (min-width: 1000px) \t ' +
      ' and    (max-width: 2000px) 222px \n,' +
      ' 111px \n')
    expect(res._sizes.length).to.equal(2)
    expect(res._sizes[0].mediaQuery).to.equal(
      'screen and (min-width: 1000px) and (max-width: 2000px)')
    expect(res._sizes[0].size).to.equal('222px')
    expect(res._sizes[1].mediaQuery).to.equal(undefined)
    expect(res._sizes[1].size).to.equal('111px')
  })

  it('should accept different length units', () => {
    const res = parseSizeList(' \n 111vw \n ')
    expect(res._sizes.length).to.equal(1)
    expect(res._sizes[0].mediaQuery).to.equal(undefined)
    expect(res._sizes[0].size).to.equal('111vw')
  })

  it('should accept fractional numbers', () => {
    const res = parseSizeList(' \n 11.1vw \n ')
    expect(res._sizes.length).to.equal(1)
    expect(res._sizes[0].mediaQuery).to.equal(undefined)
    expect(res._sizes[0].size).to.equal('11.1vw')
  })

  it('should accept CSS functions', () => {
    const res = parseSizeList('screen calc(111vw + 10px) \n' +
      ', ca_1-C((50vw+20px) / 2) ')
    expect(res._sizes.length).to.equal(2)
    expect(res._sizes[0].mediaQuery).to.equal('screen')
    expect(res._sizes[0].size).to.equal('calc(111vw + 10px)')
    expect(res._sizes[1].mediaQuery).to.be.undefined
    expect(res._sizes[1].size).to.equal('ca_1-C((50vw+20px) / 2)')
  })

  it('should tolerate right paren', () => {
    const res = parseSizeList('(min-width:2000px)calc(11px)' +
      ',(min-width:1000px)11px,12px')
    expect(res._sizes.length).to.equal(3)
    expect(res._sizes[0].mediaQuery).to.equal('(min-width:2000px)')
    expect(res._sizes[0].size).to.equal('calc(11px)')
    expect(res._sizes[1].mediaQuery).to.equal('(min-width:1000px)')
    expect(res._sizes[1].size).to.equal('11px')
    expect(res._sizes[2].mediaQuery).to.be.undefined
    expect(res._sizes[2].size).to.equal('12px')
  })

  it('should fail on invalid CSS functions', () => {
    // Spaces are not allowed between function name and `(`.
    expect(() => {
      parseSizeList('screen calc (111vw + 10px) \n, 10px ')
    }).to.throw(/Invalid CSS function/)

    // Parens don't match.
    expect(() => {
      parseSizeList('screen calc(111vw + 10px)) \n, 10px ')
    }).to.throw(/Invalid CSS function/)

    expect(() => {
      parseSizeList('screen calc((111vw + 10px) \n, 10px ')
    }).to.throw(/Invalid CSS function/)
  })

  it('should accept percent when allowed', () => {
    const res = parseSizeList(' \n 111% \n ',
      /* allowPercent */ true)
    expect(res._sizes.length).to.equal(1)
    expect(res._sizes[0].mediaQuery).to.equal(undefined)
    expect(res._sizes[0].size).to.equal('111%')
  })

  it('should not accept percent', () => {
    expect(() => {
      parseSizeList(' \n 111% \n ', /* allowPercent */ false)
    }).to.throw(/Invalid length value/)
  })

  it('should fail bad length', () => {
    expect(() => {
      parseSizeList(' \n 111 \n ')
    }).to.throw(/Invalid length value/)

    expect(() => {
      parseSizeList(' \n 111x% \n ', /* allowPercent */ true)
    }).to.throw(/Invalid length or percent value/)
  })
})

describe('SizeList construct', () => {
  it('should have at least one option', () => {
    expect(() => {
      new SizeList([])
    }).to.throw(/SizeList must have at least one option/)
  })

  it('the last option must not have a query', () => {
    expect(() => {
      new SizeList([{
        mediaQuery: 'screen',
        size: '111px'
      }])
    }).to.throw(/The last option must not have a media condition/)

    expect(() => {
      new SizeList([{
        mediaQuery: 'print',
        size: '222px'
      },
      {
        mediaQuery: 'screen',
        size: '111px'
      }
      ])
    }).to.throw(/The last option must not have a media condition/)
  })

  it('non-last options must have media query', () => {
    expect(() => {
      new SizeList([{
        size: '222px'
      }, {
        size: '111px'
      }])
    }).to.throw(
      /All options except for the last must have a media condition/)
  })
})

describe('SizeList select', () => {
  it('should select default last option', () => {
    const sizeList = new SizeList([{
      mediaQuery: 'media1',
      size: '444px'
    },
    {
      mediaQuery: 'media2',
      size: '333px'
    },
    {
      mediaQuery: 'media3',
      size: '222px'
    },
    {
      size: '111px'
    }
    ])
    expect(sizeList.select({
      matchMedia: () => {
        return {}
      }
    })).to.equal('111px')
  })

  it('should select a matching option', () => {
    const sizeList = new SizeList([
      {
        mediaQuery: 'media1',
        size: '444px'
      },
      {
        mediaQuery: 'media2',
        size: '333px'
      },
      {
        mediaQuery: 'media3',
        size: '222px'
      },
      {
        size: '111px'
      }
    ])
    expect(sizeList.select({
      matchMedia: mq => {
        if (mq === 'media2') {
          return {
            matches: true
          }
        }
        return {}
      }
    })).to.equal('333px')
  })

  it('should select first matching option', () => {
    const sizeList = new SizeList([{
      mediaQuery: 'media1',
      size: '444px'
    },
    {
      mediaQuery: 'media2',
      size: '333px'
    },
    {
      mediaQuery: 'media3',
      size: '222px'
    },
    {
      size: '111px'
    }
    ])
    expect(sizeList.select({
      matchMedia: mq => {
        if (mq === 'media1' || mq === 'media2') {
          return {
            matches: true
          }
        }
        return {}
      }
    })).to.equal('444px')
  })
})
