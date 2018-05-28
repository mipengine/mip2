/**
 * @file mip-test.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

/* global mip */



mip.registerVueCustomElement('mip-b', {
    template: `<div @click="onClick"> haha b </div>`,
    created() {
        console.log('b: created');
    },
    methods: {
        onClick() {
            console.log('onClick');
            mip.viewer.eventAction.execute('eventName', null, {
                form: 'b'
            });
        }
    }
});

