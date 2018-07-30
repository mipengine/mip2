/* istanbul ignore file */
/**
 * @file   提供 iframe-shell/messenger 模块。
 * @author oott123
 */

/* global top HTMLIFrameElement */

// import Emitter from 'micro-event';
import Emitter from './util/event-emitter'
import fn from './util/fn'

const messageTypes = {
  twoWay: 'two-way'
}
const messageSentinels = {
  request: 'PM_REQUEST',
  response: 'PM_RESPONSE'
}

let messengerInstances = {}

function getSessionId () {
  return ((new Date()).getTime() * 1000 + Math.ceil(Math.random() * 1000)).toString(36)
}

function messageReceiver (event) {
  // 寻找对应的 messenger 实例
  let messenger = messengerInstances[event.data.name]
  if (!messenger) {
    // console.warn('A window with no messengers is sending message', event);
    // 兼容老 mip，没有给名字
    for (let x in messengerInstances) {
      messengerInstances[x].processMessageEvent(event)
    }
  } else {
    messenger.processMessageEvent(event)
  }
}

/**
 * iframe - window 单双向通信组件
 *
 * @constructor
 * @exports iframe-shell/messenger
 * @param {Object} config 实例参数
 * @param {Window} config.targetWindow  通信对端窗口（iframe; parent; top）
 * @param {string} config.targetOrigin  通信对端允许接收的 Origin
 * @param {string} config.sourceOrigins 允许的通信来源 Origin 列表
 * @param {number} config.timeout       双向通信回复超时(ms)
 * @param {string} config.name          若对端为 iframe，则填写 iframe.name；若对端为 parent，则填写 window.name(即父窗口的 iframe.name)
 */
class Messenger {
  constructor (config = {}) {
    Emitter.mixin(this)

    this.targetWindow = config.targetWindow || top
    this.targetOrigin = config.targetOrigin || '*'
    this.sourceOrigins = config.sourceOrigins || ['*']
    this.timeout = config.timeout || 500
    this.name = config.name || window.name

    /**
     * 存放回调处理函数 sessionId -> Object
     *
     * @private
     * @type    {Object}
     * @example {resolve: function, reject: function, timer: timerId}
     */
    this.defers = {}

    /**
     * 存放双向通信处理函数 eventName -> function
     *
     * @private
     * @type {Object}
     */
    this.handlers = {}

    if (messengerInstances[this.name]) {
      // console.warn(
      //   'The old messenger created for target %O will be replaced by the new one.',
      //   this.name
      // )
    }

    messengerInstances[this.name] = this
    Messenger.bindHandler()
  }

  static bindHandler () {
    window.removeEventListener('message', messageReceiver)
    window.addEventListener('message', messageReceiver)
  }

  /**
   * 处理消息事件
   *
   * @protected
   * @param  {MessageEvent} event 收到的 message event
   */
  processMessageEvent (event) {
    let origin = event.origin || event.originalEvent.origin
    let messenger = this
    // 检查 origin 是否安全
    let isSafe = false
    for (let i = 0; i < messenger.sourceOrigins.length; i++) {
      let safeOrigin = messenger.sourceOrigins[i]
      if (safeOrigin === '*') {
        isSafe = true
        break
      }
      if (safeOrigin === origin) {
        isSafe = true
        break
      }
    }
    if (!isSafe) {
      // console.warn('Origin ' + origin + ' is not safe, ignore event', event)
      return
    }
    // 检查单双向
    let eventData = event.data
    if (!eventData) {
      // console.warn('Event data %O is invalid, missing data.', event)
      return
    }
    // console.log(eventData);
    if (eventData.type === messageTypes.twoWay) {
      if (!eventData.sentinel || !eventData.sessionId) {
        // console.warn('Event data %O is invalid, missing sentinel or/and sessionId.', eventData)
        return
      }
      // 检查请求 or 回复
      if (eventData.sentinel === messageSentinels.request) {
        // 检查是否有对应的 handler
        let response = {}
        if (messenger.handlers[eventData.event]) {
          try {
            response = messenger.handlers[eventData.event].call(messenger, eventData)
          } catch (err) {
            response = {
              error: err
            }
          }
        } else {
          // console.warn('Event ' + eventData.event + ' has no handler.')
        }
        let send = response => {
          response = response || {}
          fn.extend(response, {
            type: messageTypes.twoWay,
            sentinel: messageSentinels.response,
            sessionId: eventData.sessionId,
            name: messenger.name
          })
          messenger.getWindow().postMessage(response, messenger.targetOrigin)
        }
        // 检查 promise
        if (response && (typeof response.then) === 'function') {
          response.then(response => send(response))
            .catch(err => send({error: err}))
        } else {
          send(response)
        }
      } else if (eventData.sentinel === messageSentinels.response) {
        // 回复
        // console.log('response!', eventData);
        let d = messenger.defers[eventData.sessionId]
        delete messenger.defers[eventData.sessionId]
        if (!d) {
          // console.warn('Event session is not found for two-way communication', eventData.sessionId)
          return
        }
        clearTimeout(d.timer)
        if (eventData.error) {
          d.reject(eventData.error)
        } else {
          d.resolve(eventData)
        }
      } else {
        // console.warn('Event sentinel is invalid ', eventData.sentinel)
      }
    } else {
      // 单向
      if (!eventData || !eventData.event) {
        // console.warn('Event data %O is invalid, missing event name.', eventData)
        return
      }
      messenger.trigger(eventData.event, eventData.data)
    }
  }

  /**
   * 给绑定的窗口发送消息
   *
   * @public
   * @param  {string}  eventName    消息名
   * @param  {Object}  data         消息数据；必须为 object
   * @param  {boolean} waitResponse 是否为双向消息（等待回复）
   * @return {Promise}              若为双向消息，则返回后 resolve；否则直接 resolve
   */
  sendMessage (eventName, data, waitResponse) {
    let messenger = this
    return new Promise((resolve, reject) => {
      let requestData = {
        name: messenger.name,
        event: eventName,
        sender: 'mip/2',
        data
      }
      let sessionId = getSessionId()
      if (waitResponse) {
        fn.extend(requestData, {
          type: messageTypes.twoWay,
          sentinel: messageSentinels.request,
          sessionId: sessionId
        })
        messenger.defers[sessionId] = {
          resolve: resolve.bind(this),
          reject: reject.bind(this),
          timer: setTimeout(() => {
            delete messenger.defers[sessionId]
            reject(new Error('timeout'))
          }, messenger.timeout)
        }
      } else {
        setTimeout(resolve, 0)
      }
      // 对于单向通信：requestData = {event, ...}
      // 对于双向通信：requestData = {event, type, sentinel, sessionId, ...}
      messenger.getWindow().postMessage(requestData, messenger.targetOrigin)
    })
  }

  /**
   * 设置双向消息处理函数
   *
   * @public
   * @param {string}   eventName 消息名字
   * @param {Function} fn        处理函数（return object or promise which solves with object）
   */
  setHandler (eventName, fn) {
    if ((typeof fn) !== 'function') {
      throw new Error('Invalid handler for event ' + eventName)
    }
    this.handlers[eventName] = fn
  }

  /**
   * 移除双向消息处理函数
   *
   * @public
   * @param  {string}   eventName 消息名字
   */
  removeHandler (eventName) {
    this.handlers[eventName] = undefined
  }

  /**
   * 销毁消息处理器
   *
   * @public
   */
  destory () {
    delete messengerInstances[this.name]
  }

  getWindow () {
    if (this.targetWindow instanceof HTMLIFrameElement) {
      return this.targetWindow.contentWindow
    }
    return this.targetWindow
  }
}

export default Messenger
