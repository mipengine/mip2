

const MIP_DATA_CHANGES = []

let dataChangePending = false

export function notifyDataChange (changes) {
  // @TODO 利用变动信息对 bind 属性控制得更精细些
  if (!changes.length) {
    return
  }

  mergeChange(changes)

  if (!dataChangePending) {
    dataChangePending = true
    nextTick(flushChange)
  }
}

function mergeChange (changes) {
  // 合并修改
  for (let change of changes) {
    let i
    let max = MIP_DATA_CHANGES.length
    for (i = 0; i < max; i++) {
      let stored = MIP_DATA_CHANGES[i]
      if (change.expr.indexOf(stored.expr) === 0) {
        break
      }
      if (stored.expr.indexOf(change.expr) === 0) {
        MIP_DATA_CHANGES.splice(i, 1)
        MIP_DATA_CHANGES.push(change)
        break
      }
    }
    if (i === max) {
      MIP_DATA_CHANGES.push(change)
    }
  }
}

function flushChange () {
  dataChangePending = false
  flushBindingAttribues()
  flushDataWatching()
}

function flushBindingAttribues () {
  for (let node of bindingElements) {
    try {
      applyBindingAttributes(node)
    } catch (e) {
      logger.error(e)
    }
  }
}

function flushDataWatching () {
  let copies = MIP_DATA_CHANGES.slice()
  MIP_DATA_CHANGES.length = 0

  let watchExprs = Object.keys(MIP_DATA_WATCHES)
  for (let i = 0; i < copies.length; i++) {
    let change = copies[i]
    let { expr: changeExpr, value: oldValue } = change
    for (let j = 0; j < watchExprs.length; j++) {
      let watchExpr = watchExprs[j]
      if (watchExpr.indexOf(changeExpr) !== 0) {
        continue
      }
      watchExprs.splice(j, 1)
      let callbacks = MIP_DATA_WATCHES[watchExpr]
      let newVal = getData(watchExpr)
      let oldVal
      if (watchExpr === changeExpr) {
        oldVal = oldValue
      } else {
        let restExpr = watchExpr.slice(changeExpr.length + 1)
        oldVal = getData(restExpr, oldValue)
      }
      for (let callback of callbacks) {
        try {
          callback(newVal, oldVal)
        } catch (e) {
          logger.error(e)
        }
      }
    }
  }
}

