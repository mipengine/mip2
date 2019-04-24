import load from 'src/index'

describe.only('Async Await', function () {
  it('should has not error', async function () {
    let div = document.createElement('div')
    document.body.appendChild(div)
    div.innerHTML = '<img src="https://www.wrong.org?test=1">'
    let img = div.querySelector('img')

    load(img)

    await new Promise(resolve => {
      img.addEventListener('error', function () {
        console.log('c')
        resolve()
      })
      let err = new Event('error')
      img.dispatchEvent(err)
    })
    console.log('d')
  })
})
