/**
 * @file mip-init
 * @author sfe
 */

/* global mip */

let count = 0;

mip.registerVueCustomElement('mip-init', {
    template: `
        <div class="wrapper">
            <h2>moduleName: {{moduleName}}</h2>
            <ul v-if="tabNames && tabNames.length" class="list">
                <li v-for="name in tabNames">{{name}}</li>
            </ul>
            <p @click="changeName('test')">click me to change moduleNam to: test</p>
        </div>
    `,
    props: {
        src: String,
        model: {
            default() {
                return {};
            },
            type: Object
        }
    },
    initStore() {
        return {
            namespace: 'mip/init',
            module: {
                state() {
                    return {
                        moduleName: 'mipInit',
                        tabs: [
                            {
                                name: 'tab1'
                            },
                            {
                                name: 'tab2'
                            },
                            {
                                name: 'tab3'
                            }
                        ]
                    };
                },
                mutations: {
                    ['CHANGE_NAME'](state, name) {
                        state.moduleName = name;
                    }
                },
                actions: {
                    changeName({commit}, name) {
                        commit('CHANGE_NAME', name + (count++));
                    }
                },
                getters: {
                    tabNames(state) {
                        return state.tabs.map(t => t.name);
                    }
                }
            }
        };
    },
    computed: {
        ...mip.Store.mapState('mip/init', ['moduleName']),
        ...mip.Store.mapGetters('mip/init', ['tabNames'])
    },

    methods: {
        ...mip.Store.mapActions('mip/init', [
            'changeName'
        ])
    }
});
