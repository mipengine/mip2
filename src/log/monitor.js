/**
 * @file monitor.js
 * @description 监控数据监控处理
 * @author schoeu
 */

const ls = require('./logSend');
let tags = require('./coreTags');
const RATE = 0.1;

if (!Array.isArray(tags)) {
    tags = [];
}

tags = tags.filter((it = '') => !!it.trim());

/**
 * MIP错误捕获处理
 *
 * @param {Object} e 错误事件对象
 */
function errorHandle(e = {}) {
    // 报错文件请求路径, 跨域js文件中错误无信息暂不上报
    let filename = e.filename || '';

    if (!filename) {
        return;
    }

    // 错误信息
    let message = e.message || '';

    // 错误行号
    let lineno = e.lineno || '';

    // 错误列号
    let colno = e.colno || 0;

    // 非百度cnd域名忽略
    if (!/(c\.mipcdn|mipcache\.bdstatic)\.com\/static\/v1/.test(filename)) {
        return;
    }

    let tagInfo = /\/(mip-.+)\//g.exec(filename) || [];
    let tagName = tagInfo[1] || '';
    let sampling = Math.random() <= RATE;

    // 只记录官方组件错误
    if (tags.indexOf(tagName) > -1 && sampling) {
        // 数据处理
        let logData = {
            file: filename,
            msg: message,
            ln: lineno,
            col: colno || (window.event && window.event.errorCharacter) || 0,
            href: window.location.href
        };
        setTimeout(() => ls.sendLog('mip-stability', logData), 0);
        // 其他善后处理
    }
}

window.removeEventListener('error', errorHandle);
window.addEventListener('error', errorHandle);
