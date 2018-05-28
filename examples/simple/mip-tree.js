/**
 * @file demo data
 * @author sfe
 */

/* global mip */

// define the item component
mip.registerVueCustomElement('mip-item', {
    template: '#item-template',
    props: {
        model: {
            default() {
                return {};
            },
            type: Object
        }
    },
    data() {
        return {
            open: false
        };
    },
    computed: {
        ...mip.Store.mapState('test', ['count']),
        isFolder() {
            return this.model.children && this.model.children.length;
        }
    },
    methods: {
        ...mip.Store.mapMutations('test', ['addCount']),
        toggle() {
            this.addCount();
            console.log(this.count);
            if (this.isFolder) {
                this.open = !this.open;
            }
        },
        changeType() {
            if (!this.isFolder) {
                mip.Vue.set(this.model, 'children', []);
                this.addChild();
                this.open = true;
            }
        },
        addChild() {
            this.model.children.push({
                name: 'new stuff'
            });
        },

        stringify(data) {
            return JSON.stringify(data);
        }
    }
});
