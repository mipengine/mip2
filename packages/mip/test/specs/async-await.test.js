import viewportCallback from 'src/index'

describe.only('Async Await', function () {
  it('should has not error', async function () {
    let div = document.createElement('div')
    document.body.appendChild(div)
    div.setAttribute('src', 'https://www.wrong.org?test=1')
    viewportCallback(div)

    let img = div.querySelector('img')

    await new Promise(resolve => {
      img.addEventListener('error', function () {
        console.log('b')
        resolve()
      })
      let err = new Event('error')
      img.dispatchEvent(err)
    })
    console.log('d')
  })
})
