/**
 * @file mip-image
 * @author sfe
 */

/* global MIP */

MIP.mip.registerVueCustomElement('mip-list', {
    template: `
        <div class="mip-list">
            <div class="mip-list-item" v-for="item in list">
                <p> {{ item.name }} </p>
                <p> {{ item.sex }} </p>
            </div>
        </div>
    `,
    data() {
        return {
            list: [
                {
                    name: 'David',
                    sex: 'F'
                },
                {
                    name: 'Trump',
                    sex: '?'
                }
            ]
        };
    },

    asyncData() {
        let me = this;
        fetch('./data.json').then(res => {
            res.json().then(data => {
                console.log(data);
                me.list = me.list.concat(data);
            });
        });
    },

    syncData() {
        console.log('------------ in syncData');
    },

    initState() {
        console.log('------------ in initState');
    }
});
