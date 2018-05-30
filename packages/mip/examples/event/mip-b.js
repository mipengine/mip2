/**
 * @file mip-test.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

/* global MIP */



MIP.registerVueCustomElement('mip-b', {
    template: `
        <div @click="onClick"> haha b </div>
    `,
    created() {
        console.log('b: created');
    },
    methods: {
        onClick() {
            console.log('onClick');
            MIP.viewer.eventAction.execute('eventName', null, {
                form: 'b'
            });
        }
    }
});

