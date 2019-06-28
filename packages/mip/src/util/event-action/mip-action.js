import {handleScrollTo} from '../../page/util/ease-scroll'
import viewer from '../../viewer'

function isObjective (args) {
  let arg = args[0]
  if (typeof arg === 'object') {
    return true
  }
  return false
}

function scrollTo (...args) {
  const {id} = args
  if (!id) {
    return
  }
  const target = document.getElementById(id)
  handleScrollTo(target, args)
}

function navigateTo ({args}) {
  const {url, target, opener} = data
  viewer.navigateTo(url, target, opener)
}

/**
 * 关闭窗口，如果不能关闭，跳转到目标地址
 * 作为打开新窗的后退操作
 */
function closeOrNavigateTo () {
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
    navigateTo(data)
  }
}

function goBack () {
  window.history.back()
}

function print () {
  window.print()
}

const setData = () => MIP.setData()
const getData = () => MIP.getData()
// const $set = MIP.$set

export const mipAction = {
  setData,
  getData,
  // $set,
  scrollTo,
  navigateTo,
  closeOrNavigateTo,
  goBack,
  print
}