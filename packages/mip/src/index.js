/**
 * @file mip entry
 * @author sfe
 */

/* eslint-disable import/no-webpack-loader-syntax */

import 'deps/promise'

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
    listenOnce(dom, 'load', function () {
      console.log('resolve')
      resolve()
    })
    listenOnce(dom, 'error', function (e) {
      console.log('a')
      reject(e)
    })
  })
  return promise
}

async function layoutCallback (dom) {
  let img = new Image()
  img.setAttribute('src', dom.getAttribute('src'))
  dom.appendChild(img)

  try {
    await loadPromise(img)
  }
  catch (e) {
    console.log('c')
  }
}

export default function viewportCallback (img) {
  layoutCallback(img)
}

