import main from 'src/index'

describe('Async Await', function () {
  it('should has not error', function () {
    return main()
    // let arr = []

    // async function fn() {
    //   try {
    //     await new Promise((resolve, reject) => {
    //       arr.push(function () {
    //         console.log('a')
    //         reject()
    //       })
    //     })
    //   }
    //   catch (e) {
    //     console.log('c')
    //   }
    // }

    // fn()

    // await new Promise(resolve => {
    //   arr.push(function () {
    //     console.log('b')
    //     resolve()
    //   })

    //   arr.forEach(item => item())
    // })
    // console.log('d')
  })

  // it('should also has not error', function main() {
  //   let arr = []

  //   function fn() {
  //     return new Promise((resolve, reject) => {
  //       arr.push(function () {
  //         console.log('a')
  //         reject()
  //       })
  //     })
  //     .catch(error => {
  //       console.log('c')
  //     })
  //   }

  //   fn()

  //   return new Promise(resolve => {
  //     arr.push(function () {
  //       console.log('b')
  //       resolve()
  //     })

  //     arr.forEach(item => item())
  //   })
  //   .then(() => {
  //     console.log('d')
  //   })
  // })
})
