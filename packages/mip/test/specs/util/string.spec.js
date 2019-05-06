import {camelize, capitalize, hyphenate} from 'src/util/string'

describe('camelize', () => {
  it('should transform dash-case string to camelCase', () => {
    expect(camelize('foo')).to.equal('foo')
    expect(camelize('foo-bar')).to.equal('fooBar')
    expect(camelize('foo-bar-baz')).to.equal('fooBarBaz')
  })
})

describe('capitalize', () => {
  it('should transform camelCase string to PascalCase', () => {
    expect(capitalize('foo')).to.equal('Foo')
    expect(capitalize('fooBar')).to.equal('FooBar')
    expect(capitalize('fooBarBaz')).to.equal('FooBarBaz')
  })
})

describe('hyphenate', () => {
  it('should transform camelCase string to dash-case', () => {
    expect(hyphenate('foo')).to.equal('foo')
    expect(hyphenate('fooBar')).to.equal('foo-bar')
    expect(hyphenate('fooBarBaz')).to.equal('foo-bar-baz')
  })
})
