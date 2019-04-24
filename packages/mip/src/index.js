/**
 * @file mip entry
 * @author sfe
 */

/* eslint-disable import/no-webpack-loader-syntax */

// import 'deps/promise'

function listen (element, eventType, listener, options) {
  element.addEventListener(eventType, listener, options)
  return () => element.removeEventListener(eventType, listener)
}

function listenOnce (element, eventType, listener, optEvtListenerOpts) {
  let unlisten = listen(element, eventType, event => {
    unlisten()
    listener(event)
  }, optEvtListenerOpts)
  return unlisten
}

function loadPromise (dom) {
  let promise = new Promise((resolve, reject) => {
    listenOnce(dom, 'load', resolve)
    listenOnce(dom, 'error', function (e) {
      console.log('b')
      reject(e)
    })
  })
  return promise
}

export default function load (img) {
  loadPromise(img)
}

