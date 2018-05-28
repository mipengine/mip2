
/**
 * @file logSend.js
 * @description 数据上报处理
 * @author schoeu
 */

export default {
    data: {},

    /**
     * 数据上报逻辑
     *
     * @param {*} type type
     * @param {*} msg msg
     */
    sendLog(type, msg = {}) {
        if (!type) {
            return;
        }
        msg.type = type;
        this.data.event = 'log';
        this.data.data = msg || {};

        if (window !== window.top) {
            window.parent.postMessage(this.data, '*');
        }
    }
};
