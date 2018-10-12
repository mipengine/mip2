/**
 * @file performanece analyzer
 * @author mj(zoumiaojiang@gmail.com)
 */

(function () {
  function processor (event) {
    var data = event.data
    if (data.event === 'performance-update') {
      // @TODO: MIP2 暂时有 bug
      if (data.data && data.data.data) {
        data = data.data.data
      } else {
        data = data.data
      }
      if (data.MIPStart) {
        var baseTime = +data.navigationStart
        var domLoadTime = +data.MIPStart - baseTime
        document.querySelector('#load-page-time').innerHTML = domLoadTime
        if (data.MIPDomContentLoaded) {
          var domReadyTime = +data.MIPDomContentLoaded - data.MIPStart
          document.querySelector('#dom-ready-time').innerHTML = domReadyTime
          if (data.MIPFirstScreen) {
            var firstScreenTime = +data.MIPFirstScreen - data.MIPDomContentLoaded
            document.querySelector('#first-screen-time').innerHTML = firstScreenTime
          }
        }
      }
    }
  }

  window.addEventListener('message', processor)
})()
