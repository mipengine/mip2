describe.only('Async Await', function () {
  it('should has not error', async function main() {
    let arr = []

    async function fn() {
      try {
        await new Promise((resolve, reject) => {
          arr.push(function () {
            console.log('a')
            reject()
          })
        })
      }
      catch (e) {
        console.log('c')
      }
    }

    fn()

    await new Promise(resolve => {
      arr.push(function () {
        console.log('b')
        resolve()
      })

      arr.forEach(item => item())
    })

    console.log('d')
  })
})
