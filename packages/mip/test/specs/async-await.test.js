import create from 'src/index'

describe.only('Async Await', function () {
  it('should has not error', async function () {
    let obj = create()
    await new Promise(resolve => {
      obj.on(resolve)
      obj.dispatch()
    })
    console.log('d')
  })
})
