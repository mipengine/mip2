/**
 * @file mip-test.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

 /* global mip */



mip.registerVueCustomElement('mip-a', {
    template: `
        <div >
            haha a

            <hr>

            <span @click="onClick">click me</span>
        </div>
    `,
    created() {
        // 绑定事件，其它元素可通过 on='xxx' 触发
        // this.addEventAction('custom_event', function (event /* 对应的事件对象 */ , str /* 事件参数 */ ) {
        //     console.log(str); // undefined or 'test_button' or 'test_button1'
        // });
    },
    // createdVue() {
    //     console.log('createdvue');
    //     // this.addEventAction('customevent', function (event, str) {
    //     //     console.log('get customevent');
    //     // });
    // },
    methods: {
        onClick() {
            console.log('emit customevent');
            this.$emit('customevent', {userInfo: 'huanghuiqun'});
            // console.log('onClick');
            // mip.viewer.eventAction.execute('eventName', null, {form: 'a'});
        }
    }
});
