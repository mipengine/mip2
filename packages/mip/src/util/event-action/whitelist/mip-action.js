import {handleScrollTo} from '../../../page/util/ease-scroll'
import viewer from '../../../viewer'

// function isObjective (args) {
//   let arg = args[0]
//   if (typeof arg === 'object') {
//     return true
//   }
//   return false
// }

function scrollTo ({id, duration, position}) {
  // let param = {}
  // let id = ''
  // if (isObjective(args)) {
  //   param = args[0]
  //   id = param.id
  // } else {
  //   id = args[0]
  //   param = {
  //     duration: args[1],
  //     position: args[2]
  //   }
  // }
  if (!id) {
    return
  }
  const target = document.getElementById(id)
  handleScrollTo(target, {duration, position})
}

function navigateTo ({url, target, opener}) {
  // const {url, target, opener} = data
  // let url
  // let target
  // let opener
  // if (isObjective(args)) {
  //   const param = args[0]
  //   url = param.url
  //   target = param.target
  //   opener = param.opener
  // } else {
  //   url = args[0]
  //   target = args[1]
  //   opener = args[2]
  // }
  viewer.navigateTo(url, target, opener)
}

/**
 * 关闭窗口，如果不能关闭，跳转到目标地址
 * 作为打开新窗的后退操作
 */
function closeOrNavigateTo (args) {
  const hasParent = window.parent != window
  // 顶层 window 并且是被打开的 window 才能关闭
  const canBeClosed = window.opener && !hasParent

  let closed = false
  if (canBeClosed) {
    window.close()
    // 可能被浏览器 block，没有关闭
    closed = window.closed
  }

  if (!closed) {
    navigateTo(args)
  }
}

function goBack () {
  window.history.back()
}

function print () {
  window.print()
}

function setData (args) {
  MIP.setData(args)
}

// function getData (args) {
//   MIP.getData()
// }

// const setData = (...args) => MIP.setData(...args)
// const getData = (...args) => MIP.getData(...args)
// const $set = MIP.$set

export const actions = {
  setData,
  // getData,
  // $set,
  scrollTo,
  navigateTo,
  closeOrNavigateTo,
  goBack,
  print
}

export default function mipAction ({property, args}) {
  let action = actions[property]
  if (action) {
    action(...args)
  } else {
    throw new Error(`不支持 MIP.${property} 全局方法`)
  }
}



