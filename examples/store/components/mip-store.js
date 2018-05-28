/**
 * @file mip-store
 * @author sfe
 */

/* global mip */

mip.registerVueCustomElement('mip-store', {
    template: '<!-- mip-store -->',
    props: {
        src: String,
        model: {
            default() {
                return {};
            },
            type: Object
        }
    },
    created() {
        if (this.src) {
            this.getDataBySrc(this.src);
        }
        else if (typeof this.model === 'object' && Object.keys(this.model).length !== 0) {
            this.register(this.model);
        }
    },
    methods: {
        getDataBySrc(url) {
            if (!url) {
                return {};
            }

            fetch(this.src, {
                credentials: 'include'
            }).then(res => {
                if (res.ok) {
                    res.json().then(data => {
                        this.register(data);
                    });
                }
                else {
                    console.error('Fetch request failed!');
                }
            }).catch(function (e) {
                console.error(e);
            });
        },

        register(data) {
            if (this.$store.state.global) {
                data = Object.assign({}, this.$store.state.global, data);
            }
            this.$store.registerModule('global', {
                state: () => data,
                mutations: {
                    setData(state, data) {
                        state = Object.assign(state, data);
                    }
                },
                namespaced: true
            });

            this.eventEmit();
        },

        eventEmit() {
            let globalStoreRegisteredEvent = mip.util.event.create('global-store-registered');
            document.dispatchEvent(globalStoreRegisteredEvent);
        }
    }
});
