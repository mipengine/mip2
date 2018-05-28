/**
 * @file demo mip-hello component
 * @author wangyisheng@baidu.com (wangyisheng)
 */

/* global mip */
mip.registerVueCustomElement('mip-hello', {
    template: '<h2 @click="getData">click me to get contacts data</h2>',
    methods: {
        ...mip.Store.mapMutations('global', ['setData']),

        getData() {
            fetch('/examples/store/testdata2.json', {
                credentials: 'include'
            }).then(res => {
                if (res.ok) {
                    res.json().then(data => {
                        this.setData(data);
                    });
                }
                else {
                    console.error('Fetch request failed!');
                }
            }).catch(function (e) {
                console.error(e);
            });
        }
    }
});
