import Services, {installTimerService, Timer} from 'src/services'

describe('timer', () => {
  /**
   * @type {sinon.SinonSandbox}
   */
  let sandbox

  /**
   * @type {Timer}
   */
  let timer

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    window.services = null
    installTimerService(window)
    timer = Services.timerFor(window)
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should return timer service', () => {
    expect(timer).instanceOf(Timer)
  })

  it('should return time since start', (done) => {
    expect(timer.startTime).to.gt(0)
    setTimeout(() => {
      const t1 = timer.timeSinceStart()
      setTimeout(() => {
        const t2 = timer.timeSinceStart()
        expect(t1).to.gte(100)
        expect(t2).to.gte(200)
        expect(t2).to.gt(t1)
        done()
      }, 100)
    }, 100)
  })

  it('should exceute callback in microtask', async () => {
    const callback = sinon.spy()
    timer.resolved.then = sinon.spy(timer.resolved.then)
    await timer.then(callback)
    expect(callback).to.be.calledOnce
    expect(timer.resolved.then).to.be.calledOnce
  })

  it('should be a cancellable microtask', (done) => {
    timer.resolved.then = sinon.spy(timer.resolved.then)
    expect(timer.cancelableThen(done)).to.equal('1')
    expect(timer.resolved.then).to.be.calledOnce
  })

  it('should not exceute callback in micro task', (done) => {
    const callback = sinon.spy()
    const timeoutId = timer.cancelableThen(callback)
    expect(timer.canceled[timeoutId]).to.be.undefined
    timer.cancel(timeoutId)
    expect(timer.canceled[timeoutId]).to.be.true
    setTimeout(() => {
      expect(callback).to.not.be.called
      expect(timer.canceled[timeoutId]).to.be.undefined
      done()
    })
  })

  it('should delay with `setTimeout`', (done) => {
    window.setTimeout = sinon.spy(setTimeout)
    expect(timer.delay(done, 100)).to.be.a('number')
    expect(setTimeout).to.be.calledOnce
    expect(setTimeout.args[0][1]).to.equal(100)
  })

  it('should cancel with `clearTimeout`', (done) => {
    window.clearTimeout = sinon.spy(clearTimeout)
    const callback = sinon.spy()
    const timeoutId = timer.delay(callback, 1)
    timer.cancel(timeoutId)
    expect(clearTimeout).to.be.calledWith(timeoutId)
    setTimeout(() => {
      expect(callback).to.not.be.called
      done()
    }, 200)
  })

  it('should sleep by calling delay', async () => {
    timer.delay = sinon.spy(timer.delay)
    await timer.sleep(100)
    expect(timer.delay.args[0][1]).to.equal(100)
  })

  it('should reject after timeout', () => {
    return timer.timeout(100).then(() => {
      throw new Error('It must have been rejected')
    }).catch((err) => {
      expect(err.message).to.equal('timeout')
    })
  })

  it('should not reject when racing promise resolved', async () => {
    timer.cancel = sinon.spy(timer.cancel)
    const promise = timer.timeout(200, timer.sleep(100).then(() => 'race'))
    expect(timer.cancel).to.be.not.called
    const value = await promise
    expect(timer.cancel).to.be.calledOnce
    expect(value).to.equal('race')
  })

  it('should reject with message', () => {
    return timer.timeout(100, timer.sleep(200), 'intentional').then(() => {
      throw new Error('It must have been rejected')
    }).catch((err) => {
      expect(err.message).to.equal('intentional')
    })
  })

  it('should resolve when `predicate` returns `true`', () => {
    let count = 0
    const predicate = () => {
      count++
      return count > 1
    }
    return Promise.all([
      timer.sleep(100).then(() => expect(count).to.equal(0)),
      timer.sleep(300).then(() => expect(count).to.equal(1)),
      timer.sleep(500).then(() => expect(count).to.equal(2)),
      timer.poll(predicate, 200).then(() => expect(count).to.equal(2))
    ])
  })
})
